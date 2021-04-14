import { join } from 'path';
import { makeDirIfNotExist } from '../../generator/generatorHelpers';
import { ApiPath } from '../ApiPath';
import { Editor } from '../editor/Editor';
import { GeneratorAbstract } from '../GeneratorAbstract';

export class TypescriptAxiosGenerator extends GeneratorAbstract {
    async generateModel(editors: Editor): Promise<void> {
        makeDirIfNotExist(join(this.outputPath, 'models'));
        console.log(editors.name);
    }
    async generateController(controllerName: string, controlerPaths: ApiPath[]): Promise<void> {
        makeDirIfNotExist(join(this.outputPath, 'controllers'));
        console.log(`${controllerName} - ${controlerPaths.length}`);
        for (const controlerPath of controlerPaths) {
            console.log(`\t${controlerPath.method} - ${controlerPath.path}`);
        }
    }
}
