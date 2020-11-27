import { OpenApiDefinition } from '../models/openapi/OpenApiDefinition';
import { OpenApiDefinitionReference } from '../models/openapi/OpenApiDefinitionReference';
import { OpenApiDefinitionObject } from '../models/openapi/OpenApiDefinitionObject';
import { OpenApiDefinitionsDictionary } from '../models/openapi/OpenApiDefinitionsDictionary';

export function getOpenApiDefinitionObject(definition: OpenApiDefinition, definitions: OpenApiDefinitionsDictionary): OpenApiDefinitionObject {
    if (Object.keys(definition).includes('$ref')) {
        return definitions[(definition as OpenApiDefinitionReference).$ref.split('/').splice(-1)[0]];
    }
    return definition as OpenApiDefinitionObject;
}
