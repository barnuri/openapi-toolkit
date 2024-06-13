import { EditorInput } from '../models/editor/EditorInput';
import { deleteFilesByPath, fixPath, makeDirIfNotExist } from '../helpers/generatorHelpers';
import { getAllEditors, getApiPaths, getAllEditorInputsByEditors, capitalize, distinctByProp, cleanString } from '../helpers';
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
        options.namespace = options.namespace || '';
        this.generatedFiles = [];
        this.filesNames = [];
        this.swagger = swagger;
        this.options.output = fixPath(options.output);
        console.log('-----  start parsing -----'.cyan());
        console.log('parsing models');
        this.editors = getAllEditors(swagger, options.debugLogs);
        console.log('parse all api pathes');
        this.apiPaths = getApiPaths(swagger);
        this.controllersNames = distinctByProp([...new Set(this.apiPaths.map(x => x.controller))], x => x.toLowerCase());
        this.allEditorInputs = getAllEditorInputsByEditors(this.editors);
        this.allObjectEditorInputs = this.allEditorInputs.filter(x => x.editorType === 'EditorObjectInput').map(x => x as EditorObjectInput);
        this.allPrimitiveEditorInput = this.allEditorInputs.filter(x => x.editorType === 'EditorPrimitiveInput').map(x => x as EditorPrimitiveInput);
        this.allEnumsEditorInput = this.allPrimitiveEditorInput.filter(x => x.enumNames.length + x.enumsOptions.length + x.enumValues.length > 0);
        this.haveModels = this.allObjectEditorInputs.length + this.allEnumsEditorInput.length > 0;
        console.log('-----  done parsing -----'.green());
    }

    async generate(): Promise<void> {
        console.log('-----  start generating -----'.cyan());
        this.generatedFiles = [];
        this.filesNames = [];
        this.methodsNames = {};
        deleteFilesByPath(this.options.output);
        makeDirIfNotExist(this.options.output);
        makeDirIfNotExist(this.modelsFolder);
        if (!this.options.modelsOnly) {
            makeDirIfNotExist(this.controllersFolder);
        }
        await this.generateModels();
        if (!this.options.modelsOnly) {
            await this.generateControllers();
            console.log('----- generating client -----'.cyan());
            this.generateClient();
        }
        console.log('----- done -----'.green());
    }

    private async generateControllers() {
        console.log('----- generating controllers -----'.cyan());
        for (const controllerName of this.controllersNames) {
            const controllerPaths = this.apiPaths.filter(x => x.controller.toLowerCase() === controllerName.toLowerCase());
            const controllerDisplay = `${this.getControllerName(controllerName)} - methods: ${controllerPaths.length}`;
            console.log(' ');
            console.log('-'.repeat(controllerDisplay.length).cyan());
            console.log(controllerDisplay);
            console.log('-'.repeat(controllerDisplay.length).cyan());
            await this.generateController(controllerName, controllerPaths);
        }
        console.log(' ');
    }

    private async generateModels() {
        console.log('-----  generating object models -----'.cyan());
        for (const objectInput of this.allObjectEditorInputs) {
            if (objectInput.isDictionary) {
                continue;
            }
            await this.generateObject(objectInput);
        }
        console.log('-----  generating enum models -----'.cyan());
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
            name = cleanString(name);
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
            const res = this.generateControllerMethodContent(controller, controllerPath);
            content += res.methodContent;
            console.log(`\t${this.httpMethodFormat(controllerPath.method)} - ${controllerPath.path} => ${controller}.${res.methodName}`);
        }
        return content;
    }

    private httpMethodFormat(httpMethod: string) {
        httpMethod = httpMethod.toUpperCase();
        if (httpMethod === 'GET') {
            return httpMethod.blue();
        }
        if (httpMethod === 'POST') {
            return httpMethod.green();
        }
        if (httpMethod === 'PUT') {
            return httpMethod.yellow();
        }
        if (httpMethod === 'DELETE') {
            return httpMethod.red();
        }
        if (httpMethod === 'PATCH') {
            return httpMethod.magenta();
        }
        if (httpMethod === 'HEAD') {
            return httpMethod.cyan();
        }
        return httpMethod;
    }

    getMethodName(controllerPath: ApiPath, prefix: string = '', suffix: string = '') {
        const generateMethodName = () => {
            let longName = controllerPath.method.toLowerCase() + capitalize(controllerPath.path);
            longName = cleanString(longName);
            if (this.options.longMethodName) {
                return longName;
            }
            let shortName = '';
            try {
                shortName = controllerPath.path.split('?')[0];
                shortName = shortName.toLowerCase().startsWith('/api') ? shortName.substring('/api'.length) : shortName;
                shortName = !shortName.toLowerCase().startsWith(`/${controllerPath.controller}/`.toLowerCase())
                    ? shortName
                    : shortName.substring(`/${controllerPath.controller}/`.length);
                shortName = capitalize(shortName);
                shortName = cleanString(shortName);
                shortName = controllerPath.method.toLowerCase() + capitalize(shortName);
            } catch {}
            return !shortName ? longName : cleanString(shortName);
        };
        const methodName = `${prefix}${generateMethodName()}${suffix}`;
        const key = `${controllerPath.controller}_${methodName}`;
        if (!this.methodsNames[key]) {
            this.methodsNames[key] = 0;
        }
        const extraText = this.methodsNames[key] > 0 ? `${this.methodsNames[key]}` : '';
        this.methodsNames[key]++;
        return `${methodName}${extraText}`;
    }

    getEnumValueName(name: string) {
        const specialChars = ['-', ' ', '!'];
        const specialKeywords = ['in', 'public', 'private', 'readonly'];
        if (specialChars.filter(x => name.includes(x)).length > 0) { return `"${name}"`; }
        if (specialKeywords.filter(x => name === x).length > 0) { return `"${name}"`; }
        if (!isNaN(parseFloat(name))) { return `Num${name}`; }
        return name;        
    }

    abstract getFileExtension(isModel: boolean);

    abstract generateObject(objectInput: EditorObjectInput): void;

    abstract generateEnum(enumInput: EditorPrimitiveInput, enumVals: { [name: string]: string | number }): void;

    abstract generateController(controller: string, controllerPaths: ApiPath[]): void;

    abstract generateControllerMethodContent(controller: string, controllerPath: ApiPath): { methodContent: string; methodName: string };

    abstract generateClient(): void;
}
