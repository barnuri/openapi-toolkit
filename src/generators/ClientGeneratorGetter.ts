import { TypescriptReactQueryClientGenerator } from './client/TypescriptReactQueryClientGenerator';
import { ServerGenerators } from '../models/ServerGenerators';
import { ClientGenerators } from '../models/ClientGenerators';
import { PythonClientGenerator } from './client/PythonClientGenerator';
import { CSharpClientGenerator } from './client/CSharpClientGenerator';
import { TypescriptAxiosClientGenerator } from './client/TypescriptAxiosClientGenerator';
import { GoClientGenerator } from './client/GoClientGenerator';

export function ClientGeneratorGetter(generator: ClientGenerators | ServerGenerators) {
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
    if (generator === ClientGenerators.Python) {
        return PythonClientGenerator;
    }
    if (generator === ClientGenerators.Go) {
        return GoClientGenerator;
    }
    if (generator === ClientGenerators.TypescriptReactQuery) {
        return TypescriptReactQueryClientGenerator;
    }
    throw new Error('not implemented: ' + generator);
}
