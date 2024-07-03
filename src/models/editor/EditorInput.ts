import { OpenApiDefinitionsDictionary } from './../openapi/OpenApiDefinitionsDictionary';
import { cloneHelper, editorNameByPath, getOpenApiDefinitionPropGetter } from '../../helpers';
import { OpenApiDefinitionObject, OpenApiDocument } from './../openapi';

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
    public default: any | undefined;
    public className?: string;
    constructor(
        openApiDocument: OpenApiDocument,
        path: string,
        editorType: 'EditorArrayInput' | 'EditorObjectInput' | 'EditorPrimitiveInput',
        openApiDefinition: OpenApiDefinitionObject,
        openApiParentDefinition: OpenApiDefinitionObject | undefined,
        definitions: OpenApiDefinitionsDictionary | undefined,
    ) {
        this.path = path;
        this.openApiDefinition = openApiDefinition;
        this.openApiParentDefinition = openApiParentDefinition;
        this.description = openApiDefinition.description;
        this.title = openApiDefinition.title;
        this.name = editorNameByPath(this.path || '');
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
        const requiredList = getOpenApiDefinitionPropGetter(openApiDocument, parentClone, true, definitions || {}, x => (x as OpenApiDefinitionObject)?.required || [], 'array');
        const propName = path.split('.').splice(-1)[0];
        this.required = requiredList.includes(propName);
        if (path == 'subCategoryCounterSelector' || propName.includes('categoryCounterSelector')) {
            if (this.required) {
                const a = 1;
            }
        }
    }
}
