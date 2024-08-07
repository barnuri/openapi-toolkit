import { writeFileSync } from 'fs';
import { ApiPath } from '../../models/ApiPath';
import { join } from 'path';
import { capitalize, makeDirIfNotExist } from '../../helpers';
import { CSharpGenerator } from '../CSharpGenerator';

export class CSharpClientGenerator extends CSharpGenerator {
    mainExportFile = join(this.options.output, 'Client.cs');
    generateClient(): void {
        this.generateBaseController();
        const nullableMark = !this.options.disableNullable ? '?' : '';
        const controllerPropsNames = this.parsingResult.controllersNames.map(x => this.getControllerName(x));
        const controllerProps = controllerPropsNames.map(x => `\tpublic ${x} ${x} { get; private set; }`).join('\n') + '\n';
        const controllerPropsCtor = controllerPropsNames.map(x => `\t\t${x} = new ${x} { ClientSettings = ClientSettings };`).join('\n');

        let mainFileContent = `public class Client
{
    public ClientSettings ClientSettings { get; set; }
${controllerProps}

    public Client(ClientSettings${nullableMark} clientSettings = null)
    {
        ClientSettings = clientSettings ?? new ClientSettings();
        ClientSettings.HttpClient = ClientSettings.HttpClient ?? new HttpClient();
        var defaultJsonSerializerSettings = new JsonSerializerSettings
        {
            TypeNameHandling = TypeNameHandling.Objects,
            StringEscapeHandling = StringEscapeHandling.EscapeNonAscii,
            NullValueHandling = NullValueHandling.Ignore
        };
        defaultJsonSerializerSettings.Converters.Add(new Newtonsoft.Json.Converters.StringEnumConverter());
        ClientSettings.JsonSerializerSettings = ClientSettings.JsonSerializerSettings ?? defaultJsonSerializerSettings;
${controllerPropsCtor}
    }
}`;
        writeFileSync(this.mainExportFile, this.addNamespace(mainFileContent));

        const clientSettingsContent = `public class ClientSettings
{
    public string BaseUrl { get; set; }
    public HttpClient HttpClient { get; set; }
    public bool ValidateStatusCode { get; set; } = true;
    public bool ErrorExtractResponseBody { get; set; } = true;
    public JsonSerializerSettings JsonSerializerSettings { get; set; }
    public Func<HttpRequestMessage, Task> PreRequest { get; set; } = (_) => Task.CompletedTask;
    public Func<HttpRequestMessage, HttpResponseMessage, Task> PostRequest { get; set; } = (_, __) => Task.CompletedTask;
}
`;
        writeFileSync(join(this.options.output, 'ClientSettings.cs'), this.addNamespace(clientSettingsContent));
    }
    generateController(controller: string, controlerPaths: ApiPath[]): void {
        const controllerName = this.getControllerName(controller);
        makeDirIfNotExist(this.controllersFolder);
        let controllerContent = ``;
        controllerContent += `public class ${controllerName} : BaseController \n{\n`;
        controllerContent += this.generateControllerMethodsContent(controller, controlerPaths);
        controllerContent += `}`;
        const controllerFile = join(this.controllersFolder, controllerName + this.getFileExtension(false));
        writeFileSync(controllerFile, '\n' + this.addNamespace(controllerContent));
    }
    generateControllerMethodContent(controller: string, controllerPath: ApiPath) {
        const methodName = capitalize(this.getMethodName(controllerPath));
        let requestType = controllerPath.body.haveBody ? this.getPropDesc(controllerPath.body.schema) : 'object';
        const responseType = this.getPropDesc(controllerPath.response);
        const bodyParam = controllerPath.body.haveBody
            ? `${requestType}${!controllerPath.body.required && !this.options.disableNullable ? `?` : ''} body, `
            : '';
        const headers = [...controllerPath.cookieParams, ...controllerPath.headerParams];
        const haveHeaderParams = headers.length > 0;
        const headersParams = haveHeaderParams
            ? headers
                  .map(x => `string${x.required || this.options.disableNullable ? '' : '?'} h${capitalize(x.name)} = default`)
                  .join(', ') + `, `
            : ``;
        const pathParams =
            controllerPath.pathParams.length > 0
                ? controllerPath.pathParams
                      .map(
                          x =>
                              `${this.getPropDesc(x.schema!)}${x.required || this.options.disableNullable ? '' : '?'} p${capitalize(x.name)} = default`,
                      )
                      .join(', ') + ', '
                : ``;
        let url = controllerPath.path;
        for (const pathParam of controllerPath.pathParams) {
            url = url.replace('{' + pathParam.name + '}', `{p${capitalize(pathParam.name)}}`);
        }
        const haveQueryParams = controllerPath.queryParams.length > 0;
        url += !haveQueryParams ? '' : '?' + controllerPath.queryParams.map(x => `${x.name}={q${capitalize(x.name)}}`).join('&');
        const queryParams = haveQueryParams
            ? controllerPath.queryParams
                  .map(
                      x =>
                          `${this.getPropDesc(x.schema!)}${x.required || this.options.disableNullable ? '' : '?'} q${capitalize(x.name)} = default`,
                  )
                  .join(', ') + ', '
            : ``;

        let methodCommonText = `\t\t\t"${capitalize(controllerPath.method.toLowerCase())}",\n`;
        methodCommonText += `\t\t\t\$"${url}\",\n`;
        methodCommonText += `\t\t\t${controllerPath.body.haveBody ? 'body' : 'default'},\n`;
        methodCommonText += `\t\t\t`;
        const nullableMark = !this.options.disableNullable ? '?' : '';
        if (haveHeaderParams) {
            methodCommonText += `new Dictionary<string, string${nullableMark}>()\n`;
            methodCommonText += `\t\t\t{\n`;
            for (const headerParam of headers) {
                methodCommonText += `\t\t\t\t["${headerParam.name}"] = h${capitalize(headerParam.name)},\n`;
            }
            methodCommonText += `\t\t\t}\n`;
        } else {
            methodCommonText += 'default\n';
        }
        methodCommonText += `\t\t);\n`;
        methodCommonText += `\t}\n`;
        const methodParams = `${bodyParam}${pathParams}${queryParams}${headersParams}`;

        let methodContent = '';
        // method one
        methodContent += `\tpublic Task<${responseType}${nullableMark}> ${methodName}Async(${methodParams}) \n\t{\n`.replace(', )', ')');
        methodContent += `\t\treturn Method<${requestType},${responseType}${nullableMark}>(\n`;
        methodContent += methodCommonText;

        // method two
        methodContent += `\tpublic Task<T${nullableMark}> ${methodName}Async<T>(${methodParams}) \n\t{\n`.replace(', )', ')');
        methodContent += `\t\treturn Method<${requestType},T${nullableMark}>(\n`;
        methodContent += methodCommonText;

        // method three
        const genericBodyParam = controllerPath.body.haveBody ? `S body, ` : '';
        const genericBodyMethodParams = `${genericBodyParam}${pathParams}${queryParams}${headersParams}`;
        methodContent += `\tpublic Task<T${nullableMark}> ${methodName}Async<T, S>(${genericBodyMethodParams}) \n\t{\n`.replace(', )', ')');
        methodContent += `\t\treturn Method<S,T${nullableMark}>(\n`;
        methodContent += methodCommonText;

        // method four
        methodContent += `\tpublic Task<string${nullableMark}> ${methodName}ContentAsync(${methodParams}) \n\t{\n`.replace(', )', ')');
        methodContent += `\t\treturn Method<${requestType}>(\n`;
        methodContent += methodCommonText;

        // method five
        methodContent += `\tpublic Task<string${nullableMark}> ${methodName}ContentAsync<S>(${genericBodyMethodParams}) \n\t{\n`.replace(
            ', )',
            ')',
        );
        methodContent += `\t\treturn Method<S>(\n`;
        methodContent += methodCommonText;

        return { methodContent, methodName };
    }
    generateBaseController() {
        const nullableMark = !this.options.disableNullable ? '?' : '';

        const usings = `using System;
using Newtonsoft.Json;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
`;

        const errorClass = `public class ExceptionWithRequest : Exception
{
    public HttpResponseMessage${nullableMark} Response { get; set; }
    public HttpRequestMessage${nullableMark} Request { get; set; }
    public string${nullableMark} ResponseBody { get; set; }

    public ExceptionWithRequest()
    {
    }

    public ExceptionWithRequest(string${nullableMark} message) : base(message)
    {
    }

    public ExceptionWithRequest(string${nullableMark} message, Exception${nullableMark} innerException) : base(message, innerException)
    {
    }

    protected ExceptionWithRequest(SerializationInfo info, StreamingContext context) : base(info, context)
    {
    }
}`;
        const exUsing = `using System;
using System.Net.Http;
using System.Runtime.Serialization;
`;
        writeFileSync(join(this.options.output, 'ExceptionWithRequest.cs'), this.addNamespace(errorClass, exUsing));
        const baseControllerContent = `public class BaseController
{
    public ClientSettings ClientSettings { get; set; }

    protected async Task<S${nullableMark}> Method<T, S>(string method, string path, T${nullableMark} body, Dictionary<string, string${nullableMark}>${nullableMark} headers)
    {
        var json = await Method(method, path, body, headers) ?? string.Empty;
        var res = JsonConvert.DeserializeObject<S>(json, ClientSettings.JsonSerializerSettings);
        return res;
    }

    protected async Task<string${nullableMark}> Method<T>(string method, string path, T${nullableMark} body, Dictionary<string, string${nullableMark}>${nullableMark} headers)
    {
        var req = new HttpRequestMessage
        {
            Method = new HttpMethod(method),
            RequestUri = new Uri($"{ClientSettings.BaseUrl.TrimEnd('/')}/{path.TrimStart('/')}"),
            Content = new StringContent(JsonConvert.SerializeObject(body), null, "application/json"),
        };
        headers?.Keys.ToList().ForEach(x => req.Headers.TryAddWithoutValidation(x, headers[x]));
        await ClientSettings.PreRequest?.Invoke(req);
        var res = await ClientSettings.HttpClient.SendAsync(req);
        await ClientSettings.PostRequest?.Invoke(req, res);
        if (ClientSettings.ValidateStatusCode && (int)res.StatusCode > 299)
        {
            var responseBody = res == null || !ClientSettings.ErrorExtractResponseBody 
                ? null
                : await res.Content.ReadAsStringAsync();
            throw new ExceptionWithRequest($"http error {res.StatusCode}") 
            { 
                Request = req, 
                Response = res, 
                ResponseBody = responseBody,
            };
        }
        var content = await res.Content.ReadAsStringAsync();
        return content;
    }
}
`;
        writeFileSync(join(this.options.output, 'BaseController.cs'), this.addNamespace(baseControllerContent));
    }
}
