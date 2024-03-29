import { EditorInput } from '../models/editor/EditorInput';
import { deleteFilesByPath, fixPath, makeDirIfNotExist } from '../helpers/generatorHelpers';
import { getAllEditors, getApiPaths, getAllEditorInputsByEditors, capitalize } from '../helpers';
import { OpenApiDocument, Editor, ApiPath, EditorPrimitiveInput, EditorObjectInput } from '../models/index';
import GeneratorsOptions from '../models/GeneratorsOptions';
import { join } from 'path';

export abstract class GeneratorAbstract {
    editors: Editor[];
    apiPaths: ApiPath[];
    controllersNames: string[];
    allEditorInputs: EditorInput[];
    allObjectEditorInputs: EditorObjectInput[];
    allPrimitiveEditorInput: EditorPrimitiveInput[];
    allEnumsEditorInput: EditorPrimitiveInput[];
    modelsFolder = join(this.options.output, this.options.modelsFolderName);
    controllersFolder = join(this.options.output, this.options.controllersFolderName);
    generatedFiles: string[];
    filesNames: string[];
    haveModels: boolean;
    cleanRegex = /\/| |-|{|}|\.|_|\[|\]|,/g;
    methodsNames: { [name: string]: number } = {};
    constructor(public swagger: OpenApiDocument, public options: GeneratorsOptions) {
        if (!options.pathOrUrl) {
            throw new Error('pathOrUrl is required');
        }
        if (!options.output) {
            throw new Error('output is required');
        }
        if (!options.generator) {
            throw new Error('generator is required');
        }
        if (!options.type) {
            throw new Error('type is required');
        }

        options.modelsFolderName = options.modelsFolderName || '';
        options.modelNamePrefix = options.modelNamePrefix || '';
        options.modelNameSuffix = options.modelNameSuffix || '';
        options.controllersFolderName = options.controllersFolderName || '';
        options.controllerNamePrefix = options.controllerNamePrefix || '';
        options.controllerNameSuffix = options.controllerNameSuffix || '';
        options.namepsace = options.namepsace || '';
        this.generatedFiles = [];
        this.filesNames = [];
        this.swagger = swagger;
        this.options.output = fixPath(options.output);
        console.log('parse models');
        this.editors = getAllEditors(swagger, options.debugLogs);
        console.log('parse all api pathes');
        this.apiPaths = getApiPaths(swagger);
        this.controllersNames = [...new Set(this.apiPaths.map(x => x.controller))];
        this.allEditorInputs = getAllEditorInputsByEditors(this.editors);
        this.allObjectEditorInputs = this.allEditorInputs.filter(x => x.editorType === 'EditorObjectInput').map(x => x as EditorObjectInput);
        this.allPrimitiveEditorInput = this.allEditorInputs.filter(x => x.editorType === 'EditorPrimitiveInput').map(x => x as EditorPrimitiveInput);
        this.allEnumsEditorInput = this.allPrimitiveEditorInput.filter(x => x.enumNames.length + x.enumsOptions.length + x.enumValues.length > 0);
        this.haveModels = this.allObjectEditorInputs.length + this.allEnumsEditorInput.length > 0;
    }
    async generate(): Promise<void> {
        console.log('-----  start generating -----');
        this.generatedFiles = [];
        this.filesNames = [];
        this.methodsNames = {};
        deleteFilesByPath(this.options.output);
        makeDirIfNotExist(this.options.output);
        makeDirIfNotExist(this.modelsFolder);
        makeDirIfNotExist(this.controllersFolder);
        console.log('-----  start generating object models -----');
        for (const objectInput of this.allObjectEditorInputs) {
            if (objectInput.isDictionary) {
                continue;
            }
            await this.generateObject(objectInput);
        }
        console.log('-----  start generating enum models -----');
        for (const enumInput of this.allEnumsEditorInput) {
            const enumVals = {};
            if (enumInput.enumNames.length === enumInput.enumValues.length) {
                for (let i = 0; i < enumInput.enumNames.length; i++) {
                    enumVals[enumInput.enumNames[i]] = enumInput.enumValues[i];
                }
            } else {
                enumInput.enumsOptions.forEach(x => (enumVals[x] = x));
            }
            await this.generateEnum(enumInput, enumVals);
        }
        console.log('----- start generating controllers -----');
        for (const controllerName of this.controllersNames) {
            const controllerPaths = this.apiPaths.filter(x => x.controller === controllerName);
            console.log(`${controllerName} - ${controllerPaths.length}`);
            await this.generateController(controllerName, controllerPaths);
        }
        console.log('----- start generating client -----');
        this.generateClient();
        console.log('----- done -----');
    }
    shouldGenerateModel(editorInput: EditorInput) {
        makeDirIfNotExist(this.modelsFolder);
        const fileName = this.getFileName(editorInput);
        if (!fileName) {
            return false;
        }
        const modelFile = join(this.modelsFolder, this.getFileName(editorInput) + this.getFileExtension(true));
        return this.shouldGenerateFile(modelFile);
    }
    shouldGenerateFile(path: string) {
        if (this.generatedFiles.filter(x => x.toLowerCase() === path.toLowerCase()).length > 0) {
            return false;
        }
        this.generatedFiles.push(path);
        return true;
    }
    getFileName(editorInput: EditorInput) {
        const getFileName = () => {
            let name: string | undefined = editorInput.className || (editorInput as any).definistionName || editorInput.title;
            if (!name || name === 'undefined' || name === '') {
                name = undefined;
            }
            if (!name && editorInput.editorType === 'EditorPrimitiveInput' && (editorInput as EditorPrimitiveInput).enumsOptions.length > 0) {
                name = editorInput.name;
            }
            if (!name || name === 'undefined' || name === '') {
                return undefined;
            }
            name = name.replace(this.cleanRegex, '');
            return this.options.modelNamePrefix + capitalize(name) + this.options.modelNameSuffix.split('.')[0];
        };
        let fileName = getFileName();
        if (!fileName) {
            return undefined;
        }
        const modelFile = join(this.modelsFolder, fileName + this.getFileExtension(true));
        const path = this.filesNames.find(x => x.toLowerCase() === modelFile.toLowerCase());
        if (path) {
            fileName = path.replace(/\\/g, '/').split('/').pop()?.split('.')[0];
        } else {
            this.filesNames.push(modelFile);
        }
        return fileName;
    }
    getControllerName(controllerName: string) {
        return `${this.options.controllerNamePrefix}${capitalize(controllerName)}${this.options.controllerNameSuffix}`;
    }
    getFileAdditionalExtension() {
        const suffix = this.options.modelNameSuffix.split('.').filter(x => x);
        if (suffix.length < 1) {
            return '';
        }
        return ('.' + this.options.modelNameSuffix.split('.').slice(1).join('.')).replace('..ts', '');
    }
    generateControllerMethodsContent(controller: string, controllerPaths: ApiPath[]): string {
        let content = '';
        for (const controllerPath of controllerPaths) {
            console.log(`\t${controllerPath.method} - ${controllerPath.path}`);
            content += this.generateControllerMethodContent(controller, controllerPath);
        }
        return content;
    }
    getMethodName(controllerPath: ApiPath, prefix: string = '', suffix: string = '') {
        const methodName = () => {
            const longName = controllerPath.method.toLowerCase() + capitalize(controllerPath.path.replace(this.cleanRegex, ''));
            if (this.options.longMethodName) {
                return longName;
            }
            let shortName = '';
            try {
                shortName = controllerPath.path.split('?')[0];
                shortName = shortName.toLowerCase().startsWith('/api') ? shortName.substring(4) : shortName;
                shortName =
                    shortName.split(`/${controllerPath.controller}/`).length <= 1
                        ? shortName
                        : shortName.split(`/${controllerPath.controller}/`).slice(1).join(`/${controllerPath.controller}/`);
                shortName = shortName.replace(this.cleanRegex, '');
                shortName = !(shortName || '').trim() ? '' : controllerPath.method.toLowerCase() + capitalize(shortName);
            } catch {}
            return !shortName ? longName : shortName.replace(this.cleanRegex, '').trim();
        };
        const res = `${prefix}${methodName()}${suffix}`;
        if (!this.methodsNames[res]) {
            this.methodsNames[res] = 0;
        }
        const extraText = this.methodsNames[res] > 0 ? `${this.methodsNames[res]}` : '';
        this.methodsNames[res]++;
        return `${res}${extraText}`;
    }
    abstract getFileExtension(isModel: boolean);
    abstract generateObject(objectInput: EditorObjectInput): void;
    abstract generateEnum(enumInput: EditorPrimitiveInput, enumVals: { [name: string]: string | number }): void;
    abstract generateController(controller: string, controllerPaths: ApiPath[]): void;
    abstract generateControllerMethodContent(controller: string, controllerPath: ApiPath): string;
    abstract generateClient(): void;
}
