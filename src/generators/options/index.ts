import { fixPath } from '../../helpers';
import GeneratorsOptions from '../../models/GeneratorsOptions';

export function prepareAndValidateConfig(options: GeneratorsOptions) {
    const defaultVals = new GeneratorsOptions();
    options = { ...defaultVals, ...options };
    
    if (!options.output) {
        throw new Error('output is required');
    }
    if (!options.generator) {
        throw new Error('generator is required');
    }
    if (!options.type) {
        throw new Error('type is required');
    }

    options.longMethodName = (options.longMethodName as any) === 'true' || options.longMethodName === true;
    options.debugLogs = (options.debugLogs as any) === 'true' || options.debugLogs === true;
    if (Array.isArray(options.output)) {
        options.output = (options.output as any[])[0];
    }
    options.modelsFolderName = options.modelsFolderName || '';
    options.modelNamePrefix = options.modelNamePrefix || '';
    options.modelNameSuffix = options.modelNameSuffix || '';
    options.controllersFolderName = options.controllersFolderName || '';
    options.controllerNamePrefix = options.controllerNamePrefix || '';
    options.controllerNameSuffix = options.controllerNameSuffix || '';
    options.namespace = options.namespace || '';
    options.output = fixPath(options.output);
    return options;
}
