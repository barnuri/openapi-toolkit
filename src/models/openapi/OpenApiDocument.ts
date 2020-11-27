import { OpenApiDefinitionsDictionary } from './OpenApiDefinitionsDictionary';

export class OpenApiDocument {
    // support version 2
    definitions?: OpenApiDefinitionsDictionary;
    // support version 3
    components?: { schemas: OpenApiDefinitionsDictionary };
}
