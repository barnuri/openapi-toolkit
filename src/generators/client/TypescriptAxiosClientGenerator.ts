import { TypescriptGenerator } from './../TypescriptGenerator';
import { appendFileSync, existsSync, writeFileSync } from 'fs';
import { ApiPath } from '../../models/ApiPath';
import { join } from 'path';
import { capitalize, makeDirIfNotExist } from '../../helpers';

export class TypescriptAxiosClientGenerator extends TypescriptGenerator {
    modelsExportFile = join(this.modelsFolder, 'index.ts');
    controllersExportFile = join(this.controllersFolder, 'index.ts');
    mainExportFile = join(this.options.output, 'index.ts');
    async generateClient(): Promise<void> {
        let mainFileContent = `import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';\n`;
        mainFileContent += `import * as controllers from './controllers';\n`;
        mainFileContent += `export * from './models';\n`;
        mainFileContent += `export * from './controllers';\n`;
        mainFileContent += `export * from './ControllerBase';\n`;
        mainFileContent += `export default (axiosRequestConfig: AxiosRequestConfig) => ({\n`;
        mainFileContent +=
            this.controllersNames
                .map(x => this.getControllerName(x))
                .map(x => `\t${x}: new controllers.${x}(axiosRequestConfig)`)
                .join(',\n') + '\n';
        mainFileContent += `});`;
        writeFileSync(this.mainExportFile, this.disableLinting + mainFileContent);
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
        writeFileSync(controllerFile, this.disableLinting + controllerContent);
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
}
