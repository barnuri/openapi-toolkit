import { ApiPathParam } from './ApiPathParam';
import { OpenApiDefinition } from './openapi/OpenApiDefinition';

export class ApiPath {
    path!: string;
    method!: string;
    pathParams!: ApiPathParam[];
    queryParams!: ApiPathParam[];
    cookieParams!: ApiPathParam[];
    headerParams!: ApiPathParam[];
    body!: {
        schema: OpenApiDefinition;
        required: boolean;
        haveBody: boolean;
    };
    response!: OpenApiDefinition;
    controller!: string;
}
