import { EditorInput } from '../models/editor/EditorInput';
import { deleteFilesByPath, fixPath, makeDirIfNotExist, isExists } from '../helpers/generatorHelpers';
import { getAllEditors, getApiPaths, getAllEditorInputsByEditors, capitalize, distinctByProp, cleanString } from '../helpers';
import { OpenApiDocument, Editor, ApiPath, EditorPrimitiveInput, EditorObjectInput } from '../models/index';
import GeneratorsOptions from '../models/GeneratorsOptions';
import { join } from 'path';
import ParsingResult from '../models/ParsingResult';

export abstract class GeneratorAbstract {
    modelsFolder = join(this.options.output, this.options.modelsFolderName);
    controllersFolder = join(this.options.output, this.options.controllersFolderName);
    filesNames: string[];
    methodsNames: { [name: string]: number } = {};

    constructor(
        public swagger: OpenApiDocument,
        public options: GeneratorsOptions,
        public parsingResult: ParsingResult,
    ) {
        this.filesNames = [];
        this.swagger = swagger;
        this.options = options;
        this.parsingResult = parsingResult;
    }

    async generate() {
        console.log('-----  start generating -----'.cyan());
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
        for (const controllerName of this.parsingResult.controllersNames) {
            const controllerPaths = this.parsingResult.apiPaths.filter(x => x.controller.toLowerCase() === controllerName.toLowerCase());
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
        for (const objectInput of this.parsingResult.allObjectEditorInputs) {
            await this._generateObject(objectInput);
        }
        console.log('-----  generating enum models -----'.cyan());
        for (const enumInput of this.parsingResult.allEnumsEditorInput) {
            await this._generateEnum(enumInput);
        }
    }

    private async _generateEnum(enumInput: EditorPrimitiveInput) {
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

    private async _generateObject(objectInput: EditorObjectInput) {
        if (objectInput.isDictionary) {
            return;
        }
        await this.generateObject(objectInput);
        for (const editorInput of objectInput.properties) {
            await this.generateByInput(editorInput);
        }
    }

    private async generateByInput(editorInput: EditorInput) {
        if (!this.shouldGenerateModel(editorInput)) {
            return;
        }
        if (editorInput.editorType === 'EditorPrimitiveInput') {
            await this._generateEnum(editorInput as EditorPrimitiveInput);
        }
        if (editorInput.editorType === 'EditorObjectInput') {
            await this._generateObject(editorInput as EditorObjectInput);
        }
    }

    shouldGenerateModel(editorInput: EditorInput) {
        makeDirIfNotExist(this.modelsFolder);
        if ((editorInput as EditorObjectInput)?.isDictionary === true) {
            return false;
        }
        const fileName = this.getFileName(editorInput);
        if (!fileName) {
            return false;
        }
        const modelFile = join(this.modelsFolder, this.getFileName(editorInput) + this.getFileExtension(true));
        return this.shouldGenerateFile(modelFile);
    }

    shouldGenerateFile(path: string) {
        if (isExists(path)) {
            return false;
        }
        return true;
    }

    getFileName(editorInput: EditorInput) {
        const getFileName = () => {
            let name: string | undefined = editorInput.className || (editorInput as any).definistionName || editorInput.title;
            if (!name || name === 'undefined' || name === '') {
                name = undefined;
            }
            if (
                !name &&
                editorInput.editorType === 'EditorPrimitiveInput' &&
                (editorInput as EditorPrimitiveInput).enumsOptions.length > 0
            ) {
                name = editorInput.name;
                name = name ? name + 'Enum' : name;
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
        fileName = capitalize(fileName);
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
        if (specialChars.filter(x => name.includes(x)).length > 0) {
            return `"${name}"`;
        }
        if (specialKeywords.filter(x => name === x).length > 0) {
            return `"${name}"`;
        }
        if (!isNaN(parseFloat(name))) {
            return `Num${name}`;
        }
        return name;
    }

    abstract getFileExtension(isModel: boolean);

    abstract generateObject(objectInput: EditorObjectInput): void;

    abstract generateEnum(enumInput: EditorPrimitiveInput, enumVals: { [name: string]: string | number }): void;

    abstract generateController(controller: string, controllerPaths: ApiPath[]): void;

    abstract generateControllerMethodContent(controller: string, controllerPath: ApiPath): { methodContent: string; methodName: string };

    abstract generateClient(): void;
}
