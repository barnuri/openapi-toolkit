import { GoServerGenerator } from './server/GoServerGenerator';
import { ServerGenerators } from '../models/ServerGenerators';
import { ClientGenerators } from '../models/ClientGenerators';
import { TypescriptNestServerGenerator } from './server/TypescriptNestServerGenerator';
import { CSharpServerGenerator } from './server/CSharpServerGenerator';

export function ServerGeneratorGetter(generator: ClientGenerators | ServerGenerators) {
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
    if (generator === ServerGenerators.Go) {
        return GoServerGenerator;
    }
    throw new Error('not implemented: ' + generator);
}
