import { CSharpClientGenerator } from '../client/CSharpClientGenerator';
import { writeFileSync } from 'fs';
import { ApiPath } from '../../models/ApiPath';
import { join } from 'path';
import { capitalize, makeDirIfNotExist } from '../../helpers';

export class CSharpServerGenerator extends CSharpClientGenerator {
    mainExportFile = join(this.options.output, 'Client.cs');
    addNamespace(content: string) {
        return super.addNamespace(
            content,
            'using System;\nusing Microsoft.AspNetCore.Mvc;\nusing System.Threading.Tasks;\nusing System.Collections.Generic;\n',
        );
    }
    generateClient(): void {}
    generateController(controller: string, controlerPaths: ApiPath[]): void {
        const controllerName = this.getControllerName(controller);
        makeDirIfNotExist(this.controllersFolder);
        let controllerContent = `[ApiController]\n[Route("[controller]")]\n`;
        controllerContent += `public class ${controllerName} : ControllerBase \n{\n`;
        controllerContent += this.generateControllerMethodsContent(controller, controlerPaths);
        controllerContent += `}`;
        const controllerFile = join(this.controllersFolder, controllerName + this.getFileExtension(false));
        writeFileSync(controllerFile, '\n' + this.addNamespace(controllerContent));
    }
    generateControllerMethodContent(controller: string, controllerPath: ApiPath): string {
        const pathFixed = controllerPath.path.replace(/\/|-|{|}/g, '');
        const methodName = capitalize(controllerPath.method) + capitalize(pathFixed);
        let requestType = controllerPath.body.haveBody ? this.getPropDesc(controllerPath.body.schema) : 'object';
        const responseType = this.getPropDesc(controllerPath.response);
        const bodyParam = controllerPath.body.haveBody ? `[FromBody] ${requestType}${!controllerPath.body.required ? `?` : ''} body, ` : '';
        const headers = [...controllerPath.cookieParams, ...controllerPath.headerParams];
        const headersParams =
            headers.length > 0 ? headers.map(x => `[FromHeader(Name = "${x.name}")] string${x.required ? '' : '?'} ${x.name} = default`).join(', ') + `, ` : ``;
        const pathParams =
            controllerPath.pathParams.length > 0
                ? controllerPath.pathParams
                      .map(x => `[FromRoute(Name = "${x.name}")] ${this.getPropDesc(x.schema!)}${x.required ? '' : '?'} ${x.name} = default`)
                      .join(', ') + ', '
                : ``;

        const queryParams =
            controllerPath.queryParams.length > 0
                ? controllerPath.queryParams
                      .map(x => `[FromQuery(Name = "${x.name}")] ${this.getPropDesc(x.schema!)}${x.required ? '' : '?'} ${x.name} = default`)
                      .join(', ') + ', '
                : ``;

        const methodParams = `${bodyParam}${pathParams}${queryParams}${headersParams}`;
        let methodContent = '';
        methodContent += `\t[Http${capitalize(controllerPath.method)}("${controllerPath.path}")]\n`;
        methodContent += `\tpublic Task<${responseType}> ${methodName}(${methodParams}) \n\t{\n`.replace(', )', ')');
        methodContent += `\t\tthrow new NotImplementedException();\n`;
        methodContent += `\t}\n`;
        return methodContent;
    }
}
