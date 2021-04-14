import { fixPath, makeDirIfNotExist } from '../generator/generatorHelpers';
import { getAllEditors, getApiPaths } from '../helpers';
import { TypescriptAxiosGenerator } from './generators/TypescriptAxiosGenerator';
import { OpenApiDocument, Editor, ApiPath } from './index';
export abstract class GeneratorAbstract {
    editors: Editor[];
    apiPaths: ApiPath[];
    controllersNames: string[];
    constructor(public swagger: OpenApiDocument, public outputPath: string) {
        this.swagger = swagger;
        this.editors = getAllEditors(swagger);
        this.apiPaths = getApiPaths(swagger);
        this.outputPath = fixPath(outputPath);
        this.controllersNames = [...new Set(this.apiPaths.map(x => x.controller))];
    }
    async generate(): Promise<void> {
        console.log('-----  start generating -----');
        makeDirIfNotExist(this.outputPath);
        console.log('-----  start generating models -----');
        for (const editor of this.editors) {
            await this.generateModel(editor);
        }
        console.log('----- start generating controllers -----');
        for (const controllerName of this.controllersNames) {
            await this.generateController(
                controllerName,
                this.apiPaths.filter(x => x.controller === controllerName),
            );
        }
    }
    abstract generateModel(editors: Editor): Promise<void>;
    abstract generateController(controllerName: string, controlerPaths: ApiPath[]): Promise<void>;
}
