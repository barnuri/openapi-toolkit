import { TypescriptGenerator } from '../TypescriptGenerator';
import { appendFileSync, writeFileSync } from 'fs';
import { ApiPath } from '../../models/ApiPath';
import { join } from 'path';
import { capitalize, makeDirIfNotExist } from '../../helpers';

export class TypescriptNestServerGenerator extends TypescriptGenerator {
    modelsExportFile = join(this.modelsFolder, 'index.ts');
    controllersExportFile = join(this.controllersFolder, 'index.ts');
    mainExportFile = join(this.options.output, 'index.ts');
    generateClient(): void {}
    generateController(controller: string, controlerPaths: ApiPath[]): void {
        const controllerName = this.getControllerName(controller);
        makeDirIfNotExist(this.controllersFolder);
        appendFileSync(this.controllersExportFile, `export * from './${controllerName}'\n`);
        let controllerContent = `import * as models from '../models';\n`;
        controllerContent += `import * as nestCommon from '@nestjs/common';\n`;
        controllerContent += `import { ApiTags } from '@nestjs/swagger';\n`;
        controllerContent += `@ApiTags('${controllerName}')\n@nestCommon.Controller()\nexport class ${controllerName} {\n`;
        controllerContent += this.generateControllerMethodsContent(controller, controlerPaths);
        controllerContent += `}`;
        const controllerFile = join(this.controllersFolder, controllerName + this.getFileExtension(false));
        writeFileSync(controllerFile, this.disableLinting + controllerContent);
    }
    generateControllerMethodContent(controller: string, controllerPath: ApiPath): string {
        const methodName = this.getMethodName(controllerPath);
        let requestType = controllerPath.body.haveBody ? this.getPropDesc(controllerPath.body.schema) : 'undefined';
        const responseType = this.getPropDesc(controllerPath.response);
        const bodyParam = controllerPath.body.haveBody ? `@nestCommon.Body() body: ${requestType}${!controllerPath.body.required ? ` | undefined` : ''}, ` : '';
        const headers = [...controllerPath.cookieParams, ...controllerPath.headerParams];
        const headersParams =
            headers.length > 0
                ? headers.map(x => `@nestCommon.Headers('${x.name}') h_${x.name}: string ${x.required ? '' : ' | undefined'}`).join(', ') + `, `
                : ``;
        const pathParams =
            controllerPath.pathParams.length > 0
                ? controllerPath.pathParams
                      .map(x => `@nestCommon.Param('${x.name}') p_${x.name}: ${this.getPropDesc(x.schema!)} ${x.required ? '' : ' | undefined'}`)
                      .join(', ') + `, `
                : ``;

        const queryParams =
            controllerPath.queryParams.length > 0
                ? controllerPath.queryParams
                      .map(x => `@nestCommon.Query('${x.name}') q_${x.name}: ${this.getPropDesc(x.schema!)} ${x.required ? '' : ' | undefined'}`)
                      .join(', ') + `, `
                : ``;
        let methodContent = '';
        methodContent += `\t@nestCommon.${capitalize(controllerPath.method)}("${controllerPath.path}")\n`;
        methodContent += `\tasync ${methodName}(${bodyParam}${pathParams}${queryParams}${headersParams}): ${responseType}> {\n`.replace(', )', ')');
        methodContent += `\t\tthrow Error('NotImplemented');\n`;
        methodContent += `\t}\n`;
        return methodContent;
    }
}
