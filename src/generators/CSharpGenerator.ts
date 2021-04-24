import { EditorArrayInput } from '../models/editor/EditorArrayInput';
import { EditorInput } from '../models/editor/EditorInput';
import { existsSync, writeFileSync } from 'fs';
import { ApiPath } from '../models/ApiPath';
import { join } from 'path';
import { capitalize, getEditorInput2, makeDirIfNotExist } from '../helpers';
import { GeneratorAbstract } from './GeneratorAbstract';
import { EditorObjectInput, EditorPrimitiveInput, OpenApiDefinition } from '../models';

export class CSharpGenerator extends GeneratorAbstract {
    mainExportFile = join(this.options.output, 'Client.cs');
    addNamespace(content: string) {
        return 'namepsace ' + this.options.namepsace + '\n{\n\t' + content.replace(/\n/g, '\n\t') + '\n}';
    }
    async generateClient(): Promise<void> {
        let mainFileContent = ``;
        mainFileContent +=
            this.controllersNames
                .map(x => x + 'Controller')
                .map(x => `\t${x}: new controllers.${x}(axiosRequestConfig)`)
                .join(',\n') + '\n';
        mainFileContent += `});`;
        writeFileSync(this.mainExportFile, mainFileContent);
    }
    async generateObject(objectInput: EditorObjectInput): Promise<void> {
        if (!this.shouldGenerateModel(objectInput)) {
            return;
        }
        const modelFile = join(this.modelsFolder, this.getFileName(objectInput) + this.getFileExtension(true));
        const extendStr =
            objectInput.implements.length > 0
                ? `: ${this.options.modelNamePrefix}${objectInput.implements[0]}${this.options.modelNameSuffix.split('.')[0]}`
                : ``;
        const modelFileContent = `public class ${this.getFileName(objectInput)} ${extendStr}\n{
${objectInput.properties
    .map(x => `\t public ${this.getPropDesc(x)}${x.nullable || !x.required ? '?' : ''} ${x.name.replace(/\[i\]/g, '')} { get; set; }`)
    .join('\n')}
}`;
        writeFileSync(modelFile, this.addNamespace(modelFileContent));
    }
    getPropDesc(obj: EditorInput | OpenApiDefinition) {
        const editorInput = (obj as EditorInput)?.editorType ? (obj as EditorInput) : getEditorInput2(this.swagger, obj as OpenApiDefinition);
        const fileName = this.getFileName(editorInput);

        if (editorInput.editorType === 'EditorPrimitiveInput') {
            const primitiveInput = editorInput as EditorPrimitiveInput;
            switch (primitiveInput.type) {
                case 'number':
                    return 'double';
                case 'string':
                    return 'string';
                case 'boolean':
                    return 'bool';
                case 'date':
                    return 'DateTime';
                case 'enum':
                    if (!fileName) {
                        return 'any';
                    }
                    return `${fileName}`;
            }
        }
        if (editorInput.editorType === 'EditorArrayInput') {
            const arrayInput = editorInput as EditorArrayInput;
            return `${this.getPropDesc(arrayInput.itemInput)}[]`;
        }
        if (editorInput.editorType === 'EditorObjectInput') {
            const objectInput = editorInput as EditorObjectInput;
            if (!objectInput.isDictionary) {
                if (!fileName) {
                    return 'object';
                }
                return `${fileName}`;
            }
            return `Dictionary<string, ${objectInput.dictionaryInput ? this.getPropDesc(objectInput.dictionaryInput) : 'object'}>`;
        }
    }
    async generateEnum(enumInput: EditorPrimitiveInput, enumVals: { [name: string]: string | number }): Promise<void> {
        if (!this.shouldGenerateModel(enumInput)) {
            return;
        }
        const modelFile = join(this.modelsFolder, this.getFileName(enumInput) + this.getFileExtension(true));
        const modelFileContent = `public enum ${this.getFileName(enumInput)} 
{
${Object.keys(enumVals)
    .map(x => `\t${x}${typeof enumVals[x] === 'number' ? ' = ' + enumVals[x] : ``}`)
    .join(',\n')}
}`;
        writeFileSync(modelFile, this.addNamespace(modelFileContent));
    }
    async generateController(controllerName: string, controlerPaths: ApiPath[]): Promise<void> {
        this.generateBaseController();
        makeDirIfNotExist(this.controllersFolder);
        console.log(`${controllerName} - ${controlerPaths.length}`);
        let controllerContent = ``;
        controllerContent += `public class ${controllerName} : ControllerBase \n{\n`;
        for (const controlerPath of controlerPaths) {
            console.log(`\t${controlerPath.method} - ${controlerPath.path}`);
            const pathFixed = controlerPath.path.replace(/\/|-|{|}/g, '');
            const methodName = capitalize(controlerPath.method) + capitalize(pathFixed);
            const haveBody = !controlerPath.body;
            let requestType = haveBody ? this.getPropDesc(controlerPath.body.schema) : 'undefined';
            const responseType = this.getPropDesc(controlerPath.response);
            const bodyParam = haveBody ? `body: ${requestType}${!controlerPath.body.required ? `?` : ''}, ` : '';
            const headers = [...controlerPath.cookieParams, ...controlerPath.headerParams];
            const haveHeaderParams = headers.length > 0;
            const headersParams = haveHeaderParams ? `headers: {${headers.map(x => `${x.name}${x.required ? '' : '?'}: string`)}}, ` : ``;
            const pathParams =
                controlerPath.pathParams.length > 0
                    ? `pathParams: {${controlerPath.pathParams.map(x => `${x.name}${x.required ? '' : '?'}: ${this.getPropDesc(x.schema!)}`)}}, `
                    : ``;
            let url = controlerPath.path;
            for (const pathParam of controlerPath.pathParams) {
                url = url.replace('{' + pathParam.name + '}', "${pathParams['" + pathParam.name + "']}");
            }
            const haveQueryParams = controlerPath.queryParams.length > 0;
            url += !haveQueryParams ? '' : '?' + controlerPath.queryParams.map(x => `${x.name}=\${queryParams['${x.name}']}`).join('&');
            const queryParams = haveQueryParams
                ? `queryParams: {${controlerPath.queryParams.map(x => `${x.name}${x.required ? '' : '?'}: ${this.getPropDesc(x.schema!)}`)}}, `
                : ``;
            controllerContent += `\tasync ${methodName}(${bodyParam}${pathParams}${queryParams}${headersParams}customConfig?: AxiosRequestConfig): Promise<${responseType}> {\n`;
            controllerContent += `\t\treturn this.method<${requestType},${responseType}>(\n`;
            controllerContent += `\t\t\t'${controlerPath.method.toLowerCase()}',\n`;
            controllerContent += `\t\t\t\`${url}\`,\n`;
            controllerContent += `\t\t\t${haveBody ? 'body' : 'undefined'},\n`;
            controllerContent += `\t\t\t${haveHeaderParams ? 'headers' : 'undefined'},\n`;
            controllerContent += `\t\t\tcustomConfig\n`;
            controllerContent += `\t\t);\n`;
            controllerContent += `\t}\n`;
        }
        controllerContent += `}`;
        const controllerFile = join(this.controllersFolder, controllerName + this.getFileExtension(false));
        writeFileSync(controllerFile, controllerContent);
    }
    generateBaseController() {
        const controllerBaseFile = join(this.options.output, 'ControllerBase.cs');
        if (existsSync(controllerBaseFile)) {
            return;
        }
        const usings = `using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;`;

        const baseControllerContent = `public class ControllerBase
{
    public HttpClient HttpClient { get; set; } = new HttpClient();

    protected async Task<S> Method<T, S>(string method, string path, T? body, Dictionary<string, string?> headers)
    {
        var json = await Method(method, path, body, headers);
        var res = JsonConvert.DeserializeObject<S>(json);
        return res;
    }

    protected async Task<string> Method<T>(string method, string path, T? body, Dictionary<string, string?>? headers)
    {
        var req = new HttpRequestMessage
        {
            Method = new HttpMethod(method),
            RequestUri = new Uri(path),
            Content = new StringContent(JsonConvert.SerializeObject(body)),
        };
        headers?.Keys.ToList().ForEach(x => req.Headers.TryAddWithoutValidation(x, headers[x]));
        var res = await HttpClient.SendAsync(req);
        res.EnsureSuccessStatusCode();
        var content = await res.Content.ReadAsStringAsync();
        return content;
    }
}`;
        writeFileSync(controllerBaseFile, usings + '\n' + this.addNamespace(baseControllerContent));
    }

    getFileExtension(isModel: boolean) {
        return '.cs';
    }
}
