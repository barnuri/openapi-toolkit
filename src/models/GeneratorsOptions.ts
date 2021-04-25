import { ServerGenerators } from './ServerGenerators';
import { ClientGenerators } from './ClientGenerators';

export default class GeneratorsOptions {
    pathOrUrl!: string;
    output!: string;
    generator!: ClientGenerators | ServerGenerators;
    modelsFolderName!: string;
    modelNamePrefix!: string;
    modelNameSuffix!: string;
    controllersFolderName!: string;
    controllerNamePrefix!: string;
    controllerNameSuffix!: string;
    namepsace!: string;
    type!: string;
}
