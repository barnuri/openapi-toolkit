import { OpenApiDefinition } from '../models/openapi/OpenApiDefinition';
import { OpenApiDefinitionReference } from '../models/openapi/OpenApiDefinitionReference';
import { OpenApiDefinitionObject } from '../models/openapi/OpenApiDefinitionObject';
import { OpenApiDefinitionsDictionary } from '../models/openapi/OpenApiDefinitionsDictionary';

export function getOpenApiDefinitionObject(
    definition: OpenApiDefinition,
    definitions: OpenApiDefinitionsDictionary,
): { def: OpenApiDefinitionObject; refName: string | undefined } {
    if (Object.keys(definition).includes('$ref')) {
        const refName = (definition as OpenApiDefinitionReference).$ref.split('/').splice(-1)[0];
        return { def: definitions[refName], refName };
    }
    if (Object.keys(definition).includes('oneOf')) {
        const openApiDefinitionObject = (definition as OpenApiDefinitionObject).oneOf!.filter((x: any) => x.type != 'null')[0];
        return getOpenApiDefinitionObject(openApiDefinitionObject, definitions);
    }
    return { def: definition as OpenApiDefinitionObject, refName: undefined };
}

export function getOpenApiDefinitionObjectProps(definitionObj: OpenApiDefinitionObject): { [propName: string]: OpenApiDefinition } {
    definitionObj = definitionObj || {};
    return {
        ...(definitionObj.properties || ({} as any)),
        ...(((definitionObj.allOf || []).filter(x => Object.keys(x).includes('properties'))[0] as OpenApiDefinitionObject) || {}).properties,
    };
}
