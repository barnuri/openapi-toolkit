import { EditorInput } from './../models/editor/EditorInput';
import { fixPath, makeDirIfNotExist } from '../helpers/generatorHelpers';
import { getAllEditors, getApiPaths, getAllEditorInputsByEditors } from '../helpers';
import { OpenApiDocument, Editor, ApiPath, EditorPrimitiveInput, EditorObjectInput } from '../models/index';
import rimraf from 'rimraf';
import GeneratorsOptions from './GeneratorsOptions';
import { join } from 'path';

export abstract class GeneratorAbstract {
    editors: Editor[];
    apiPaths: ApiPath[];
    controllersNames: string[];
    allEditorInputs: EditorInput[];
    modelsFolder = join(this.options.output, this.options.modelsFolderName);
    controllersFolder = join(this.options.output, this.options.controllersFolderName);

    constructor(public swagger: OpenApiDocument, public options: GeneratorsOptions) {
        this.swagger = swagger;
        this.editors = getAllEditors(swagger);
        this.apiPaths = getApiPaths(swagger);
        this.options.output = fixPath(options.output);
        this.controllersNames = [...new Set(this.apiPaths.map(x => x.controller))];
        this.allEditorInputs = getAllEditorInputsByEditors(this.editors);
    }
    async generate(): Promise<void> {
        console.log('-----  start generating -----');
        rimraf.sync(this.options.output);
        makeDirIfNotExist(this.options.output);
        console.log('-----  start generating object models -----');
        for (const editorInput of this.allEditorInputs.filter(x => x.editorType === 'EditorObjectInput')) {
            const objectInput = editorInput as EditorObjectInput;
            if (objectInput.isDictionary) {
                continue;
            }
            await this.generateObject(objectInput);
        }
        console.log('-----  start generating enum models -----');
        for (const editorInput of this.allEditorInputs.filter(x => x.editorType === 'EditorPrimitiveInput')) {
            const primitiveInput = editorInput as EditorPrimitiveInput;
            if (primitiveInput.enumNames.length + primitiveInput.enumsOptions.length + primitiveInput.enumValues.length <= 0) {
                continue;
            }
            const enumVals = {};
            if (primitiveInput.enumNames.length === primitiveInput.enumValues.length) {
                for (let i = 0; i < primitiveInput.enumNames.length; i++) {
                    enumVals[primitiveInput.enumNames[i]] = primitiveInput.enumValues[i];
                }
            } else {
                primitiveInput.enumsOptions.forEach(x => (enumVals[x] = x));
            }
            await this.generateEnum(primitiveInput, enumVals);
        }
        console.log('----- start generating controllers -----');
        for (const controllerName of this.controllersNames) {
            await this.generateController(
                `${this.options.controllerNamePrefix}${controllerName}${this.options.controllerNameSuffix}`,
                this.apiPaths.filter(x => x.controller === controllerName),
            );
        }
        console.log('----- start generating client -----');
        this.generateClient();
        console.log('----- done -----');
    }
    getFileName(editorInput: EditorInput) {
        let name = editorInput.className || (editorInput as any).definistionName || editorInput.title;
        if (!name || name === 'undefined' || name === '') {
            return undefined;
        }
        return this.options.modelNamePrefix + name + this.options.modelNameSuffix;
    }
    abstract generateObject(objectInput: EditorObjectInput): Promise<void>;
    abstract generateEnum(enumInput: EditorPrimitiveInput, enumVals: { [name: string]: string | number }): Promise<void>;
    abstract generateController(controllerName: string, controlerPaths: ApiPath[]): Promise<void>;
    abstract generateClient(): Promise<void>;
}
