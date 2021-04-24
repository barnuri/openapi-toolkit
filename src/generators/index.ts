import { getSwaggerJson } from '../index';
import { Generators } from './Generators';
import GeneratorsOptions from './GeneratorsOptions';
import { TypescriptAxiosGenerator } from './TypescriptAxiosGenerator';

export * from './TypescriptAxiosGenerator';
export * from './GeneratorAbstract';

export async function generate(options: GeneratorsOptions) {
    console.log(`get swagger`);
    const swagger = await getSwaggerJson(options.pathOrUrl);
    console.log(`get swagger successfull`);
    const constractor = generatorGetter(options.generator);
    const generator = new constractor(swagger, options);
    console.log(`start ${generator.constructor.name}`);
    await generator.generate();
}

export function generatorGetter(generator: Generators) {
    if (!Object.values(Generators).find(x => x.toLowerCase() === generator.toLowerCase())) {
        throw new Error(
            `bad generator name: '${generator}', available names: [${Object.values(Generators)
                .map(x => `'${x}'`)
                .join(', ')}]`,
        );
    }
    if (generator === Generators.TypescriptAxios) {
        return TypescriptAxiosGenerator;
    }
    throw new Error('not implemented: ' + generator);
}
