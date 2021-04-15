import { GeneratorAbstract, getSwaggerJson, TypescriptAxiosGenerator } from '..';
import { OpenApiDocument } from '../models';

export * from './TypescriptAxiosGenerator';
export * from './GeneratorAbstract';

export async function generate(swaggerPathOrUrl: string, generatorName: string, outputPath: string) {
    console.log(`get swagger`);
    const swagger = await getSwaggerJson(swaggerPathOrUrl);
    console.log(`get swagger successfull`);
    const generator = generatorGetter(generatorName, swagger, outputPath);
    console.log(`start ${generator.constructor.name}`);
    await generator.generate();
}

export const generatorsNames = ['typescript-axios'];

export function generatorGetter(type: string, swagger: OpenApiDocument, outputPath: string): GeneratorAbstract {
    if (!generatorsNames.find(x => x.toLowerCase() === type.toLowerCase())) {
        throw new Error(`bad generator name: '${type}', available names: [${generatorsNames.map(x => `'${x}'`).join(', ')}]`);
    }
    if (type === 'typescript-axios') {
        return new TypescriptAxiosGenerator(swagger, outputPath);
    }
    throw new Error('not implemented: ' + type);
}
