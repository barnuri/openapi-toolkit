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


func GetClient(
	httpClient *http.Client,
	baseUrl string,
	transformRequest func(req *http.Request),
	transformResponse func(res interface{}, httpRes *http.Response, err error),
) *Client {
	if httpClient == nil {
		httpClient = &http.Client{}
	}
	httpReq := func(method string, route string, body interface{}, headers map[string]string, result interface{}) (res *http.Response, err error) {
		fullUrl := baseUrl + route
		var bodyJson *bytes.Buffer
		if body != nil {
			jsonValue, err := json.Marshal(body)
			if err != nil {
				return nil, err
			}
			bodyJson = bytes.NewBuffer(jsonValue)
		} else {
			bodyJson = bytes.NewBufferString("")
		}
		req, err := http.NewRequest(strings.ToUpper(method), fullUrl, bodyJson)
		if err != nil {
			return nil, err
		}
		if body != nil {
			req.Header.Set("Content-Type", "application/json")
		}
		for key := range headers {
			req.Header.Set(key, headers[key])
		}
		if transformRequest != nil {
			transformRequest(req)
		}
		resp, err := httpClient.Do(req)
		if err != nil {
			return nil, err
		}
		defer resp.Body.Close()
		bodyBytes, err := ioutil.ReadAll(resp.Body)
		if err != nil {
			return nil, err
		}
		bodyString := string(bodyBytes)
		err = json.Unmarshal([]byte(bodyString), &result)
		if transformResponse != nil {
			transformResponse(result, resp, err)
		}
		return resp, err
	}
	client := &Client{
${controllerPropsNames.map(x => `\t\t${x}: &controllers.${x}{ HttpClient: httpClient, BaseUrl: baseUrl, Request: httpReq },`).join('\n')}
    }
	return client
}
`;
        writeFileSync(
            this.mainExportFile,
            this.addNamespace(mainFileContent, undefined, '\n\t"io/ioutil"\n\t"bytes"\n\tcontrollers "OpenapiDefinitionGenerate/controllers"'),
        );
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
        const headersParams = haveHeaderParams ? headers.map(x => `h${capitalize(x.name)} string`).join(', ') + `, ` : ``;
        const havePathParams = controllerPath.pathParams.length > 0;
        const pathParams = havePathParams
            ? controllerPath.pathParams.map(x => `p${capitalize(x.name)} ${this.getPropDesc(x.schema!, 'models')}`).join(', ') + ', '
            : ``;
        const pathParamsForUrl =
            controllerPath.pathParams.length > 0
                ? controllerPath.pathParams.map(x => ({
                      format: this.getPropDesc(x.schema!, 'models') == 'bool' ? `strconv.FormatBool(p${capitalize(x.name)})` : `string(p${capitalize(x.name)})`,
                      param: `p${capitalize(x.name)}`,
                  }))
                : [];
        let url = controllerPath.path;
        for (const pathParam of controllerPath.pathParams) {
            url = url.replace('{' + pathParam.name + '}', `{p${capitalize(pathParam.name)}}`);
        }
        const haveQueryParams = controllerPath.queryParams.length > 0;
        url += !haveQueryParams ? '' : '?' + controllerPath.queryParams.map(x => `${x.name}={q${capitalize(x.name)}}`).join('&');
        const queryParams = haveQueryParams
            ? controllerPath.queryParams.map(x => `q${capitalize(x.name)} ${this.getPropDesc(x.schema!, 'models')}`).join(', ') + ', '
            : ``;
        const queryParamsForUrl = haveQueryParams
            ? controllerPath.queryParams.map(x => ({
                  format: this.getPropDesc(x.schema!, 'models') == 'bool' ? `strconv.FormatBool(q${capitalize(x.name)})` : `string(q${capitalize(x.name)})`,
                  param: `q${capitalize(x.name)}`,
              }))
            : [];
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
        methodContent += `\turl := "${url}"\n`;
        for (const itemsToReplace of [...queryParamsForUrl, ...pathParamsForUrl]) {
            methodContent += `\turl = strings.ReplaceAll(url,"{${itemsToReplace.param}}",${itemsToReplace.format})\n`;
        }
        methodContent += `\thttpRes, error := c.Request(\n`;
        methodContent += `\t\t"${capitalize(controllerPath.method.toLowerCase())}",\n`;
        methodContent += `\t\turl,\n`;
        methodContent += `\t\t${controllerPath.body.haveBody ? 'body' : 'nil'},\n`;
        methodContent += `\t\theaders,\n`;
        methodContent += `\t\t&res,\n`;
        methodContent += `\t)\n`;
        methodContent += `\treturn res, httpRes, error\n`;
        methodContent += `}\n\n`;
        return methodContent;
    }
}
