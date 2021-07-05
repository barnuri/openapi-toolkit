import { EditorArrayInput, EditorInput, ApiPath } from '../../models';
import { capitalize, getEditorInput2 } from '../../helpers';
import { GeneratorAbstract } from '../GeneratorAbstract';
import { EditorObjectInput, EditorPrimitiveInput, OpenApiDefinition } from '../../models';
import rimraf from 'rimraf';
import { writeFileSync } from 'fs';

export class PythonClientGenerator extends GeneratorAbstract {
    fileContent = '';
    declaresContent = '';
    generateObject(objectInput: EditorObjectInput): void {
        const extendStr =
            objectInput.implements.length > 0
                ? `${this.options.modelNamePrefix}${objectInput.implements[0]}${this.options.modelNameSuffix.split('.')[0]}`
                : `object`;
        const classDeclare = `class ${this.getFileName(objectInput)}(${extendStr}):`;
        if (this.fileContent.includes(classDeclare)) {
            return;
        }
        let modelFileContent = `${classDeclare}
${objectInput.properties
    .map(x => `\t${x.name.replace(/\[i\]/g, '')}: ${x.nullable || !x.required ? 'Optional[' + this.getPropDesc(x) + ']' : this.getPropDesc(x)}`)
    .join('\n')}`;
        if (objectInput.properties.length <= 0) {
            modelFileContent += '\tpass';
        }
        const declare = classDeclare + ' pass\n\n';
        this.declaresContent = this.declaresContent.includes(`(${extendStr}): `) ? declare + this.declaresContent : this.declaresContent + declare;
        this.fileContent += modelFileContent + '\n\n';
    }
    generateEnum(enumInput: EditorPrimitiveInput, enumVals: { [name: string]: string | number }): void {
        const classDeclare = `class ${this.getFileName(enumInput)}(Enum):`;
        if (this.fileContent.includes(classDeclare)) {
            return;
        }
        let modelFileContent = `   
${classDeclare}
${Object.keys(enumVals)
    .map(x => `\t${x} = ${typeof enumVals[x] === 'number' ? enumVals[x] : `'${enumVals[x]}'`}`)
    .join('\n')}`;
        if (Object.keys(enumVals).length <= 0) {
            modelFileContent += '\tpass';
        }
        this.declaresContent = classDeclare + ' pass\n\n' + this.declaresContent;
        this.fileContent = modelFileContent + '\n\n' + this.fileContent;
    }
    generateClient(): void {
        const imports = `
from enum import Enum
from datetime import datetime
from datetime import datetime
from requests import request
from typing import Optional
`;
        let baseController = `
class BaseController(object):
    def method(self, method: str, path: str, body: Optional[object], headers: Optional[dict], **kwargs):
        return request(
            kwargs,
            url=path,
            method=method,
            headers=headers,
            data=body,
        )`;
        this.fileContent = imports + '\n' + baseController + '\n\n#declares start\n' + this.declaresContent + '\n#declares end\n\n' + this.fileContent;
        let filePath = this.options.output.replace(/\\/g, '/').replace(/\/\//, '/');
        filePath = filePath.endsWith('/') ? filePath.substr(0, filePath.length - 1) : filePath;
        filePath += '.py';
        rimraf.sync(this.controllersFolder);
        rimraf.sync(this.modelsFolder);
        rimraf.sync(filePath);
        writeFileSync(filePath, this.fileContent);
    }
    generateController(controller: string, controlerPaths: ApiPath[]): void {
        const controllerName = this.getControllerName(controller);
        let controllerContent = `class ${controllerName}(BaseController):\n`;
        controllerContent += this.generateControllerMethodsContent(controller, controlerPaths);
        this.fileContent += controllerContent;
    }
    generateControllerMethodContent(controller: string, controllerPath: ApiPath): string {
        const methodName = this.getMethodName(controllerPath);
        let requestType = controllerPath.body.haveBody ? this.getPropDesc(controllerPath.body.schema) : 'None';
        const responseType = this.getPropDesc(controllerPath.response);
        const bodyParam = controllerPath.body.haveBody ? `body: ${!controllerPath.body.required ? `Optional[${requestType}]` : requestType}, ` : '';
        const headers = [...controllerPath.cookieParams, ...controllerPath.headerParams];
        const haveHeaders = headers.length > 0;
        const headersParams = haveHeaders ? headers.map(x => `h_${x.name}: ${x.required ? 'str' : 'Optional[str]'} `).join(', ') + `, ` : ``;
        const pathParams =
            controllerPath.pathParams.length > 0
                ? controllerPath.pathParams
                      .map(x => `p_${x.name}: ${x.required ? this.getPropDesc(x.schema!) : `Optional[${this.getPropDesc(x.schema!)}]`}`)
                      .join(', ') + `, `
                : ``;

        const queryParams =
            controllerPath.queryParams.length > 0
                ? controllerPath.queryParams
                      .map(x => `q_${x.name}: ${x.required ? this.getPropDesc(x.schema!) : `Optional[${this.getPropDesc(x.schema!)}]`}`)
                      .join(', ') + `, `
                : ``;

        let url = controllerPath.path;
        for (const pathParam of controllerPath.pathParams) {
            url = url.replace('{' + pathParam.name + '}', `{p_${pathParam.name}}`);
        }
        const haveQueryParams = controllerPath.queryParams.length > 0;
        url += !haveQueryParams ? '' : '?' + controllerPath.queryParams.map(x => `${x.name}={q_${x.name}}`).join('&');

        const headersMethodParam = '{' + headers.map(x => `'${x.name}':{h_${x.name}}`).join(',') + '}';

        let methodContent = '';
        methodContent += `\tdef ${methodName}(self, ${bodyParam}${pathParams}${queryParams}${headersParams}**kwargs) -> ${responseType}:\n`;
        methodContent += `\t\treturn self.method(\n`;
        methodContent += `\t\t\t'${controllerPath.method.toLowerCase()}',\n`;
        methodContent += `\t\t\tf"${url}",\n`;
        methodContent += `\t\t\t${controllerPath.body.haveBody ? 'body' : 'None'},\n`;
        methodContent += `\t\t\t${haveHeaders ? headersMethodParam : 'None'},\n`;
        methodContent += `\t\t\t**kwargs\n`;
        methodContent += `\t\t)\n`;
        return methodContent;
    }
    getPropDesc(obj: EditorInput | OpenApiDefinition) {
        const editorInput = (obj as EditorInput)?.editorType ? (obj as EditorInput) : getEditorInput2(this.swagger, obj as OpenApiDefinition);
        const fileName = this.getFileName(editorInput);
        if (editorInput.editorType === 'EditorPrimitiveInput') {
            const primitiveInput = editorInput as EditorPrimitiveInput;
            switch (primitiveInput.type) {
                case 'number':
                    if (primitiveInput.openApiDefinition?.type === 'integer') {
                        return 'int';
                    }
                    return 'float';
                case 'string':
                    return 'str';
                case 'boolean':
                    return 'bool';
                case 'date':
                    return 'datetime';
                case 'enum':
                    if (!fileName) {
                        return 'object';
                    }
                    return `${fileName}`;
            }
        }
        if (editorInput.editorType === 'EditorArrayInput') {
            const arrayInput = editorInput as EditorArrayInput;
            return `list[${this.getPropDesc(arrayInput.itemInput)}]`;
        }
        if (editorInput.editorType === 'EditorObjectInput') {
            const objectInput = editorInput as EditorObjectInput;
            if (!objectInput.isDictionary) {
                if (!fileName) {
                    return 'object';
                }
                return `${fileName}`;
            }
            return `dict[${objectInput.dictionaryKeyInput ? this.getPropDesc(objectInput.dictionaryKeyInput) : 'object'}, ${
                objectInput.dictionaryInput ? this.getPropDesc(objectInput.dictionaryInput) : 'object'
            }]`;
        }
    }
    getFileExtension(isModel: boolean) {
        return '.py';
    }
}
