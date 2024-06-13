#!/usr/bin/env node
import 'colors-ext';
import { ServerGenerators } from './models/ServerGenerators';
import { ClientGenerators } from './models/ClientGenerators';
import { generate } from './generators';
import yargs = require('yargs/yargs');

process.argv[1] = '';
yargs(process.argv.slice(2))
    .usage("openapi-toolkit <command>, default command 'generate'")
    .command(
        ['generate', '*'],
        'auto generate proxy client from swagger file',
        yargs =>
            yargs
                .alias('i', 'pathOrUrl')
                .nargs('i', 1)
                .describe('i', 'path or url for swagger file')
                .demandOption(['i'])
                .alias('o', 'output')
                // .nargs('o', 1)
                .describe('o', 'output path')
                .demandOption(['o'])
                .alias('type', 't')
                .nargs('type', 1)
                .default('type', 'client')
                .choices('type', ['client', 'server'])
                .alias('g', 'generator')
                .nargs('g', 1)
                .describe('g', 'generator name')
                .default('g', 'typescript-axios')
                .alias('namespace', 'n')
                .nargs('namespace', 1)
                .default('namespace', 'OpenapiDefinitionGenerate')
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
                .default('controllerNameSuffix', 'Controller')
                .nargs('longMethodName', 1)
                .default('longMethodName', false)
                .nargs('debugLogs', 1)
                .alias('d', 'debugLogs')
                .default('debugLogs', true)
                .nargs('modelsOnly', 1)
                .default('modelsOnly', false),
        argv => {
            generate(argv as any)
                .then(() => console.log('done succssfully'.green()))
                .catch(err => console.error(`failed ${err}`.red()));
        },
    )
    .command(
        ['generators'],
        'generators list',
        () => {},
        argv => {
            console.log('client generators:' + '\n\t- ' + Object.values(ClientGenerators).join('\n\t- '));
            console.log('server generators:' + '\n\t- ' + Object.values(ServerGenerators).join('\n\t- '));
        },
    )
    .demandCommand()
    .completion()
    .help('h')
    .alias('h', 'help').argv;
