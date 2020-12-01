import { OpenApiDefinition } from './../models/openapi/OpenApiDefinition';
import { OpenApiDefinitionObject } from '../models/openapi/OpenApiDefinitionObject';

export function getOpenApiDefinitionObjectProps(definitionObj: OpenApiDefinitionObject): { [propName: string]: OpenApiDefinition } {
    definitionObj = definitionObj || {};
    return {
        ...(definitionObj.properties || ({} as any)),
        ...(((definitionObj.allOf || []).filter(x => Object.keys(x).includes('properties'))[0] as OpenApiDefinitionObject) || {}).properties,
    };
}
