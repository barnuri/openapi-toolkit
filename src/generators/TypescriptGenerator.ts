import { EditorArrayInput } from '../models/editor/EditorArrayInput';
import { EditorInput } from '../models/editor/EditorInput';
import { appendFileSync, existsSync, writeFileSync } from 'fs';
import { ApiPath } from '../models/ApiPath';
import { join } from 'path';
import { capitalize, getEditorInput2, makeDirIfNotExist } from '../helpers';
import { GeneratorAbstract } from './GeneratorAbstract';
import { EditorObjectInput, EditorPrimitiveInput, OpenApiDefinition } from '../models';

export abstract class TypescriptGenerator extends GeneratorAbstract {
    modelsExportFile = join(this.modelsFolder, 'index.ts');
    controllersExportFile = join(this.controllersFolder, 'index.ts');
    mainExportFile = join(this.options.output, 'index.ts');
    abstract generateClient(): Promise<void>;
    shouldGenerateModel(editorInput: EditorInput) {
        const res = super.shouldGenerateModel(editorInput);
        if (res) {
            appendFileSync(this.modelsExportFile, `export * from './${this.getFileName(editorInput) + this.getFileAdditionalExtension()}'\n`);
        }
        return res;
    }
    async generateObject(objectInput: EditorObjectInput): Promise<void> {
        if (!this.shouldGenerateModel(objectInput)) {
            return;
        }
        const modelFile = join(this.modelsFolder, this.getFileName(objectInput) + this.getFileExtension(true));
        const extendStr =
            objectInput.implements.length > 0
                ? `extends ${objectInput.implements
                      .map(x => `models.${this.options.modelNamePrefix}${x}${this.options.modelNameSuffix.split('.')[0]}`)
                      .join(', ')}`
                : ``;
        const modelFileContent = `import * as models from './index';
export interface ${this.getFileName(objectInput)} ${extendStr} {
${objectInput.properties.map(x => `\t${x.name.replace(/\[i\]/g, '')}${x.nullable || !x.required ? '?' : ''}: ${this.getPropDesc(x)}`).join(';\n')}
}`;
        writeFileSync(modelFile, modelFileContent);
    }
    getPropDesc(obj: EditorInput | OpenApiDefinition) {
        const editorInput = (obj as EditorInput)?.editorType ? (obj as EditorInput) : getEditorInput2(this.swagger, obj as OpenApiDefinition);
        const fileName = this.getFileName(editorInput);

        if (editorInput.editorType === 'EditorPrimitiveInput') {
            const primitiveInput = editorInput as EditorPrimitiveInput;
            switch (primitiveInput.type) {
                case 'number':
                case 'string':
                case 'boolean':
                    return primitiveInput.type;
                case 'date':
                    return 'Date';
                case 'enum':
                    if (!fileName) {
                        return 'any';
                    }
                    return `models.${fileName}`;
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
                    return 'any';
                }
                return `models.${fileName}`;
            }
            return `{ [key: string]: ${objectInput.dictionaryInput ? this.getPropDesc(objectInput.dictionaryInput) : 'any'} }`;
        }
    }
    async generateEnum(enumInput: EditorPrimitiveInput, enumVals: { [name: string]: string | number }): Promise<void> {
        if (!this.shouldGenerateModel(enumInput)) {
            return;
        }
        const modelFile = join(this.modelsFolder, this.getFileName(enumInput) + this.getFileExtension(true));
        const modelFileContent = `   
export enum ${this.getFileName(enumInput)} {
${Object.keys(enumVals)
    .map(x => `\t${x} = ${typeof enumVals[x] === 'number' ? enumVals[x] : `'${enumVals[x]}'`}`)
    .join(',\n')}
}
            `;
        writeFileSync(modelFile, modelFileContent);
    }
    async generateController(controller: string, controlerPaths: ApiPath[]): Promise<void> {
        const controllerName = this.getControllerName(controller);
        this.generateBaseController();
        makeDirIfNotExist(this.controllersFolder);
        appendFileSync(this.controllersExportFile, `export * from './${controllerName}'\n`);
        console.log(`${controllerName} - ${controlerPaths.length}`);
        let controllerContent = `import * as models from '../models';\n`;
        controllerContent += `import { AxiosRequestConfig } from 'axios';\n`;
        controllerContent += `import { ControllerBase } from '../ControllerBase';\n`;
        controllerContent += `export class ${controllerName} extends ControllerBase {\n`;
        for (const controlerPath of controlerPaths) {
            console.log(`\t${controlerPath.method} - ${controlerPath.path}`);
            const pathFixed = controlerPath.path.replace(/\/|-|{|}/g, '');
            const methodName = controlerPath.method.toLowerCase() + capitalize(pathFixed);
            let requestType = controlerPath.body.haveBody ? this.getPropDesc(controlerPath.body.schema) : 'undefined';
            const responseType = this.getPropDesc(controlerPath.response);
            const bodyParam = controlerPath.body.haveBody ? `body: ${requestType}${!controlerPath.body.required ? ` | undefined` : ''}, ` : '';
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
            controllerContent += `\t\t\t${controlerPath.body.haveBody ? 'body' : 'undefined'},\n`;
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
        const controllerBaseFile = join(this.options.output, 'ControllerBase.ts');
        if (existsSync(controllerBaseFile)) {
            return;
        }
        const baseControllerContent = `import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
export class ControllerBase {
    axiosInstance: AxiosInstance;
    constructor(public axiosSettings?: AxiosRequestConfig) {
        this.axiosInstance = axios.create(axiosSettings);
    }
    protected method<T, S>(method: string, path: string, body: T | undefined, headers?: { [key: string]: string | undefined }, customConfig?: AxiosRequestConfig): Promise<S> {
        return this.axiosInstance.request<T, S>({
            url: path,
            method: method as any,
            headers,
            data: body,
            ...customConfig,
        });
    }
}
        `;
        writeFileSync(controllerBaseFile, baseControllerContent);
    }

    getFileExtension(isModel: boolean) {
        return (isModel ? this.getFileAdditionalExtension() + '.ts' : '.ts').replace('..ts', '.ts');
    }
}
