#!/usr/bin/env node
import 'colors-ext';
import { ServerGenerators } from './models/ServerGenerators';
import { ClientGenerators } from './models/ClientGenerators';
import { generate } from './generators/generate';
import yargs = require('yargs/yargs');
import GeneratorsOptions from './models/GeneratorsOptions';

const defaultValues = new GeneratorsOptions();

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
                .describe('o', 'output path')
                .demandOption(['o'])
                .alias('type', 't')
                .nargs('type', 1)
                .default('type', defaultValues.type)
                .choices('type', ['client', 'server'])
                .alias('g', 'generator')
                .nargs('g', 1)
                .describe('g', 'generator name')
                .default('g', defaultValues.generator)
                .alias('namespace', 'n')
                .nargs('namespace', 1)
                .default('namespace', defaultValues.namespace)
                .nargs('modelsFolderName', 1)
                .default('modelsFolderName', defaultValues.modelsFolderName)
                .nargs('modelNamePrefix', 1)
                .default('modelNamePrefix', defaultValues.modelNamePrefix)
                .nargs('modelNameSuffix', 1)
                .default('modelNameSuffix', defaultValues.modelNameSuffix)
                .nargs('controllersFolderName', 1)
                .default('controllersFolderName', defaultValues.controllersFolderName)
                .nargs('controllerNamePrefix', 1)
                .default('controllerNamePrefix', defaultValues.controllerNamePrefix)
                .nargs('controllerNameSuffix', 1)
                .default('controllerNameSuffix', defaultValues.controllerNameSuffix)
                .nargs('longMethodName', 1)
                .default('longMethodName', defaultValues.longMethodName)
                .nargs('debugLogs', 1)
                .alias('d', 'debugLogs')
                .default('debugLogs', defaultValues.debugLogs)
                .nargs('modelsOnly', 1)
                .default('modelsOnly', defaultValues.modelsOnly)
                .nargs('disableNullable', 1)
                .default('disableNullable', defaultValues.disableNullable),
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
        _argv => {
            console.log('client generators:' + '\n\t- ' + Object.values(ClientGenerators).join('\n\t- '));
            console.log('server generators:' + '\n\t- ' + Object.values(ServerGenerators).join('\n\t- '));
        },
    )
    .demandCommand()
    .completion()
    .help('h')
    .alias('h', 'help').argv;
