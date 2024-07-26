import { EditorArrayInput, EditorInput, ApiPath } from '../../models';
import { getEditorInput2, snakeCase } from '../../helpers';
import { GeneratorAbstract } from '../GeneratorAbstract';
import { EditorObjectInput, EditorPrimitiveInput, OpenApiDefinition } from '../../models';
import { writeFileSync } from 'fs';
import { join } from 'path';

export class PythonClientGenerator extends GeneratorAbstract {
    generateObject(objectInput: EditorObjectInput): void {
        const extendStr =
            objectInput.implements.length > 0
                ? `models.${this.options.modelNamePrefix}${objectInput.implements[0]}${this.options.modelNameSuffix.split('.')[0]}`
                : `object`;
        const classDeclare = `class ${this.getFileName(objectInput)}(${extendStr}):`;
        if (!this.shouldGenerateModel(objectInput)) {
            return;
        }
        const modelFile = join(this.modelsFolder, this.getFileName(objectInput) + this.getFileExtension(true));
        let modelFileContent = `${classDeclare}
${objectInput.properties
    .map(
        x =>
            `\t${x.name.replace(/\[i\]/g, '')}: ${x.nullable || !x.required ? 'Optional[' + this.getPropDesc(x) + ']' : this.getPropDesc(x)}`,
    )
    .join('\n')}`;
        if (objectInput.properties.length <= 0) {
            modelFileContent += '\tpass';
        }
        writeFileSync(modelFile, this.appendModelsImports(modelFileContent));
    }
    generateEnum(enumInput: EditorPrimitiveInput, enumVals: { [name: string]: string | number }): void {
        if (!this.shouldGenerateModel(enumInput)) {
            return;
        }
        const modelFile = join(this.modelsFolder, this.getFileName(enumInput) + this.getFileExtension(false));
        const classDeclare = `class ${this.getFileName(enumInput)}(Enum):`;
        let modelFileContent = `   
${classDeclare}
${Object.keys(enumVals)
    .map(x => `\t${x == 'None' ? '_None' : x} = ${typeof enumVals[x] === 'number' ? enumVals[x] : `'${enumVals[x]}'`}`)
    .join('\n')}`;
        if (Object.keys(enumVals).length <= 0) {
            modelFileContent += '\tpass';
        }
        writeFileSync(modelFile, this.appendModelsImports(modelFileContent));
    }
    appendModelsImports(fileContent: string): string {
        let imports = ``;
        const modelsRefs = [...(fileContent.matchAll(/models\.(\w+)/g) || [])];
        for (const match of modelsRefs) {
            const modelName = match[1];
            imports += `from ..models.${modelName} import ${modelName}\n`;
        }

        const haveAnyType = fileContent.includes(': Any') || fileContent.includes('[Any]');
        const haveOptionalType = fileContent.includes(': Optional') || fileContent.includes('[Optional]');
        if (haveAnyType && haveOptionalType) {
            imports += `from typing import Optional, Any\n`;
        } else if (haveOptionalType) {
            imports += `from typing import Optional\n`;
        } else if (haveAnyType) {
            imports += `from typing import Any\n`;
        }

        if (fileContent.includes(': datetime') || fileContent.includes('[datetime]')) {
            imports += `from datetime import datetime\n`;
        }
        if (fileContent.includes('(Enum):') || fileContent.includes('[Enum]')) {
            imports += `from enum import Enum\n`;
        }
        if (fileContent.includes('(BaseController):')) {
            imports += `from .BaseController import BaseController\n`;
        }
        return (imports + '\n' + fileContent.replace(/models\./g, '')).trim();
    }
    generateClient(): void {
        writeFileSync(join(this.options.output, '__init__.py'), '');
        writeFileSync(join(this.modelsFolder, '__init__.py'), '');
        writeFileSync(join(this.controllersFolder, '__init__.py'), '');

        let baseController = `from requests import request
from typing import Optional, Any

class BaseController(object):
    def method(self, method: str, path: str, body: Optional[Any], headers: Optional[dict], **kwargs):
        res = request(
            **kwargs,
            url=path,
            method=method,
            headers=headers,
            data=body,
        )
        return res.json()`;
        const baseControllerFile = join(this.controllersFolder, 'BaseController' + this.getFileExtension(false));
        writeFileSync(baseControllerFile, baseController);

        let mainFileContent = `${this.parsingResult.controllersNames
            .map(x => this.getControllerName(x))
            .map(x => `from .controllers.${x} import ${x}`)
            .join('\n')}

class Client(object):
    def __init__(self):
${this.parsingResult.controllersNames
    .map(x => this.getControllerName(x))
    .map(x => `        self.${x} = ${x}()`)
    .join('\n')}`;
        const mainFile = join(this.options.output, 'client.py');
        writeFileSync(mainFile, mainFileContent);
    }
    generateController(controller: string, controlerPaths: ApiPath[]): void {
        const controllerName = this.getControllerName(controller);
        let controllerContent = `class ${controllerName}(BaseController):\n`;
        controllerContent += this.generateControllerMethodsContent(controller, controlerPaths);
        const controllerFile = join(this.controllersFolder, controllerName + this.getFileExtension(false));
        writeFileSync(controllerFile, this.appendModelsImports(controllerContent));
    }
    generateControllerMethodContent(controller: string, controllerPath: ApiPath) {
        const methodName = this.getMethodName(controllerPath);
        let requestType = controllerPath.body.haveBody ? this.getPropDesc(controllerPath.body.schema) : 'None';
        const responseType = this.getPropDesc(controllerPath.response);
        const bodyParam = controllerPath.body.haveBody
            ? `body: ${!controllerPath.body.required ? `Optional[${requestType}]` : requestType}, `
            : '';
        const headers = [...controllerPath.cookieParams, ...controllerPath.headerParams];
        const haveHeaders = headers.length > 0;
        const headersParams = haveHeaders
            ? headers.map(x => `h_${x.name}: ${x.required ? 'str' : 'Optional[str]'} `).join(', ') + `, `
            : ``;
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
        url += !haveQueryParams ? '' : '?' + controllerPath.queryParams.map(x => `${x.name}={q_${snakeCase(x.name)}}`).join('&');

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
        return { methodContent, methodName };
    }
    getPropDesc(obj: EditorInput | OpenApiDefinition) {
        const editorInput = (obj as EditorInput)?.editorType
            ? (obj as EditorInput)
            : getEditorInput2(this.swagger, obj as OpenApiDefinition);
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
                    return `models.${fileName}`;
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
                return `models.${fileName}`;
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
