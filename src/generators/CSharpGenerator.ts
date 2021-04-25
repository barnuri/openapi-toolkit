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
        const usings = `using System;
using Newtonsoft.Json;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
#nullable enable
`;
        return usings + '\nnamespace ' + this.options.namepsace + '\n{\n\t' + content.replace(/\n/g, '\n\t') + '\n}';
    }
    async generateClient(): Promise<void> {
        const controllerPropsNames = this.controllersNames.map(x => this.getControllerName(x));
        const controllerProps = controllerPropsNames.map(x => `\tpublic ${x} ${x} { get; private set; }`).join('\n') + '\n';
        const controllerPropsCtor = controllerPropsNames.map(x => `\t\t${x} = new ${x} { HttpClient = HttpClient };`).join('\n') + '\n';

        let mainFileContent = `
public class Client
{
    public HttpClient HttpClient { get; set; }
${controllerProps}

    public Client(HttpClient? httpClient = null)
    {
        HttpClient = httpClient ?? new HttpClient();
${controllerPropsCtor}
    }
}`;
        writeFileSync(this.mainExportFile, 'using System.Net.Http;\n' + this.addNamespace(mainFileContent));
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
                        return 'object';
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
    async generateController(controller: string, controlerPaths: ApiPath[]): Promise<void> {
        const controllerName = this.getControllerName(controller);
        this.generateBaseController();
        makeDirIfNotExist(this.controllersFolder);
        console.log(`${controllerName} - ${controlerPaths.length}`);
        let controllerContent = ``;
        controllerContent += `public class ${controllerName} : ControllerBase \n{\n`;
        for (const controlerPath of controlerPaths) {
            console.log(`\t${controlerPath.method} - ${controlerPath.path}`);
            const pathFixed = controlerPath.path.replace(/\/|-|{|}/g, '');
            const methodName = capitalize(controlerPath.method) + capitalize(pathFixed);
            let requestType = controlerPath.body.haveBody ? this.getPropDesc(controlerPath.body.schema) : 'object';
            const responseType = this.getPropDesc(controlerPath.response);
            const bodyParam = controlerPath.body.haveBody ? `${requestType}${!controlerPath.body.required ? `?` : ''} body, ` : '';
            const headers = [...controlerPath.cookieParams, ...controlerPath.headerParams];
            const haveHeaderParams = headers.length > 0;
            const headersParams = haveHeaderParams ? headers.map(x => `string${x.required ? '' : '?'} h${capitalize(x.name)} = default`).join(', ') + `, ` : ``;
            const pathParams =
                controlerPath.pathParams.length > 0
                    ? controlerPath.pathParams.map(x => `${this.getPropDesc(x.schema!)}${x.required ? '' : '?'} p${capitalize(x.name)} = default`).join(', ') +
                      ', '
                    : ``;
            let url = controlerPath.path;
            for (const pathParam of controlerPath.pathParams) {
                url = url.replace('{' + pathParam.name + '}', `{p${capitalize(pathParam.name)}}`);
            }
            const haveQueryParams = controlerPath.queryParams.length > 0;
            url += !haveQueryParams ? '' : '?' + controlerPath.queryParams.map(x => `${x.name}={q${capitalize(x.name)}}`).join('&');
            const queryParams = haveQueryParams
                ? controlerPath.queryParams.map(x => `${this.getPropDesc(x.schema!)}${x.required ? '' : '?'} q${capitalize(x.name)} = default`).join(', ') +
                  ', '
                : ``;

            let methodCommonText = `\t\t\t"${capitalize(controlerPath.method.toLowerCase())}",\n`;
            methodCommonText += `\t\t\t\$"${url}\",\n`;
            methodCommonText += `\t\t\t${controlerPath.body.haveBody ? 'body' : 'null'},\n`;
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

            // method one
            controllerContent += `\tpublic Task<${responseType}> ${methodName}(${methodParams}) \n\t{\n`.replace(', )', ')');
            controllerContent += `\t\treturn Method<${requestType},${responseType}>(\n`;
            controllerContent += methodCommonText;

            // method two
            controllerContent += `\tpublic Task<T> ${methodName}<T>(${methodParams}) \n\t{\n`.replace(', )', ')');
            controllerContent += `\t\treturn Method<${requestType},T>(\n`;
            controllerContent += methodCommonText;
            // method three
            controllerContent += `\tpublic Task<string?> ${methodName}Content(${methodParams}) \n\t{\n`.replace(', )', ')');
            controllerContent += `\t\treturn Method<${requestType}>(\n`;
            controllerContent += methodCommonText;
        }
        controllerContent += `}`;
        const controllerFile = join(this.controllersFolder, controllerName + this.getFileExtension(false));
        writeFileSync(controllerFile, '\nusing System.Threading.Tasks;\n' + this.addNamespace(controllerContent));
    }
    generateBaseController() {
        const controllerBaseFile = join(this.options.output, 'ControllerBase.cs');
        if (existsSync(controllerBaseFile)) {
            return;
        }
        const baseControllerContent = `public class ControllerBase
{
    public HttpClient HttpClient { get; set; } = new HttpClient();

    protected async Task<S> Method<T, S>(string method, string path, T? body, Dictionary<string, string?> headers) where T : class
    {
        var json = await Method(method, path, body, headers);
        var res = JsonConvert.DeserializeObject<S>(json);
        return res;
    }

    protected async Task<string?> Method<T>(string method, string path, T? body, Dictionary<string, string?>? headers) where T : class
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
        writeFileSync(controllerBaseFile, this.addNamespace(baseControllerContent));
    }

    getFileExtension(isModel: boolean) {
        return '.cs';
    }
}
