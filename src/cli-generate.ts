#!/usr/bin/env node
import { generate } from './generators';

const [, , ...args] = process.argv;

if (args.length % 2 !== 0) {
    console.error('number of args is invalid');
    process.exit(1);
}
const argDict = {
    pathOrUrl: '',
    generatorName: 'typescript-axios',
    outputPath: '',
};

for (let index = 0; index < args.length / 2; index++) {
    let argName = (args[index * 2] || '').replace(/-/g, '');
    argName = argName === 'i' ? 'pathOrUrl' : argName;
    argName = argName === 'g' ? 'generatorName' : argName;
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

generate(argDict.pathOrUrl, argDict.generatorName, argDict.outputPath)
    .then(() => console.log('done succssfully'))
    .catch(err => console.error(`failed ${err}`));
