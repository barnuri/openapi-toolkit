import { cloneHelper } from '../../helpers';
import { OpenApiDefinitionObject } from './../openapi/OpenApiDefinitionObject';
export class EditorInput {
    public path: string;
    public name: string;
    public readonly required: boolean;
    public readonly description: string | undefined | null;
    public readonly title: string | undefined | null;
    public readonly deprecated: boolean | undefined | null;
    public readonly nullable: boolean | undefined | null;
    public readonly editorType: 'EditorArrayInput' | 'EditorObjectInput' | 'EditorPrimitiveInput';
    public readonly openApiDefinition: OpenApiDefinitionObject;
    public readonly openApiParentDefinition: OpenApiDefinitionObject | undefined;

    constructor(
        path: string,
        editorType: 'EditorArrayInput' | 'EditorObjectInput' | 'EditorPrimitiveInput',
        openApiDefinition: OpenApiDefinitionObject,
        openApiParentDefinition: OpenApiDefinitionObject | undefined,
    ) {
        this.path = path;
        this.openApiDefinition = openApiDefinition;
        this.openApiParentDefinition = openApiParentDefinition;
        this.required = inputIsRequired(path, openApiParentDefinition);
        this.description = openApiDefinition.description;
        this.title = openApiDefinition.title;
        this.name = (this.path || '').split('.').splice(-1)[0];
        this.deprecated = openApiDefinition.deprecated || openApiDefinition['x-deprecated'];
        const parentClone = cloneHelper(openApiParentDefinition || ({} as OpenApiDefinitionObject));
        parentClone.properties = parentClone.properties || {};
        parentClone.properties[this.name] = parentClone.properties[this.name] || {};
        this.nullable =
            openApiDefinition.nullable ||
            openApiDefinition['x-nullable'] ||
            parentClone.properties[this.name]['nullable'] ||
            parentClone.properties[this.name]['x-nullable'];
        this.editorType = editorType;
    }
}

function inputIsRequired(path: string, parentContainer: OpenApiDefinitionObject | undefined) {
    return ((parentContainer || {}).required || []).includes(path.split('.').splice(-1)[0]);
}
