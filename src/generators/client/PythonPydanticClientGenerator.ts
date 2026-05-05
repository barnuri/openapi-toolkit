import { EditorArrayInput, EditorInput, ApiPath } from '../../models';
import { getEditorInput2, snakeCase } from '../../helpers';
import { GeneratorAbstract } from '../GeneratorAbstract';
import { EditorObjectInput, EditorPrimitiveInput, OpenApiDefinition } from '../../models';
import { writeFileSync, mkdirSync } from 'fs';
import { join, basename } from 'path';

const tab = ' '.repeat(4);
const systemNames = [`from`, `None`, `True`, `False`, `pass`, `global`, `in`, `except`, `and`, `field`];

export class PythonPydanticClientGenerator extends GeneratorAbstract {
    modelsFolder = join(this.options.output, 'src', 'client', this.options.modelsFolderName);
    controllersFolder = join(this.options.output, 'src', 'client', this.options.controllersFolderName);
    protected readonly clientFolder = join(this.options.output, 'src', 'client');

    generateObject(objectInput: EditorObjectInput): void {
        if (!this.shouldGenerateModel(objectInput)) {
            return;
        }
        const fileName = this.getFileName(objectInput);
        const modelFile = join(this.modelsFolder, fileName + this.getFileExtension(true));

        const extendsName =
            objectInput.implements.length > 0
                ? `${this.options.modelNamePrefix}${objectInput.implements[0]}${this.options.modelNameSuffix.split('.')[0]}`
                : `BaseModel`;

        const classDeclare = `class ${fileName}(${extendsName}):`;
        const propertiesContent: string[] = [];

        for (const prop of objectInput.properties) {
            const type = this.getPropDesc(prop);
            let name = prop.name.replace(/\[i\]/g, '').replace(/-/g, '_');
            if (systemNames.includes(name)) {
                name = `_${name}`;
            }
            const isOptional = prop.nullable || !prop.required;
            propertiesContent.push(`${tab}${name}: ${isOptional ? `${type} | None` : type} = None`);
        }

        if (propertiesContent.length === 0) {
            propertiesContent.push(`${tab}pass`);
        }

        const modelFileContent = `${classDeclare}\n${propertiesContent.join('\n')}`;
        writeFileSync(modelFile, this.appendModelImports(modelFileContent, extendsName, objectInput.implements[0]));
    }

    generateEnum(enumInput: EditorPrimitiveInput, enumVals: { [name: string]: string | number }): void {
        if (!this.shouldGenerateModel(enumInput)) {
            return;
        }
        const modelFile = join(this.modelsFolder, this.getFileName(enumInput) + this.getFileExtension(false));
        const classDeclare = `class ${this.getFileName(enumInput)}(str, Enum):`;
        const getName = (e: string) => {
            if (systemNames.includes(e)) {
                e = `_${e}`;
            }
            e = e.replace(/ /g, '').replace(/-/g, '').replace(/!/g, 'not_');
            return this.getEnumValueName(e);
        };
        let modelFileContent = `\n${classDeclare}\n`;
        if (Object.keys(enumVals).length === 0) {
            modelFileContent += `${tab}pass`;
        } else {
            modelFileContent += Object.keys(enumVals)
                .map(x => `${tab}${getName(x)} = ${typeof enumVals[x] === 'number' ? enumVals[x] : `'${enumVals[x]}'`}`)
                .join('\n');
        }
        writeFileSync(modelFile, this.appendModelImports(modelFileContent, '', undefined));
    }

    appendModelImports(fileContent: string, extendsName: string, parentClassName?: string): string {
        let imports = ``;

        // Import parent class if it's not BaseModel
        if (parentClassName && extendsName !== 'BaseModel') {
            const parentFile = `${this.options.modelNamePrefix}${parentClassName}${this.options.modelNameSuffix.split('.')[0]}`;
            imports += `from ..models.${parentFile} import ${extendsName}\n`;
        }

        const modelsRefs = [...(fileContent.matchAll(/models\.(\w+)/g) || [])];
        const seenModels = new Set<string>();
        for (const match of modelsRefs) {
            const modelName = match[1];
            if (!seenModels.has(modelName)) {
                seenModels.add(modelName);
                imports += `from ..models.${modelName} import ${modelName}\n`;
            }
        }

        const needsBaseModel = fileContent.includes('(BaseModel)') || fileContent.includes('BaseModel');
        const needsEnum = fileContent.includes('(str, Enum)') || fileContent.includes('(Enum)');
        const needsAny = fileContent.includes(': Any') || fileContent.includes('[Any]') || fileContent.includes('Any]');
        const needsDatetime = fileContent.includes(': datetime') || fileContent.includes('[datetime]');

        if (needsAny) {
            imports += `from typing import Any\n`;
        }
        if (needsDatetime) {
            imports += `from datetime import datetime\n`;
        }
        if (needsBaseModel) {
            imports += `from pydantic import BaseModel, ConfigDict\n`;
        }
        if (needsEnum) {
            imports += `from enum import Enum\n`;
        }

        return (imports + '\n' + fileContent.replace(/models\./g, '')).trim();
    }

    generateClient(): void {
        const outputName = basename(this.options.output).replace(/[^a-z0-9-_]/gi, '-').toLowerCase();

        writeFileSync(join(this.clientFolder, '__init__.py'), 'from .client import Client\n');
        writeFileSync(join(this.modelsFolder, '__init__.py'), '');
        writeFileSync(join(this.controllersFolder, '__init__.py'), '');
        this.writeClientFile();
        this.writePyprojectToml(outputName);
    }

    protected writeClientFile(): void {
        const controllerImports = this.parsingResult.controllersNames
            .map(x => this.getControllerName(x))
            .map(x => `from .controllers.${x} import ${x}`)
            .join('\n');

        const controllerInits = this.parsingResult.controllersNames
            .map(x => this.getControllerName(x))
            .map(x => `${tab}${tab}self.${x} = ${x}(base_url)`)
            .join('\n');

        const mainFileContent = `${controllerImports}
import os


class Client:
${tab}def __init__(self, base_url: str | None = None) -> None:
${tab}${tab}base_url = base_url or os.environ.get("BASE_URL", "")
${controllerInits}
`;
        writeFileSync(join(this.clientFolder, 'client.py'), mainFileContent);
    }

    private writePyprojectToml(outputName: string): void {
        const pyprojectContent = `[project]
name = "${outputName}"
version = "0.1.0"
requires-python = ">=3.11"
dependencies = [
    "httpx>=0.27",
    "pydantic>=2.0",
]

[build-system]
requires = ["hatchling"]
build-backend = "hatchling.build"

[tool.hatch.build.targets.wheel]
packages = ["src/client"]
`;
        writeFileSync(join(this.options.output, 'pyproject.toml'), pyprojectContent);
    }

    generateController(controller: string, controllerPaths: ApiPath[]): void {
        const controllerName = this.getControllerName(controller);
        let controllerContent = `class ${controllerName}:\n`;
        controllerContent += `${tab}def __init__(self, base_url: str) -> None:\n`;
        controllerContent += `${tab}${tab}self._base_url = base_url\n\n`;
        controllerContent += this.generateControllerMethodsContent(controller, controllerPaths);
        const controllerFile = join(this.controllersFolder, controllerName + this.getFileExtension(false));
        writeFileSync(controllerFile, this.appendControllerImports(controllerContent));
    }

    private appendControllerImports(content: string): string {
        let imports = `import httpx\n`;
        const modelsRefs = [...(content.matchAll(/models\.(\w+)/g) || [])];
        const seenModels = new Set<string>();
        for (const match of modelsRefs) {
            const modelName = match[1];
            if (!seenModels.has(modelName)) {
                seenModels.add(modelName);
                imports += `from ..models.${modelName} import ${modelName}\n`;
            }
        }
        const needsAny = content.includes(': Any') || content.includes('[Any]');
        if (needsAny) {
            imports += `from typing import Any\n`;
        }
        return (imports + '\n' + content.replace(/models\./g, '')).trim();
    }

    generateControllerMethodContent(controller: string, controllerPath: ApiPath) {
        const methodName = this.getMethodName(controllerPath);
        const requestType = controllerPath.body.haveBody ? this.getPropDesc(controllerPath.body.schema) : 'None';
        const responseType = this.getPropDesc(controllerPath.response);

        const bodyParam = controllerPath.body.haveBody
            ? `body: ${!controllerPath.body.required ? `${requestType} | None` : requestType}, `
            : '';

        const headers = [...controllerPath.cookieParams, ...controllerPath.headerParams];
        const haveHeaders = headers.length > 0;
        const headersParams = haveHeaders
            ? headers.map(x => `h_${snakeCase(x.name)}: ${x.required ? 'str' : 'str | None'}`).join(', ') + ', '
            : '';

        const pathParams =
            controllerPath.pathParams.length > 0
                ? controllerPath.pathParams
                      .map(x => `p_${snakeCase(x.name)}: ${x.required ? this.getPropDesc(x.schema!) : `${this.getPropDesc(x.schema!)} | None`}`)
                      .join(', ') + ', '
                : '';

        const queryParams =
            controllerPath.queryParams.length > 0
                ? controllerPath.queryParams
                      .map(x => {
                          const type = this.getPropDesc(x.schema!);
                          return x.required
                              ? `q_${snakeCase(x.name)}: ${type}`
                              : `q_${snakeCase(x.name)}: ${type} | None = None`;
                      })
                      .join(', ') + ', '
                : '';

        let urlPath = controllerPath.path;
        for (const pathParam of controllerPath.pathParams) {
            urlPath = urlPath.replace(`{${pathParam.name}}`, `{p_${snakeCase(pathParam.name)}}`);
        }

        const haveQueryParams = controllerPath.queryParams.length > 0;
        const headersDict = haveHeaders
            ? '{' + headers.map(x => `'${x.name}': h_${snakeCase(x.name)}`).join(', ') + '}'
            : 'None';

        let methodContent = '';
        methodContent += `${tab}async def ${methodName}(self, ${bodyParam}${pathParams}${queryParams}${headersParams}**kwargs) -> ${responseType}:\n`;
        methodContent += `${tab}${tab}async with httpx.AsyncClient() as client:\n`;
        methodContent += `${tab}${tab}${tab}response = await client.${controllerPath.method.toLowerCase()}(\n`;
        methodContent += `${tab}${tab}${tab}${tab}f"{self._base_url}${urlPath}",\n`;

        if (controllerPath.body.haveBody) {
            methodContent += `${tab}${tab}${tab}${tab}json=body.model_dump() if hasattr(body, 'model_dump') else body,\n`;
        }
        if (haveQueryParams) {
            const paramsDict = '{' + controllerPath.queryParams.map(x => `"${x.name}": q_${snakeCase(x.name)}`).join(', ') + '}';
            methodContent += `${tab}${tab}${tab}${tab}params={k: v for k, v in ${paramsDict}.items() if v is not None},\n`;
        }
        if (haveHeaders) {
            methodContent += `${tab}${tab}${tab}${tab}headers=${headersDict},\n`;
        }
        methodContent += `${tab}${tab}${tab}${tab}**kwargs,\n`;
        methodContent += `${tab}${tab}${tab})\n`;
        methodContent += `${tab}${tab}${tab}response.raise_for_status()\n`;
        methodContent += `${tab}${tab}${tab}return response.json()\n`;

        return { methodContent, methodName };
    }

    getPropDesc(obj: EditorInput | OpenApiDefinition): string {
        const editorInput = (obj as EditorInput)?.editorType
            ? (obj as EditorInput)
            : getEditorInput2(this.swagger, obj as OpenApiDefinition);
        const fileName = this.getFileName(editorInput);
        if (editorInput.editorType === 'EditorPrimitiveInput') {
            const primitiveInput = editorInput as EditorPrimitiveInput;
            switch (primitiveInput.type) {
                case 'number':
                    return primitiveInput.openApiDefinition?.type === 'integer' ? 'int' : 'float';
                case 'string':
                    return 'str';
                case 'boolean':
                    return 'bool';
                case 'date':
                    return 'datetime';
                case 'enum':
                    return fileName ? `models.${fileName}` : 'str';
            }
        }
        if (editorInput.editorType === 'EditorArrayInput') {
            const arrayInput = editorInput as EditorArrayInput;
            return `list[${this.getPropDesc(arrayInput.itemInput)}]`;
        }
        if (editorInput.editorType === 'EditorObjectInput') {
            const objectInput = editorInput as EditorObjectInput;
            if (!objectInput.isDictionary) {
                return fileName ? `models.${fileName}` : 'dict';
            }
            return `dict[${objectInput.dictionaryKeyInput ? this.getPropDesc(objectInput.dictionaryKeyInput) : 'str'}, ${
                objectInput.dictionaryInput ? this.getPropDesc(objectInput.dictionaryInput) : 'Any'
            }]`;
        }
        return 'Any';
    }

    getFileExtension(_isModel: boolean): string {
        return '.py';
    }
}
