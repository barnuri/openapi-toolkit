import { Generators } from './Generators';

export default class GeneratorsOptions {
    pathOrUrl!: string;
    output!: string;
    generator!: Generators;
    modelsFolderName!: string;
    modelNamePrefix!: string;
    modelNameSuffix!: string;
    controllersFolderName!: string;
    controllerNamePrefix!: string;
    controllerNameSuffix!: string;
    namepsace!: string;
}
