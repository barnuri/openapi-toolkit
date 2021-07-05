import { EditorArrayInput } from '../../models/editor/EditorArrayInput';
import { EditorInput } from '../../models/editor/EditorInput';
import { existsSync, writeFileSync } from 'fs';
import { ApiPath } from '../../models/ApiPath';
import { join } from 'path';
import { capitalize, getEditorInput2, makeDirIfNotExist } from '../../helpers';
import { GeneratorAbstract } from '../GeneratorAbstract';
import { EditorObjectInput, EditorPrimitiveInput, OpenApiDefinition } from '../../models';

export class CSharpClientGenerator extends GeneratorAbstract {
    mainExportFile = join(this.options.output, 'Client.cs');
    addNamespace(content: string, customUsing?: string) {
        const usings =
            customUsing ??
            `using System;
using Newtonsoft.Json;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
`;
        return usings + '\n#nullable enable' + '\nnamespace ' + this.options.namepsace + '\n{\n\t' + content.replace(/\n/g, '\n\t') + '\n}';
    }
    generateClient(): void {
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
    generateObject(objectInput: EditorObjectInput): void {
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
                    if (primitiveInput.openApiDefinition?.type === 'integer') {
                        return primitiveInput.openApiDefinition?.format === 'int64' ? 'long' : 'int';
                    }
                    return primitiveInput.openApiDefinition?.format === 'float' ? 'float' : 'double';
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
            return `Dictionary<${objectInput.dictionaryKeyInput ? this.getPropDesc(objectInput.dictionaryKeyInput) : 'object'}, ${
                objectInput.dictionaryInput ? this.getPropDesc(objectInput.dictionaryInput) : 'object'
            }>`;
        }
    }
    generateEnum(enumInput: EditorPrimitiveInput, enumVals: { [name: string]: string | number }): void {
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
    generateController(controller: string, controlerPaths: ApiPath[]): void {
        const controllerName = this.getControllerName(controller);
        this.generateBaseController();
        makeDirIfNotExist(this.controllersFolder);
        let controllerContent = ``;
        controllerContent += `public class ${controllerName} : BaseController \n{\n`;
        controllerContent += this.generateControllerMethodsContent(controller, controlerPaths);
        controllerContent += `}`;
        const controllerFile = join(this.controllersFolder, controllerName + this.getFileExtension(false));
        writeFileSync(controllerFile, '\n' + this.addNamespace(controllerContent));
    }
    generateControllerMethodContent(controller: string, controllerPath: ApiPath): string {
        const methodName = this.getMethodName(controllerPath);
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
        methodContent += `\tpublic Task<${responseType}> ${methodName}(${methodParams}) \n\t{\n`.replace(', )', ')');
        methodContent += `\t\treturn Method<${requestType},${responseType}>(\n`;
        methodContent += methodCommonText;

        // method two
        methodContent += `\tpublic Task<T> ${methodName}<T>(${methodParams}) \n\t{\n`.replace(', )', ')');
        methodContent += `\t\treturn Method<${requestType},T>(\n`;
        methodContent += methodCommonText;
        // method three
        methodContent += `\tpublic Task<string?> ${methodName}Content(${methodParams}) \n\t{\n`.replace(', )', ')');
        methodContent += `\t\treturn Method<${requestType}>(\n`;
        methodContent += methodCommonText;
        return methodContent;
    }
    generateBaseController() {
        const controllerBaseFile = join(this.options.output, 'BaseController.cs');
        if (existsSync(controllerBaseFile)) {
            return;
        }
        const baseControllerContent = `public class BaseController
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
