import { TypescriptNestServerGenerator } from './server/TypescriptNestServerGenerator';
import { CSharpServerGenerator } from './server/CSharpServerGenerator';
import { ServerGenerators } from './../models/ServerGenerators';
import { ClientGenerators } from '../models/ClientGenerators';
import GeneratorsOptions from '../models/GeneratorsOptions';
import { CSharpClientGenerator } from './client/CSharpClientGenerator';
import { TypescriptAxiosClientGenerator } from './client/TypescriptAxiosClientGenerator';
import { getSwaggerJson } from '../helpers';
export * from './client/TypescriptAxiosClientGenerator';
export * from './GeneratorAbstract';

export async function generate(options: GeneratorsOptions) {
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
    throw new Error('not implemented: ' + generator);
}
