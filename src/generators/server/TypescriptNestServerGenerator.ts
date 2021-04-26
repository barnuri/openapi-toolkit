import { TypescriptGenerator } from '../TypescriptGenerator';
import { appendFileSync, writeFileSync } from 'fs';
import { ApiPath } from '../../models/ApiPath';
import { join } from 'path';
import { capitalize, makeDirIfNotExist } from '../../helpers';

export class TypescriptNestServerGenerator extends TypescriptGenerator {
    modelsExportFile = join(this.modelsFolder, 'index.ts');
    controllersExportFile = join(this.controllersFolder, 'index.ts');
    mainExportFile = join(this.options.output, 'index.ts');
    async generateClient(): Promise<void> {}
    async generateController(controller: string, controlerPaths: ApiPath[]): Promise<void> {
        const controllerName = this.getControllerName(controller);
        makeDirIfNotExist(this.controllersFolder);
        appendFileSync(this.controllersExportFile, `export * from './${controllerName}'\n`);
        console.log(`${controllerName} - ${controlerPaths.length}`);
        let controllerContent = `import * as models from '../models';\n`;
        controllerContent += `import * as nestCommon from '@nestjs/common';\n`;
        controllerContent += `import { ApiTags } from '@nestjs/swagger';\n`;
        controllerContent += `@ApiTags('${controllerName}')\n@nestCommon.Controller()\nexport class ${controllerName} {\n`;
        for (const controlerPath of controlerPaths) {
            console.log(`\t${controlerPath.method} - ${controlerPath.path}`);
            const pathFixed = controlerPath.path.replace(/\/|-|{|}/g, '');
            const methodName = controlerPath.method.toLowerCase() + capitalize(pathFixed);
            let requestType = controlerPath.body.haveBody ? this.getPropDesc(controlerPath.body.schema) : 'undefined';
            const responseType = this.getPropDesc(controlerPath.response);
            const bodyParam = controlerPath.body.haveBody
                ? `@nestCommon.Body() body: ${requestType}${!controlerPath.body.required ? ` | undefined` : ''}, `
                : '';
            const headers = [...controlerPath.cookieParams, ...controlerPath.headerParams];
            const headersParams =
                headers.length > 0
                    ? headers.map(x => `@nestCommon.Headers('${x.name}') h_${x.name}: string ${x.required ? '' : ' | undefined'}`).join(', ') + `, `
                    : ``;
            const pathParams =
                controlerPath.pathParams.length > 0
                    ? controlerPath.pathParams
                          .map(x => `@nestCommon.Param('${x.name}') p_${x.name}: ${this.getPropDesc(x.schema!)} ${x.required ? '' : ' | undefined'}`)
                          .join(', ') + `, `
                    : ``;

            const queryParams =
                controlerPath.queryParams.length > 0
                    ? controlerPath.queryParams
                          .map(x => `@nestCommon.Query('${x.name}') q_${x.name}: ${this.getPropDesc(x.schema!)} ${x.required ? '' : ' | undefined'}`)
                          .join(', ') + `, `
                    : ``;

            controllerContent += `\t@nestCommon.${capitalize(controlerPath.method)}("${controlerPath.path}")\n`;
            controllerContent += `\tasync ${methodName}(${bodyParam}${pathParams}${queryParams}${headersParams}): Promise<${responseType}> {\n`.replace(
                ', )',
                ')',
            );
            controllerContent += `\t\tthrow Error('NotImplemented');\n`;
            controllerContent += `\t}\n`;
        }
        controllerContent += `}`;
        const controllerFile = join(this.controllersFolder, controllerName + this.getFileExtension(false));
        writeFileSync(controllerFile, this.disableLinting + controllerContent);
    }
}
