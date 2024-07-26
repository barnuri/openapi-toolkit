import { TypescriptAxiosClientGenerator } from './TypescriptAxiosClientGenerator';
import { ApiPath } from '../../models/ApiPath';

export class TypescriptReactQueryClientGenerator extends TypescriptAxiosClientGenerator {
    getControllersImports() {
        return (
            super.getControllersImports() + `\nimport { useQuery, useMutation, UseQueryOptions, UseMutationOptions } from 'react-query';`
        );
    }
    generateControllerMethodContent(controller: string, controllerPath: ApiPath) {
        const isGetMethod = controllerPath.method.toLowerCase() === 'get';
        const methodName = this.getMethodName(controllerPath, '', isGetMethod ? 'Query' : 'Mutation');
        const queryKey = `${controller}_${methodName}`;
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
        url += !haveQueryParams ? '' : '?' + controllerPath.queryParams.map(x => `${x.name}=\${queryParams['${x.name}']}`).join('&');
        const queryParamFix = (name: string) => (name.includes('.') || name.includes('-') ? `"${name}"` : name);
        const queryParams = haveQueryParams
            ? `queryParams: {${controllerPath.queryParams.map(x => `${queryParamFix(x.name)}${x.required ? '' : '?'}: ${this.getPropDesc(x.schema!)}`)}}, `
            : ``;

        let methodContent = '';
        methodContent += `\tasync ${methodName}(${bodyParam}${pathParams}${queryParams}${headersParams}customConfig?: AxiosRequestConfig`;
        methodContent += isGetMethod
            ? `, queryOptions?: Omit<UseQueryOptions<AxiosResponse<${responseType}>, any, AxiosResponse<${responseType}>, '${queryKey}'>, 'queryKey' | 'queryFn'>`
            : `, mutationOptions?: UseMutationOptions<AxiosResponse<${responseType}>>`;
        methodContent += `) {\n`;
        methodContent += `\t\treturn `;
        methodContent += isGetMethod ? `useQuery('${queryKey}', () => ` : `useMutation(() => `;
        methodContent += `this.method<${requestType},${responseType}>(\n`;
        methodContent += `\t\t\t'${controllerPath.method.toLowerCase()}',\n`;
        methodContent += `\t\t\t\`${url}\`,\n`;
        methodContent += `\t\t\t${controllerPath.body.haveBody ? 'body' : 'undefined'},\n`;
        methodContent += `\t\t\t${haveHeaderParams ? 'headers' : 'undefined'},\n`;
        methodContent += `\t\t\tcustomConfig\n`;
        methodContent += `\t\t), `;
        methodContent += isGetMethod ? `queryOptions` : `mutationOptions`;
        methodContent += `)\n`;
        methodContent += `\t}\n`;
        const axiosGenerator = super.generateControllerMethodContent(controller, controllerPath);
        methodContent += '\n' + axiosGenerator.methodContent;
        return { methodContent, methodName: `${methodName}, ${axiosGenerator.methodName}` };
    }
}
