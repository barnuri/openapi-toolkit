import { OpenApiDefinition } from './../openapi/OpenApiDefinition';
export class EditorInput {
    path: string;
    required: boolean;
    openApiDefinition: OpenApiDefinition;
    openApiParentDefinition?: OpenApiDefinition;
    getName() {
        return (this.path || '').split('.').splice(-1)[0];
    }
}
