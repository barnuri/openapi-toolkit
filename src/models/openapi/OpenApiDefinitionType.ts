import { OpenApiDefinitionReference } from './OpenApiDefinitionReference';

export type OpenApiDefinitionType =
    | 'string'
    | 'number'
    | 'integer'
    | 'boolean'
    | 'array'
    | 'object'
    | 'null'
    | OpenApiDefinitionReference
    | OpenApiDefinitionType[];
