import { writeFileSync } from 'fs';
import { ApiPath } from '../../models/ApiPath';
import { join } from 'path';
import { capitalize, makeDirIfNotExist } from '../../helpers';
import { CSharpGenerator } from '../CSharpGenerator';

export class CSharpClientGenerator extends CSharpGenerator {
    mainExportFile = join(this.options.output, 'Client.cs');
    generateClient(): void {
        this.generateBaseController();
        const controllerPropsNames = this.controllersNames.map(x => this.getControllerName(x));
        const controllerProps = controllerPropsNames.map(x => `\tpublic ${x} ${x} { get; private set; }`).join('\n') + '\n';
        const controllerPropsCtor =
            controllerPropsNames
                .map(x => `\t\t${x} = new ${x} { BaseUrl = BaseUrl, HttpClient = HttpClient, JsonSerializerSettings = JsonSerializerSettings };`)
                .join('\n') + '\n';

        let mainFileContent = `
public class Client
{
    public string BaseUrl { get; set; }
    public HttpClient HttpClient { get; set; }
    public JsonSerializerSettings JsonSerializerSettings { get; set; }
${controllerProps}

    public Client(string baseUrl, HttpClient? httpClient = null, JsonSerializerSettings? jsonSerializerSettings = null)
    {
        BaseUrl = baseUrl;
        HttpClient = httpClient ?? new HttpClient();
        var defaultJsonSerializerSettings = new JsonSerializerSettings
        {
            TypeNameHandling = TypeNameHandling.Objects,
            StringEscapeHandling = StringEscapeHandling.EscapeNonAscii,
            NullValueHandling = NullValueHandling.Ignore
        };
        defaultJsonSerializerSettings.Converters.Add(new Newtonsoft.Json.Converters.StringEnumConverter());
        JsonSerializerSettings = jsonSerializerSettings ?? defaultJsonSerializerSettings;
${controllerPropsCtor}
    }
}`;
        writeFileSync(this.mainExportFile, 'using System.Net.Http;\n' + this.addNamespace(mainFileContent));
    }
    generateController(controller: string, controlerPaths: ApiPath[]): void {
        const controllerName = this.getControllerName(controller);
        makeDirIfNotExist(this.controllersFolder);
        let controllerContent = ``;
        controllerContent += `public class ${controllerName} : BaseController \n{\n`;
        controllerContent += this.generateControllerMethodsContent(controller, controlerPaths);
        controllerContent += `}`;
        const controllerFile = join(this.controllersFolder, controllerName + this.getFileExtension(false));
        const usings = `using System;
        using Newtonsoft.Json;
        using System.Collections.Generic;
        using System.Linq;
        using System.Net.Http;
        using System.Threading.Tasks;
        using System.Runtime.Serialization;`
        writeFileSync(controllerFile, '\n' + this.addNamespace(controllerContent, usings));
    }
    generateControllerMethodContent(controller: string, controllerPath: ApiPath): string {
        const methodName = capitalize(this.getMethodName(controllerPath));
        let requestType = controllerPath.body.haveBody ? this.getPropDesc(controllerPath.body.schema) : 'object';
        const responseType = this.getPropDesc(controllerPath.response);
        const bodyParam = controllerPath.body.haveBody ? `${requestType}${!controllerPath.body.required ? `?` : ''} body, ` : '';
        const headers = [...controllerPath.cookieParams, ...controllerPath.headerParams];
        const haveHeaderParams = headers.length > 0;
        const headersParams = haveHeaderParams ? headers.map(x => `string${x.required ? '' : '?'} h${capitalize(x.name)} = default`).join(', ') + `, ` : ``;
        const pathParams =
            controllerPath.pathParams.length > 0
                ? controllerPath.pathParams.map(x => `${this.getPropDesc(x.schema!)}${x.required ? '' : '?'} p${capitalize(x.name)} = default`).join(', ') +
                  ', '
                : ``;
        let url = controllerPath.path;
        for (const pathParam of controllerPath.pathParams) {
            url = url.replace('{' + pathParam.name + '}', `{p${capitalize(pathParam.name)}}`);
        }
        const haveQueryParams = controllerPath.queryParams.length > 0;
        url += !haveQueryParams ? '' : '?' + controllerPath.queryParams.map(x => `${x.name}={q${capitalize(x.name)}}`).join('&');
        const queryParams = haveQueryParams
            ? controllerPath.queryParams.map(x => `${this.getPropDesc(x.schema!)}${x.required ? '' : '?'} q${capitalize(x.name)} = default`).join(', ') + ', '
            : ``;

        let methodCommonText = `\t\t\t"${capitalize(controllerPath.method.toLowerCase())}",\n`;
        methodCommonText += `\t\t\t\$"${url}\",\n`;
        methodCommonText += `\t\t\t${controllerPath.body.haveBody ? 'body' : 'null'},\n`;
        methodCommonText += `\t\t\t`;
        if (haveHeaderParams) {
            methodCommonText += 'new Dictionary<string, string?>()\n';
            methodCommonText += `\t\t\t{\n`;
            for (const headerParam of headers) {
                methodCommonText += `\t\t\t\t["${headerParam.name}"] = h${capitalize(headerParam.name)},\n`;
            }
            methodCommonText += `\t\t\t}\n`;
        } else {
            methodCommonText += 'null\n';
        }
        methodCommonText += `\t\t);\n`;
        methodCommonText += `\t}\n`;
        const methodParams = `${bodyParam}${pathParams}${queryParams}${headersParams}`;

        let methodContent = '';
        // method one
        methodContent += `\tpublic Task<${responseType}?> ${methodName}(${methodParams}) \n\t{\n`.replace(', )', ')');
        methodContent += `\t\treturn Method<${requestType},${responseType}?>(\n`;
        methodContent += methodCommonText;

        // method two
        methodContent += `\tpublic Task<T?> ${methodName}Async<T>(${methodParams}) \n\t{\n`.replace(', )', ')');
        methodContent += `\t\treturn Method<${requestType},T?>(\n`;
        methodContent += methodCommonText;
        // method three
        methodContent += `\tpublic Task<string?> ${methodName}ContentAsync(${methodParams}) \n\t{\n`.replace(', )', ')');
        methodContent += `\t\treturn Method<${requestType}>(\n`;
        methodContent += methodCommonText;
        return methodContent;
    }
    generateBaseController() {
        const controllerBaseFile = join(this.options.output, 'BaseController.cs');
        const baseControllerContent = `public class BaseController
{
    public string BaseUrl { get; set; }
    public HttpClient HttpClient { get; set; } = new HttpClient();
    public JsonSerializerSettings JsonSerializerSettings { get; set; }
    protected async Task<S?> Method<T, S>(string method, string path, T? body, Dictionary<string, string?>? headers) where T : class
    {
        var json = await Method(method, path, body, headers) ?? string.Empty;
        var res = JsonConvert.DeserializeObject<S>(json, JsonSerializerSettings);
        return res;
    }
    protected async Task<string?> Method<T>(string method, string path, T? body, Dictionary<string, string?>? headers) where T : class
    {
        var req = new HttpRequestMessage
        {
            Method = new HttpMethod(method),
            RequestUri = new Uri($"{BaseUrl.TrimEnd('/')}/{path.TrimStart('/')}"),
            Content = new StringContent(JsonConvert.SerializeObject(body), null, "application/json"),
        };
        headers?.Keys.ToList().ForEach(x => req.Headers.TryAddWithoutValidation(x, headers[x]));
        var res = await HttpClient.SendAsync(req);
        if ((int)res.StatusCode > 299)
        {
            throw new ExceptionWithRequest($"http error {res.StatusCode}") { Request = req, Response = res };
        }
        var content = await res.Content.ReadAsStringAsync();
        return content;
    }
}

public class ExceptionWithRequest : Exception
{
    public HttpResponseMessage Response { get; set; }
    public HttpRequestMessage Request { get; set; }
    public ExceptionWithRequest()
    {
    }

    public ExceptionWithRequest(string? message) : base(message)
    {
    }

    public ExceptionWithRequest(string? message, Exception? innerException) : base(message, innerException)
    {
    }

    protected ExceptionWithRequest(SerializationInfo info, StreamingContext context) : base(info, context)
    {
    }
}
`;
        writeFileSync(controllerBaseFile, this.addNamespace(baseControllerContent));
    }
}
