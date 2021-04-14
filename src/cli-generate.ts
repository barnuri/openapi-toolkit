#!/usr/bin/env node
import { getSwaggerJson } from './generator/generatorHelpers';
import { GeneratorAbstract, OpenApiDocument } from './models';
import { TypescriptAxiosGenerator } from './models/generators/TypescriptAxiosGenerator';

const [, , ...args] = process.argv;
if (args.length % 2 !== 0) {
    console.error('number of args is invalid');
    process.exit(1);
}
const argDict = {
    pathOrUrl: '',
    generator: 'typescript-axios',
    outputPath: '',
};
for (let index = 0; index < args.length / 2; index++) {
    let argName = (args[index * 2] || '').replace(/-/g, '');
    argName = argName === 'i' ? 'pathOrUrl' : argName;
    argName = argName === 'g' ? 'generator' : argName;
    argName = argName === 'o' ? 'outputPath' : argName;
    argDict[argName] = args[index * 2 + 1];
}

if (!argDict.pathOrUrl) {
    console.error('pathOrUrl, arg -i is required');
    process.exit(1);
}
if (!argDict.outputPath) {
    console.error('outputPath, arg -o is required');
    process.exit(1);
}

const generatorGetter = (type: string, swagger: OpenApiDocument): GeneratorAbstract => {
    if (type === 'typescript-axios') {
        return new TypescriptAxiosGenerator(swagger, argDict.outputPath);
    }
    throw new Error('bad generator name: ' + type);
};

const generate = async () => {
    console.log(`get swagger`);
    const swagger = await getSwaggerJson(argDict.pathOrUrl);
    console.log(`get swagger successfull`);
    const generator = generatorGetter(argDict.generator, swagger);
    console.log(`start ${generator.constructor.name}`);
    generator.generate();
};

generate()
    .then(() => console.log('done succssfully'))
    .catch(err => console.error(`failed ${err}`));
