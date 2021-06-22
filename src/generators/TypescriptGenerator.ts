import { EditorArrayInput } from '../models/editor/EditorArrayInput';
import { EditorInput } from '../models/editor/EditorInput';
import { appendFileSync, existsSync, writeFileSync } from 'fs';
import { ApiPath } from '../models/ApiPath';
import { join } from 'path';
import { getEditorInput2 } from '../helpers';
import { GeneratorAbstract } from './GeneratorAbstract';
import { EditorObjectInput, EditorPrimitiveInput, OpenApiDefinition } from '../models';

export abstract class TypescriptGenerator extends GeneratorAbstract {
    modelsExportFile = join(this.modelsFolder, 'index.ts');
    controllersExportFile = join(this.controllersFolder, 'index.ts');
    mainExportFile = join(this.options.output, 'index.ts');
    disableLinting = '/* eslint-disable */\n/* tslint:disable */\n';
    shouldGenerateModel(editorInput: EditorInput) {
        const res = super.shouldGenerateModel(editorInput);
        if (res) {
            appendFileSync(this.modelsExportFile, `export * from './${this.getFileName(editorInput) + this.getFileAdditionalExtension()}'\n`);
        }
        return res;
    }
    generateObject(objectInput: EditorObjectInput): void {
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
        writeFileSync(modelFile, this.disableLinting + modelFileContent);
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
            return `{ [key in ${objectInput.dictionaryKeyInput ? this.getPropDesc(objectInput.dictionaryKeyInput) : 'any'}]: ${
                objectInput.dictionaryInput ? this.getPropDesc(objectInput.dictionaryInput) : 'any'
            } }`;
        }
    }
    generateEnum(enumInput: EditorPrimitiveInput, enumVals: { [name: string]: string | number }): void {
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
        writeFileSync(modelFile, this.disableLinting + modelFileContent);
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
        writeFileSync(controllerBaseFile, this.disableLinting + baseControllerContent);
    }

    getFileExtension(isModel: boolean) {
        return (isModel ? this.getFileAdditionalExtension() + '.ts' : '.ts').replace('..ts', '.ts');
    }
}
