import { OpenApiDefinition } from './../openapi/OpenApiDefinition';
export class EditorInput {
    path: string;
    required: boolean;
    editorType: 'EditorArrayInput' | 'EditorObjectInput' | 'EditorPrimitiveInput';
    openApiDefinition: OpenApiDefinition;
    openApiParentDefinition?: OpenApiDefinition;
}
