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
    async generateClient(): Promise<void> {}
    async generateController(controller: string, controlerPaths: ApiPath[]): Promise<void> {
        const controllerName = this.getControllerName(controller);
        makeDirIfNotExist(this.controllersFolder);
        console.log(`${controllerName} - ${controlerPaths.length}`);
        let controllerContent = `[ApiController]\n[Route("[controller]")]\n`;
        controllerContent += `public class ${controllerName} : ControllerBase \n{\n`;
        for (const controlerPath of controlerPaths) {
            console.log(`\t${controlerPath.method} - ${controlerPath.path}`);
            const pathFixed = controlerPath.path.replace(/\/|-|{|}/g, '');
            const methodName = capitalize(controlerPath.method) + capitalize(pathFixed);
            let requestType = controlerPath.body.haveBody ? this.getPropDesc(controlerPath.body.schema) : 'object';
            const responseType = this.getPropDesc(controlerPath.response);
            const bodyParam = controlerPath.body.haveBody ? `[FromBody] ${requestType}${!controlerPath.body.required ? `?` : ''} body, ` : '';
            const headers = [...controlerPath.cookieParams, ...controlerPath.headerParams];
            const headersParams =
                headers.length > 0 ? headers.map(x => `[FromHeader(Name = "${x.name}")] string${x.required ? '' : '?'} ${x.name} = default`).join(', ') + `, ` : ``;
            const pathParams =
                controlerPath.pathParams.length > 0
                    ? controlerPath.pathParams
                          .map(x => `[FromRoute(Name = "${x.name}")] ${this.getPropDesc(x.schema!)}${x.required ? '' : '?'} ${x.name} = default`)
                          .join(', ') + ', '
                    : ``;

            const queryParams =
                controlerPath.queryParams.length > 0
                    ? controlerPath.queryParams
                          .map(x => `[FromQuery(Name = "${x.name}")] ${this.getPropDesc(x.schema!)}${x.required ? '' : '?'} ${x.name} = default`)
                          .join(', ') + ', '
                    : ``;

            const methodParams = `${bodyParam}${pathParams}${queryParams}${headersParams}`;
            controllerContent += `\t[Http${capitalize(controlerPath.method)}("${controlerPath.path}")]\n`;
            controllerContent += `\tpublic Task<${responseType}> ${methodName}(${methodParams}) \n\t{\n`.replace(', )', ')');
            controllerContent += `\t\tthrow new NotImplementedException();\n`;
            controllerContent += `\t}\n`;
        }

        controllerContent += `}`;
        const controllerFile = join(this.controllersFolder, controllerName + this.getFileExtension(false));
        writeFileSync(controllerFile, '\n' + this.addNamespace(controllerContent));
    }
}
