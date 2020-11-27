import { OpenApiDefinitionType } from './OpenApiDefinitionType';
import { OpenApiDefinition } from './OpenApiDefinition';
import { OpenApiDefinitionsDictionary } from './OpenApiDefinitionsDictionary';

export class OpenApiDefinitionObject {
    required?: string[];
    enum?: any[];
    'x-enumNames': string[];
    'x-abstract': boolean;
    format?: string;
    description?: string;
    type?: OpenApiDefinitionType;
    oneOf?: OpenApiDefinition[];
    allOf?: OpenApiDefinition[];
    items?: OpenApiDefinition;
    anyOf?: OpenApiDefinitionObject[];
    properties?: { [propName: string]: OpenApiDefinition };
    definitions?: OpenApiDefinitionsDictionary;
    // not importent right now
    nullable?: boolean;
    additionalProperties?: OpenApiDefinition | boolean;
    title?: string;
    default?: any;
    not?: OpenApiDefinition;
    multipleOf?: number;
    maximum?: number;
    exclusiveMaximum?: boolean;
    minimum?: number;
    exclusiveMinimum?: boolean;
    maxLength?: number;
    minLength?: number;
    pattern?: string;
    maxItems?: number;
    minItems?: number;
    uniqueItems?: boolean;
    maxProperties?: number;
    minProperties?: number;
    readOnly?: boolean;
    writeOnly?: boolean;
    example?: any;
    examples?: any[];
    deprecated?: boolean;
    discriminator?: {
        propertyName: string;
        mapping?: { [mapName: string]: string };
    };
    xml?: {
        name?: string;
        namespace?: string;
        prefix?: string;
        attribute?: boolean;
        wrapped?: boolean;
    };
    externalDocs?: {
        description?: string;
        url: string;
    };
}
