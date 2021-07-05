import { TypescriptGenerator } from './../TypescriptGenerator';
import { appendFileSync, existsSync, writeFileSync } from 'fs';
import { ApiPath } from '../../models/ApiPath';
import { join } from 'path';
import { capitalize, makeDirIfNotExist } from '../../helpers';

export class TypescriptAxiosClientGenerator extends TypescriptGenerator {
    modelsExportFile = join(this.modelsFolder, 'index.ts');
    controllersExportFile = join(this.controllersFolder, 'index.ts');
    mainExportFile = join(this.options.output, 'index.ts');
    generateClient(): void {
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
    generateController(controller: string, controlerPaths: ApiPath[]): void {
        const controllerName = this.getControllerName(controller);
        this.generateBaseController();
        makeDirIfNotExist(this.controllersFolder);
        appendFileSync(this.controllersExportFile, `export * from './${controllerName}'\n`);
        let controllerContent = `import * as models from '../models';\n`;
        controllerContent += `import { AxiosRequestConfig } from 'axios';\n`;
        controllerContent += `import { ControllerBase } from '../ControllerBase';\n`;
        controllerContent += `export class ${controllerName} extends ControllerBase {\n`;
        controllerContent += this.generateControllerMethodsContent(controller, controlerPaths);
        controllerContent += `}`;
        const controllerFile = join(this.controllersFolder, controllerName + this.getFileExtension(false));
        writeFileSync(controllerFile, this.disableLinting + controllerContent);
    }
    generateControllerMethodContent(controller: string, controllerPath: ApiPath): string {
        const methodName = this.getMethodName(controllerPath);
        let requestType = controllerPath.body.haveBody ? this.getPropDesc(controllerPath.body.schema) : 'undefined';
        const responseType = this.getPropDesc(controllerPath.response);
        const bodyParam = controllerPath.body.haveBody ? `body: ${requestType}${!controllerPath.body.required ? ` | undefined` : ''}, ` : '';
        const headers = [...controllerPath.cookieParams, ...controllerPath.headerParams];
        const haveHeaderParams = headers.length > 0;
        const headersParams = haveHeaderParams ? `headers: {${headers.map(x => `${x.name}${x.required ? '' : '?'}: string`)}}, ` : ``;
        const pathParams =
            controllerPath.pathParams.length > 0
                ? `pathParams: {${controllerPath.pathParams.map(x => `${x.name}${x.required ? '' : '?'}: ${this.getPropDesc(x.schema!)}`)}}, `
                : ``;
        let url = controllerPath.path;
        for (const pathParam of controllerPath.pathParams) {
            url = url.replace('{' + pathParam.name + '}', "${pathParams['" + pathParam.name + "']}");
        }
        const haveQueryParams = controllerPath.queryParams.length > 0;
        url += !haveQueryParams ? '' : '?' + controllerPath.queryParams.map(x => `${x.name}=\${queryParams['${x.name}']}`).join('&');
        const queryParams = haveQueryParams
            ? `queryParams: {${controllerPath.queryParams.map(x => `${x.name}${x.required ? '' : '?'}: ${this.getPropDesc(x.schema!)}`)}}, `
            : ``;

        let methodContent = '';
        methodContent += `\tasync ${methodName}(${bodyParam}${pathParams}${queryParams}${headersParams}customConfig?: AxiosRequestConfig): Promise<${responseType}> {\n`;
        methodContent += `\t\treturn this.method<${requestType},${responseType}>(\n`;
        methodContent += `\t\t\t'${controllerPath.method.toLowerCase()}',\n`;
        methodContent += `\t\t\t\`${url}\`,\n`;
        methodContent += `\t\t\t${controllerPath.body.haveBody ? 'body' : 'undefined'},\n`;
        methodContent += `\t\t\t${haveHeaderParams ? 'headers' : 'undefined'},\n`;
        methodContent += `\t\t\tcustomConfig\n`;
        methodContent += `\t\t);\n`;
        methodContent += `\t}\n`;
        return methodContent;
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
        return this.axiosInstance.request<S>({
            url: path,
            method: method as any,
            headers,
            data: body,
            ...customConfig,
        }).then(res => res.data);
    }
}
        `;
        writeFileSync(controllerBaseFile, this.disableLinting + baseControllerContent);
    }
}
