import { getSwaggerJson } from '../helpers';
import GeneratorsOptions from '../models/GeneratorsOptions';
import { ClientGeneratorGetter } from './ClientGeneratorGetter';
import { prepareAndValidateConfig } from './options';
import parsing from './parsing';
import { ServerGeneratorGetter } from './ServerGeneratorGetter';

export function generate(options: GeneratorsOptions) {
    return multipleGenerate(options.pathOrUrl, [options]);
}

export async function multipleGenerate(pathOrUrl: string, multipleOptions: GeneratorsOptions[]) {
    if (!pathOrUrl) {
        throw new Error('pathOrUrl is required');
    }
    multipleOptions.forEach(opt => (opt.pathOrUrl = pathOrUrl));
    const swagger = await getSwaggerJson(pathOrUrl);
    const parsingResult = parsing(
        swagger,
        multipleOptions.some(x => x.debugLogs),
    );

    for (const options of multipleOptions) {
        const finalOptions = prepareAndValidateConfig(options);
        const ctor =
            finalOptions.type === 'server' ? ServerGeneratorGetter(finalOptions.generator) : ClientGeneratorGetter(finalOptions.generator);
        const generator = new ctor(swagger, finalOptions, parsingResult);
        console.log(`start ${generator.constructor.name}`.cyan());
        await generator.generate();
    }
}
