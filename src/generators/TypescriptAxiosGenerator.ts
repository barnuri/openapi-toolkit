import { EditorArrayInput } from './../models/editor/EditorArrayInput';
import { EditorInput } from './../models/editor/EditorInput';
import { appendFileSync, existsSync, writeFileSync } from 'fs';
import { ApiPath } from './../models/ApiPath';
import { join } from 'path';
import { capitalize, makeDirIfNotExist } from '../helpers';
import { GeneratorAbstract } from './GeneratorAbstract';
import { EditorObjectInput, EditorPrimitiveInput } from '../models';

export class TypescriptAxiosGenerator extends GeneratorAbstract {
    modelsFolder = join(this.outputPath, 'models');
    modelsExportFile = join(this.modelsFolder, 'index.ts');
    controllersFolder = join(this.outputPath, 'controllers');
    controllersExportFile = join(this.controllersFolder, 'index.ts');
    mainExportFile = join(this.outputPath, 'index.ts');
    async generateClient(): Promise<void> {
        let mainFileContent = `import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';\n`;
        mainFileContent += `import * as controllers from './controllers';\n`;
        mainFileContent += `export * from './models';\n`;
        mainFileContent += `export * from './controllers';\n`;
        mainFileContent += `export * from './ControllerBase';\n`;
        mainFileContent += `export default (axiosRequestConfig: AxiosRequestConfig) => ({\n`;
        mainFileContent +=
            this.controllersNames
                .map(x => x + 'Controller')
                .map(x => `\t${x}: new controllers.${x}(axiosRequestConfig)`)
                .join(',\n') + '\n';
        mainFileContent += `});`;
        writeFileSync(this.mainExportFile, mainFileContent);
    }
    shouldGenerateModel(editorInput: EditorInput) {
        makeDirIfNotExist(this.modelsFolder);
        const modelFile = join(this.modelsFolder, this.getFileName(editorInput) + '.ts');
        if (existsSync(modelFile)) {
            return false;
        }
        appendFileSync(this.modelsExportFile, `export * from './${this.getFileName(editorInput)}'\n`);
        return true;
    }
    async generateObject(objectInput: EditorObjectInput): Promise<void> {
        if (!this.shouldGenerateModel(objectInput)) {
            return;
        }
        const modelFile = join(this.modelsFolder, this.getFileName(objectInput) + '.ts');
        const extendStr = objectInput.implements.length > 0 ? `extends ${objectInput.implements.map(x => `models.${x}`).join(', ')}` : ``;
        const modelFileContent = `import * as models from './index';
export interface ${this.getFileName(objectInput)} ${extendStr} {
${objectInput.properties.map(x => `\t${x.name.replace(/\[i\]/g, '')}${x.nullable || !x.required ? '?' : ''}: ${this.getPropDesc(x)}`).join(';\n')}
}
        `;
        writeFileSync(modelFile, modelFileContent);
    }
    getFileName(editorInput: EditorInput) {
        const name = editorInput.className || (editorInput as any).definistionName || editorInput.title;
        return name;
    }
    getPropDesc(editorInput: EditorInput) {
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
                    return `models.${this.getFileName(primitiveInput)}`;
            }
        }
        if (editorInput.editorType === 'EditorArrayInput') {
            const arrayInput = editorInput as EditorArrayInput;
            return `${this.getPropDesc(arrayInput.itemInput)}[]`;
        }
        if (editorInput.editorType === 'EditorObjectInput') {
            const objectInput = editorInput as EditorObjectInput;
            if (!objectInput.isDictionary) {
                return `models.${this.getFileName(objectInput)}`;
            }
            return `{ [key: string]: ${objectInput.dictionaryInput ? this.getPropDesc(objectInput.dictionaryInput) : 'any'} }`;
        }
    }
    async generateEnum(enumInput: EditorPrimitiveInput, enumVals: { [name: string]: string | number }): Promise<void> {
        if (!this.shouldGenerateModel(enumInput)) {
            return;
        }
        const modelFile = join(this.modelsFolder, this.getFileName(enumInput) + '.ts');
        const modelFileContent = `   
export enum ${this.getFileName(enumInput)} {
${Object.keys(enumVals)
    .map(x => `\t${x} = ${typeof enumVals[x] === 'number' ? enumVals[x] : `'${enumVals[x]}'`}`)
    .join(',\n')}
}
            `;
        writeFileSync(modelFile, modelFileContent);
    }
    async generateController(controllerName: string, controlerPaths: ApiPath[]): Promise<void> {
        this.generateBaseController();
        makeDirIfNotExist(this.controllersFolder);
        controllerName += 'Controller';
        appendFileSync(this.controllersExportFile, `export * from './${controllerName}'\n`);
        console.log(`${controllerName} - ${controlerPaths.length}`);
        let controllerContent = `import * as models from '../models';\n`;
        controllerContent += `import { AxiosRequestConfig } from 'axios';\n`;
        controllerContent += `import { ControllerBase } from '../ControllerBase';\n`;
        controllerContent += `export class ${controllerName} extends ControllerBase {\n`;
        for (const controlerPath of controlerPaths) {
            console.log(`\t${controlerPath.method} - ${controlerPath.path}`);
            const pathFixed = controlerPath.path.replace(/\/|-/g, '');
            const methodName = controlerPath.method.toLowerCase() + capitalize(pathFixed);
            const responseType = 'any';
            const requestType = 'any';
            controllerContent += `\tasync ${methodName}(body: ${requestType}, customConfig?: AxiosRequestConfig): Promise<${responseType}> {\n`;
            controllerContent += `\t\treturn this.method<${requestType},${responseType}>(\n`;
            controllerContent += `\t\t\t'${controlerPath.method.toLowerCase()}',\n`;
            controllerContent += `\t\t\t'${pathFixed}',\n`;
            controllerContent += `\t\t\tbody,\n`;
            controllerContent += `\t\t\t{},\n`;
            controllerContent += `\t\t\tcustomConfig\n`;
            controllerContent += `\t\t);\n`;
            controllerContent += `\t}\n`;
        }
        controllerContent += `}`;
        const controllerFile = join(this.controllersFolder, controllerName + '.ts');
        writeFileSync(controllerFile, controllerContent);
    }
    generateBaseController() {
        const controllerBaseFile = join(this.outputPath, 'ControllerBase.ts');
        if (existsSync(controllerBaseFile)) {
            return;
        }
        const baseControllerContent = `import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
export class ControllerBase {
    axiosInstance: AxiosInstance;
    constructor(public axiosSettings?: AxiosRequestConfig) {
        this.axiosInstance = axios.create(axiosSettings);
    }
    protected method<T, S>(method: string, path: string, body: T | undefined, headers?: { [key: string]: string }, customConfig?: AxiosRequestConfig): Promise<S> {
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
}
