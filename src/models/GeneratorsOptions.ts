import { ServerGenerators } from './ServerGenerators';
import { ClientGenerators } from './ClientGenerators';

export default class GeneratorsOptions {
    pathOrUrl!: string;
    output!: string;
    generator: ClientGenerators | ServerGenerators = ClientGenerators.TypescriptAxios;
    modelsFolderName: string = 'models';
    modelNamePrefix: string = '';
    modelNameSuffix: string = '';
    controllersFolderName: string = 'controllers';
    controllerNamePrefix: string = '';
    controllerNameSuffix: string = 'Controller';
    namespace: string = 'OpenapiDefinitionGenerate';
    type: string = 'client';
    longMethodName: boolean = false;
    debugLogs: boolean = true;
    modelsOnly: boolean = false;
    disableNullable: boolean = false;
}
