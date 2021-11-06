import { writeFileSync } from 'fs';
import { ApiPath } from '../../models/ApiPath';
import { join } from 'path';
import { capitalize, makeDirIfNotExist } from '../../helpers';
import { GoGenerator } from '../GoGenerator';

export class GoClientGenerator extends GoGenerator {
    mainExportFile = join(this.options.output, 'Client.go');
    generateClient(): void {
        super.generateClient();
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
        mainFileContent = '';
        writeFileSync(this.mainExportFile, this.addNamespace(mainFileContent));
    }
    generateController(controller: string, controlerPaths: ApiPath[]): void {
        const controllerName = this.getControllerName(controller);
        makeDirIfNotExist(this.controllersFolder);
        let controllerContent = ``;
        controllerContent += this.generateControllerMethodsContent(controller, controlerPaths);
        const controllerFile = join(this.controllersFolder, controllerName + this.getFileExtension(false));
        writeFileSync(controllerFile, '\n' + this.addNamespace(controllerContent));
    }
    generateControllerMethodContent(controller: string, controllerPath: ApiPath): string {
        const methodName = capitalize(this.getMethodName(controllerPath));
        let requestType = controllerPath.body.haveBody ? this.getPropDesc(controllerPath.body.schema) : 'interface{}';
        const responseType = this.getPropDesc(controllerPath.response);
        const bodyParam = controllerPath.body.haveBody ? `body ${requestType}, ` : '';
        const headers = [...controllerPath.cookieParams, ...controllerPath.headerParams];
        const haveHeaderParams = headers.length > 0;
        const headersParams = haveHeaderParams ? headers.map(x => `string h${capitalize(x.name)}`).join(', ') + `, ` : ``;
        const havePathParams = controllerPath.pathParams.length > 0;
        const pathParams = havePathParams ? controllerPath.pathParams.map(x => `p${capitalize(x.name)} ${this.getPropDesc(x.schema!)}`).join(', ') + ', ' : ``;
        const pathParamsWithoutTypes =
            controllerPath.pathParams.length > 0 ? controllerPath.pathParams.map(x => `string(p${capitalize(x.name)})`).join(', ') + ', ' : ``;
        let url = controllerPath.path;
        for (const pathParam of controllerPath.pathParams) {
            url = url.replace('{' + pathParam.name + '}', `{p${capitalize(pathParam.name)}}`);
        }
        const haveQueryParams = controllerPath.queryParams.length > 0;
        url += !haveQueryParams ? '' : '?' + controllerPath.queryParams.map(x => `${x.name}={q${capitalize(x.name)}}`).join('&');
        const queryParams = haveQueryParams
            ? controllerPath.queryParams.map(x => `q${capitalize(x.name)} ${this.getPropDesc(x.schema!)}`).join(', ') + ', '
            : ``;
        const queryParamsWithoutTypes = haveQueryParams ? controllerPath.queryParams.map(x => `string(q${capitalize(x.name)})`).join(', ') + ', ' : ``;
        const methodParams = `${bodyParam}${pathParams}${queryParams}${headersParams}`;

        let methodContent = '';
        methodContent += `func ${methodName}(${methodParams}) ${responseType} {\n`.replace(', )', ')');
        methodContent += '\theaders := make(map[string]string)\n';

        if (haveHeaderParams) {
            for (const headerParam of headers) {
                methodContent += `\theaders["${headerParam.name}"] = h${capitalize(headerParam.name)}\n`;
            }
        }
        methodContent += `\treturn request(\n`;
        methodContent += `\t\t"${capitalize(controllerPath.method.toLowerCase())}",\n`;
        if (havePathParams || haveQueryParams) {
            methodContent += `\t\tstrings.NewReplacer(${pathParamsWithoutTypes}${queryParamsWithoutTypes}).Replace("${url}"),\n`.replace(', )', ')');
        } else {
            methodContent += `\t\t"${url}",\n`;
        }
        methodContent += `\t\t${controllerPath.body.haveBody ? 'body' : 'nil'},\n`;
        methodContent += `\t\theaders,\n`;
        methodContent += `\t)\n`;
        methodContent += `}\n\n`;
        return methodContent;
    }
    generateBaseController() {
        const controllerBaseFile = join(this.options.output, 'BaseController.go');
        let baseControllerContent = `public class BaseController
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
            Content = new StringContent(JsonConvert.SerializeObject(body)),
        };
        headers?.Keys.ToList().ForEach(x => req.Headers.TryAddWithoutValidation(x, headers[x]));
        var res = await HttpClient.SendAsync(req);
        res.EnsureSuccessStatusCode();
        var content = await res.Content.ReadAsStringAsync();
        return content;
    }
}`;
        baseControllerContent = '';
        writeFileSync(controllerBaseFile, this.addNamespace(baseControllerContent));
    }
}
