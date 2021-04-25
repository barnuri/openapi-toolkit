import { ServerGenerators } from './../models/ServerGenerators';
import { getSwaggerJson } from '../index';
import { ClientGenerators } from '../models/ClientGenerators';
import GeneratorsOptions from '../models/GeneratorsOptions';
import { CSharpClientGenerator } from './client/CSharpClientGenerator';
import { TypescriptAxiosClientGenerator } from './client/TypescriptAxiosClientGenerator';

export * from './client/TypescriptAxiosClientGenerator';
export * from './GeneratorAbstract';

export async function generate(options: GeneratorsOptions) {
    console.log(`get swagger`);
    const swagger = await getSwaggerJson(options.pathOrUrl);
    console.log(`get swagger successfull`);
    const constractor = options.type === 'server' ? clientGeneratorGetter(options.generator) : clientGeneratorGetter(options.generator);
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
