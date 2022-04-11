import { TypescriptReactQueryClientGenerator } from './client/TypescriptReactQueryClientGenerator';
import { GoServerGenerator } from './server/GoServerGenerator';
import { ServerGenerators } from './../models/ServerGenerators';
import { ClientGenerators } from '../models/ClientGenerators';
import GeneratorsOptions from '../models/GeneratorsOptions';
import { TypescriptNestServerGenerator } from './server/TypescriptNestServerGenerator';
import { CSharpServerGenerator } from './server/CSharpServerGenerator';
import { PythonClientGenerator } from './client/PythonClientGenerator';
import { CSharpClientGenerator } from './client/CSharpClientGenerator';
import { TypescriptAxiosClientGenerator } from './client/TypescriptAxiosClientGenerator';
import { getSwaggerJson } from '../helpers';
import { GoClientGenerator } from './client/GoClientGenerator';

export * from './server/TypescriptNestServerGenerator';
export * from './server/CSharpServerGenerator';
export * from './client/PythonClientGenerator';
export * from './client/CSharpClientGenerator';
export * from './client/TypescriptAxiosClientGenerator';
export * from './TypescriptGenerator';
export * from './GeneratorAbstract';

export async function generate(options: GeneratorsOptions) {
    options.longMethodName = (options.longMethodName as any) === 'true' || options.longMethodName === true;
    options.debugLogs = (options.debugLogs as any) === 'true' || options.debugLogs === true;
    if (!options.pathOrUrl) {
        throw new Error('pathOrUrl is required');
    }
    if (Array.isArray(options.output)) {
        options.output = (options.output as any[])[0];
    }
    console.log(`get swagger`);
    const swagger = await getSwaggerJson(options.pathOrUrl);
    console.log(`get swagger successfull`);
    const constractor = options.type === 'server' ? serverGeneratorGetter(options.generator) : clientGeneratorGetter(options.generator);
    const generator = new constractor(swagger, options);
    console.log(`start ${generator.constructor.name}`);
    await generator.generate();
}

export function serverGeneratorGetter(generator: ClientGenerators | ServerGenerators) {
    if (!Object.values(ServerGenerators).find(x => x.toLowerCase() === generator.toLowerCase())) {
        throw new Error(
            `bad server generator name: '${generator}', available names: [${Object.values(ServerGenerators)
                .map(x => `'${x}'`)
                .join(', ')}]`,
        );
    }
    if (generator === ServerGenerators.CSharp) {
        return CSharpServerGenerator;
    }
    if (generator === ServerGenerators.TypescriptNest) {
        return TypescriptNestServerGenerator;
    }
    if (generator === ServerGenerators.Go) {
        return GoServerGenerator;
    }
    throw new Error('not implemented: ' + generator);
}

export function clientGeneratorGetter(generator: ClientGenerators | ServerGenerators) {
    if (!Object.values(ClientGenerators).find(x => x.toLowerCase() === generator.toLowerCase())) {
        throw new Error(
            `bad client generator name: '${generator}', available names: [${Object.values(ClientGenerators)
                .map(x => `'${x}'`)
                .join(', ')}]`,
        );
    }
    if (generator === ClientGenerators.TypescriptAxios) {
        return TypescriptAxiosClientGenerator;
    }
    if (generator === ClientGenerators.CSharp) {
        return CSharpClientGenerator;
    }
    if (generator === ClientGenerators.Python) {
        return PythonClientGenerator;
    }
    if (generator === ClientGenerators.Go) {
        return GoClientGenerator;
    }
    if (generator === ClientGenerators.TypescriptReactQuery) {
        return TypescriptReactQueryClientGenerator;
    }
    throw new Error('not implemented: ' + generator);
}
