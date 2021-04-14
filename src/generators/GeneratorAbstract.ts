import { EditorInput } from './../models/editor/EditorInput';
import { fixPath, makeDirIfNotExist } from '../helpers/generatorHelpers';
import { getAllEditors, getApiPaths, getAllEditorInputsByEditors } from '../helpers';
import { OpenApiDocument, Editor, ApiPath, EditorPrimitiveInput, EditorObjectInput } from '../models/index';
import rimraf from 'rimraf';

export abstract class GeneratorAbstract {
    editors: Editor[];
    apiPaths: ApiPath[];
    controllersNames: string[];
    allEditorInputs: EditorInput[];
    constructor(public swagger: OpenApiDocument, public outputPath: string) {
        this.swagger = swagger;
        this.editors = getAllEditors(swagger);
        this.apiPaths = getApiPaths(swagger);
        this.outputPath = fixPath(outputPath);
        this.controllersNames = [...new Set(this.apiPaths.map(x => x.controller))];
        this.allEditorInputs = getAllEditorInputsByEditors(this.editors);
    }
    async generate(): Promise<void> {
        console.log('-----  start generating -----');
        rimraf.sync(this.outputPath);
        makeDirIfNotExist(this.outputPath);
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
                controllerName,
                this.apiPaths.filter(x => x.controller === controllerName),
            );
        }
        console.log('----- start generating client -----');
        this.generateClient();
        console.log('----- done -----');
    }
    abstract getFileName(objectInput: EditorInput): string;
    abstract generateObject(objectInput: EditorObjectInput): Promise<void>;
    abstract generateEnum(enumInput: EditorPrimitiveInput, enumVals: { [name: string]: string | number }): Promise<void>;
    abstract generateController(controllerName: string, controlerPaths: ApiPath[]): Promise<void>;
    abstract generateClient(): Promise<void>;
}
