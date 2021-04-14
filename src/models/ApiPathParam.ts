import { OpenApiDefinition } from './openapi/OpenApiDefinition';

export class ApiPathParam {
    name!: string;
    schema?: OpenApiDefinition;
    required?: boolean;
}
