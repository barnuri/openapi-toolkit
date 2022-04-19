import { OpenApiDefinition } from './OpenApiDefinition';
import { OpenApiDefinitionsDictionary } from './OpenApiDefinitionsDictionary';

export class OpenApiDocument {
    // support version 2
    definitions?: OpenApiDefinitionsDictionary;
    // support version 3
    components?: { schemas?: OpenApiDefinitionsDictionary, securitySchemes?: any };
    security?: any[];
    tags?: any[];
    paths?: {
        [path: string]: {
            [methodType: string]: {
                tags?: string[];
                parameters?: {
                    name: string;
                    in: 'path' | 'body' | 'query' | 'cookie' | 'header';
                    schema?: OpenApiDefinition;
                    required?: boolean;
                }[];
                requestBody?: {
                    required?: boolean;
                    content?: {
                        [type: string]: {
                            schema?: OpenApiDefinition;
                        };
                    };
                };
                responses?: {
                    [statusCode: string]: {
                        schema?: OpenApiDefinition;
                        content?: {
                            [type: string]: {
                                schema?: OpenApiDefinition;
                            };
                        };
                    };
                };
            };
        };
    };
}

export type OpenApiPathParamInVals = 'path' | 'body' | 'query' | 'cookie' | 'header';
