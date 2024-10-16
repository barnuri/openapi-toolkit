import { TypescriptGenerator } from './../TypescriptGenerator';
import { appendFileSync, writeFileSync } from 'fs';
import { ApiPath } from '../../models/ApiPath';
import { join } from 'path';
import { makeDirIfNotExist } from '../../helpers';

export class TypescriptAxiosClientGenerator extends TypescriptGenerator {
    modelsExportFile = join(this.modelsFolder, 'index.ts');
    controllersExportFile = join(this.controllersFolder, 'index.ts');
    mainExportFile = join(this.options.output, 'index.ts');
    generateClient(): void {
        let mainFileContent = `import axios, { AxiosRequestConfig, AxiosInstance } from 'axios';
import * as controllers from './controllers';
export * from './models';
export * from './controllers';
export * from './ControllerBase';

class ApiClient {
${this.parsingResult.controllersNames
    .map(x => this.getControllerName(x))
    .map(x => `\tpublic ${x}: controllers.${x}`)
    .join(';\n')}
    
    constructor(public axiosRequestConfig?: AxiosRequestConfig, public axiosInstance?: AxiosInstance) {
        this.axiosRequestConfig = axiosRequestConfig || {}; 
        this.axiosInstance = axiosInstance || axios.create(this.axiosRequestConfig);   
${this.parsingResult.controllersNames
    .map(x => this.getControllerName(x))
    .map(x => `\t\tthis.${x} = new controllers.${x}(this.axiosInstance)`)
    .join(',\n')}
    }
}

export default ApiClient;`;
        writeFileSync(this.mainExportFile, this.disableLinting + mainFileContent);
    }
    getControllersImports() {
        return `import * as models from '../models';
import { AxiosRequestConfig, AxiosResponse } from 'axios';
import { ControllerBase } from '../ControllerBase';`;
    }
    generateController(controller: string, controlerPaths: ApiPath[]): void {
        const controllerName = this.getControllerName(controller);
        this.generateBaseController();
        makeDirIfNotExist(this.controllersFolder);
        appendFileSync(this.controllersExportFile, `export * from './${controllerName}'\n`);
        let controllerContent = this.getControllersImports() + `\n\n`;
        controllerContent += `export class ${controllerName} extends ControllerBase {\n`;
        controllerContent += this.generateControllerMethodsContent(controller, controlerPaths);
        controllerContent += `}`;
        const controllerFile = join(this.controllersFolder, controllerName + this.getFileExtension(false));
        writeFileSync(controllerFile, this.disableLinting + controllerContent);
    }
    generateControllerMethodContent(controller: string, controllerPath: ApiPath) {
        const methodName = this.getMethodName(controllerPath);
        let requestType = controllerPath.body.haveBody ? this.getPropDesc(controllerPath.body.schema) : 'undefined';
        const responseType = this.getPropDesc(controllerPath.response);
        const bodyParam = controllerPath.body.haveBody
            ? `body: ${requestType}${!controllerPath.body.required ? ` | undefined` : ''}, `
            : '';
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
        url += !haveQueryParams
            ? ''
            : '?' +
              controllerPath.queryParams
                  .map(x => `${x.name}=\${queryParams['${x.name}'] !== undefined ? queryParams['${x.name}'] : ''}`)
                  .join('&');
        const queryParamFix = (name: string) => (name.includes('.') || name.includes('-') ? `"${name}"` : name);
        const queryParams = haveQueryParams
            ? `queryParams: {${controllerPath.queryParams.map(x => `${queryParamFix(x.name)}${x.required ? '' : '?'}: ${this.getPropDesc(x.schema!)}`)}}, `
            : ``;

        let methodContent = '';
        methodContent += `\tasync ${methodName}(${bodyParam}${pathParams}${queryParams}${headersParams}customConfig?: AxiosRequestConfig): Promise<AxiosResponse<${responseType}>> {\n`;
        methodContent += `\t\treturn this.method<${requestType},${responseType}>(\n`;
        methodContent += `\t\t\t'${controllerPath.method.toLowerCase()}',\n`;
        methodContent += `\t\t\t\`${url}\`,\n`;
        methodContent += `\t\t\t${controllerPath.body.haveBody ? 'body' : 'undefined'},\n`;
        methodContent += `\t\t\t${haveHeaderParams ? 'headers' : 'undefined'},\n`;
        methodContent += `\t\t\tcustomConfig\n`;
        methodContent += `\t\t);\n`;
        methodContent += `\t}\n`;
        return { methodContent, methodName };
    }
    generateBaseController() {
        const controllerBaseFile = join(this.options.output, 'ControllerBase.ts');
        if (!this.shouldGenerateFile(controllerBaseFile)) {
            return;
        }
        const baseControllerContent = `import { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
export class ControllerBase {
    constructor(public axiosInstance: AxiosInstance) { }
    public method<T, S>(
        method: string,
        path: string,
        body: T | undefined,
        headers?: { [key: string]: string | undefined },
        customConfig?: AxiosRequestConfig,
    ): Promise<AxiosResponse<S>> {
        return this.axiosInstance.request<S>({
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
