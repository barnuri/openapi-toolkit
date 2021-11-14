import { writeFileSync } from 'fs';
import { ApiPath } from '../../models/ApiPath';
import { join } from 'path';
import { capitalize, makeDirIfNotExist } from '../../helpers';
import { GoGenerator } from '../GoGenerator';

export class GoClientGenerator extends GoGenerator {
    mainExportFile = join(this.options.output, 'main.go');
    generateClient(): void {
        super.generateClient();
        const controllerPropsNames = this.controllersNames.map(x => this.getControllerName(x));
        const mainFileContent = `package main
${this.getImportes(`
    "io"
    "regexp"
    "io/ioutil"
    "bytes"
    "os"
    "errors"
    "encoding/xml"
    controllers "${this.options.namepsace}/controllers"`)}
type Client = struct {
${controllerPropsNames.map(x => `\t${x} *controllers.${x}`).join('\n')}
}

var (
	jsonCheck = regexp.MustCompile(\`(?i:(?:application|text)/(?:vnd\\.[^;]+\\+)?json)\`)
	xmlCheck  = regexp.MustCompile(\`(?i:(?:application|text)/xml)\`)
)


func decodeResult(resultPointer interface{}, resBodyBytes []byte, contentType string) (err error) {
	if len(resBodyBytes) == 0 {
		return nil
	}
	if s, ok := resultPointer.(*string); ok {
		*s = string(resBodyBytes)
		return nil
	}
	if f, ok := resultPointer.(**os.File); ok {
		*f, err = ioutil.TempFile("", "HttpClientFile")
		if err != nil {
			return
		}
		_, err = (*f).Write(resBodyBytes)
		if err != nil {
			return
		}
		_, err = (*f).Seek(0, io.SeekStart)
		return
	}
	if xmlCheck.MatchString(contentType) {
		if err = xml.Unmarshal(resBodyBytes, resultPointer); err != nil {
			return err
		}
		return nil
	}
	if jsonCheck.MatchString(contentType) {
		if actualObj, ok := resultPointer.(interface{ GetActualInstance() interface{} }); ok { // oneOf, anyOf schemas
			if unmarshalObj, ok := actualObj.(interface{ UnmarshalJSON([]byte) error }); ok { // make sure it has UnmarshalJSON defined
				if err = unmarshalObj.UnmarshalJSON(resBodyBytes); err != nil {
					return err
				}
			} else {
				return errors.New("Unknown type with GetActualInstance but no unmarshalObj.UnmarshalJSON defined")
			}
		} else if err = json.Unmarshal(resBodyBytes, resultPointer); err != nil { // simple model
			return err
		}
		return nil
	}
	return errors.New("undefined response type")
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
		httpRes, err := httpClient.Do(req)
		if err != nil {
			return nil, err
		}
		defer httpRes.Body.Close()
		bodyBytes, err := ioutil.ReadAll(httpRes.Body)
		if err != nil {
			return nil, err
		}
		err = decodeResult(result,bodyBytes, httpRes.Header.Get("Content-Type"))
		if err != nil {
			return nil, err
		}
		if transformResponse != nil {
			transformResponse(result, httpRes, err)
		}
		return httpRes, err
	}
	client := &Client{
${controllerPropsNames.map(x => `\t\t${x}: &controllers.${x}{ HttpClient: httpClient, BaseUrl: baseUrl, Request: httpReq },`).join('\n')}
    }
	return client
}

func main() {
	// clientInstace := GetClient(nil, "http://localhost:3000", nil, nil)
	b, _httpRes, _err := clientInstace.DefaultController.GetHealthz()
	if _err != nil {

	}
	if _httpRes != nil {

	}
	fmt.Print(b)
}
`;
        writeFileSync(this.mainExportFile, mainFileContent);
    }
    generateController(controller: string, controlerPaths: ApiPath[]): void {
        const controllerName = this.getControllerName(controller);
        makeDirIfNotExist(this.controllersFolder);
        let controllerContent = `package controllers
${this.getImportes(!this.haveModels ? '' : `\n\tmodels "${this.options.namepsace}/models"`)}`;
        if (this.haveModels) {
            controllerContent += `var _ = models.${this.getFileName([...this.allEnumsEditorInput, ...this.allObjectEditorInputs][0])}\n\n`;
        }
        controllerContent += `
type ${controllerName} struct {
    HttpClient *http.Client
    BaseUrl string
    Request func(method string, route string, body interface{}, headers map[string]string, result interface{}) (res *http.Response, err error)
}\n\n`;
        controllerContent += this.generateControllerMethodsContent(controller, controlerPaths);
        const controllerFile = join(this.controllersFolder, controllerName + this.getFileExtension(false));
        writeFileSync(controllerFile, controllerContent);
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
        methodContent += `func (c ${controllerName}) ${methodName}(${methodParams}) (result ${responseType}, httpRes *http.Response, err error) {\n`.replace(
            ', )',
            ')',
        );
        methodContent += '\theaders := make(map[string]string)\n';
        methodContent += `\tvar res ${responseType}\n`;

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
