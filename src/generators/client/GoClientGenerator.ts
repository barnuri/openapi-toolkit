import { writeFileSync } from 'fs';
import { ApiPath } from '../../models/ApiPath';
import { join } from 'path';
import { capitalize, makeDirIfNotExist } from '../../helpers';
import { GoGenerator } from '../GoGenerator';

export class GoClientGenerator extends GoGenerator {
    mainExportFile = join(this.options.output, 'Client.go');
    generateClient(): void {
        super.generateClient();
        const controllerPropsNames = this.controllersNames.map(x => this.getControllerName(x));
        let mainFileContent = `
type Client = struct {
${controllerPropsNames.map(x => `\t${x} *controllers.${x}`).join('\n')}
}

func getClient(httpClient *http.Client, baseUrl string) *Client {
	if(httpClient == nil) {
		httpClient = &http.Client{}
	}
	httpReq := func(method string, route string, body interface{}, headers map[string]string, result interface{}) (res *http.Response, err error) {
		fullUrl := (&url.URL{Host: baseUrl}).ResolveReference(&url.URL{Path: route})
		var bodyJson *bytes.Buffer
		if body != nil {
			jsonValue, _ := json.Marshal(body)
			bodyJson = bytes.NewBuffer(jsonValue)
		} else {
			bodyJson = nil
		}
		req, err := http.NewRequest(strings.ToUpper(method), fullUrl.String(), bodyJson)
		if err != nil {
			return nil, err
		}
		if body != nil {
			req.Header.Set("Content-Type", "application/json")
		}
		for key := range headers {
			req.Header.Set(key, headers[key])
		}
		resp, err := httpClient.Do(req)
		if err != nil {
			return nil, err
		}
		defer resp.Body.Close()
		err = json.NewDecoder(resp.Body).Decode(&result)
		return resp, err
	}
	client := &Client{
${controllerPropsNames.map(x => `\t\t${x}: &controllers.${x}{ HttpClient: httpClient, BaseUrl: baseUrl, Request: httpReq },`).join('\n')}
    }
	return client
}
`;
        writeFileSync(this.mainExportFile, this.addNamespace(mainFileContent, undefined, '\n\t"bytes"\n\tcontrollers "OpenapiDefinitionGenerate/controllers"'));
    }
    generateController(controller: string, controlerPaths: ApiPath[]): void {
        const controllerName = this.getControllerName(controller);
        makeDirIfNotExist(this.controllersFolder);
        let controllerContent = ``;
        if (this.haveModels) {
            controllerContent += `var _ = models.${this.getFileName([...this.allEnumsEditorInput, ...this.allObjectEditorInputs][0])}\n\n`;
        }
        controllerContent += `type ${controllerName} struct {
    HttpClient *http.Client
    BaseUrl string
    Request func(method string, route string, body interface{}, headers map[string]string, result interface{}) (res *http.Response, err error)
}\n\n`;
        controllerContent += this.generateControllerMethodsContent(controller, controlerPaths);
        const controllerFile = join(this.controllersFolder, controllerName + this.getFileExtension(false));
        writeFileSync(
            controllerFile,
            '\n' + this.addNamespace(controllerContent, undefined, !this.haveModels ? '' : `\n\tmodels "OpenapiDefinitionGenerate/models"`),
        );
    }
    generateControllerMethodContent(controller: string, controllerPath: ApiPath): string {
        const controllerName = this.getControllerName(controller);
        const methodName = capitalize(this.getMethodName(controllerPath));
        let requestType = controllerPath.body.haveBody ? this.getPropDesc(controllerPath.body.schema, 'models') : 'interface{}';
        const responseType = this.getPropDesc(controllerPath.response, 'models');
        const bodyParam = controllerPath.body.haveBody ? `body ${requestType}, ` : '';
        const headers = [...controllerPath.cookieParams, ...controllerPath.headerParams];
        const haveHeaderParams = headers.length > 0;
        const headersParams = haveHeaderParams ? headers.map(x => `string h${capitalize(x.name)}`).join(', ') + `, ` : ``;
        const havePathParams = controllerPath.pathParams.length > 0;
        const pathParams = havePathParams
            ? controllerPath.pathParams.map(x => `p${capitalize(x.name)} ${this.getPropDesc(x.schema!, 'models')}`).join(', ') + ', '
            : ``;
        const pathParamsWithoutTypes =
            controllerPath.pathParams.length > 0
                ? controllerPath.pathParams
                      .map(x =>
                          this.getPropDesc(x.schema!, 'models') == 'bool' ? `strconv.FormatBool(p${capitalize(x.name)})` : `string(p${capitalize(x.name)})`,
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
            ? controllerPath.queryParams.map(x => `q${capitalize(x.name)} ${this.getPropDesc(x.schema!, 'models')}`).join(', ') + ', '
            : ``;
        const queryParamsWithoutTypes = haveQueryParams
            ? controllerPath.queryParams
                  .map(x => (this.getPropDesc(x.schema!, 'models') == 'bool' ? `strconv.FormatBool(q${capitalize(x.name)})` : `string(q${capitalize(x.name)})`))
                  .join(', ') + ', '
            : ``;
        const methodParams = `${bodyParam}${pathParams}${queryParams}${headersParams}`;

        let methodContent = '';
        methodContent += `func (c ${controllerName}) ${methodName}(${methodParams}) (result *${responseType}, httpRes *http.Response, err error) {\n`.replace(
            ', )',
            ')',
        );
        methodContent += '\theaders := make(map[string]string)\n';
        methodContent += `\tvar res *${responseType}\n`;

        if (haveHeaderParams) {
            for (const headerParam of headers) {
                methodContent += `\theaders["${headerParam.name}"] = h${capitalize(headerParam.name)}\n`;
            }
        }
        methodContent += `\thttpRes, error := c.Request(\n`;
        methodContent += `\t\t"${capitalize(controllerPath.method.toLowerCase())}",\n`;
        if (havePathParams || haveQueryParams) {
            methodContent += `\t\tstrings.NewReplacer(${pathParamsWithoutTypes}${queryParamsWithoutTypes}).Replace("${url}"),\n`.replace(', )', ')');
        } else {
            methodContent += `\t\t"${url}",\n`;
        }
        methodContent += `\t\t${controllerPath.body.haveBody ? 'body' : 'nil'},\n`;
        methodContent += `\t\theaders,\n`;
        methodContent += `\t\tres,\n`;
        methodContent += `\t)\n`;
        methodContent += `\treturn res, httpRes, error\n`;
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
