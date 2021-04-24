#!/usr/bin/env node
import { Generators } from './generators/Generators';
import { generate } from './generators';
import yargs = require('yargs/yargs');

process.argv[1] = '';
yargs(process.argv.slice(2))
    .usage("openapi-definition-generate <command>, default command 'generate'")
    .command(
        ['generate', '*'],
        'auto generate proxy client from swagger file',
        yargs =>
            yargs
                .alias('i', 'pathOrUrl')
                .nargs('i', 1)
                .describe('i', 'path or url for swagger file')
                .demandOption(['i'])
                .alias('g', 'generator')
                .nargs('g', 1)
                .describe('g', 'generator name')
                .default('g', 'typescript-axios')
                .alias('o', 'output')
                .nargs('o', 1)
                .describe('o', 'output path')
                .demandOption(['o'])
                .nargs('modelsFolderName', 1)
                .default('modelsFolderName', 'models')
                .nargs('modelNamePrefix', 1)
                .default('modelNamePrefix', '')
                .nargs('modelNameSuffix', 1)
                .default('modelNameSuffix', '')
                .nargs('controllersFolderName', 1)
                .default('controllersFolderName', 'controllers')
                .nargs('controllerNamePrefix', 1)
                .default('controllerNamePrefix', '')
                .nargs('controllerNameSuffix', 1)
                .default('controllerNameSuffix', 'Controller'),

        argv => {
            generate(argv as any)
                .then(() => console.log('done succssfully'))
                .catch(err => console.error(`failed ${err}`));
        },
    )
    .command(
        ['generators'],
        'generators list',
        () => {},
        argv => {
            console.log('generators:' + '\n\t- ' + Object.values(Generators).join('\n\t- '));
        },
    )
    .demandCommand()
    .completion()
    .help('h')
    .alias('h', 'help').argv;
