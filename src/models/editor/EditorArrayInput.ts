import { OpenApiDefinitionsDictionary } from './../openapi/OpenApiDefinitionsDictionary';
import { OpenApiDefinitionObject } from './../openapi/OpenApiDefinitionObject';
import { EditorInput } from './EditorInput';
import { OpenApiDocument } from './../openapi/OpenApiDocument';

export class EditorArrayInput extends EditorInput {
    public itemInput: EditorInput;
    public readonly maxItems: number | undefined;
    public readonly minItems: number | undefined;
    public readonly uniqueItems: boolean | undefined;

    constructor(
        openApiDocument: OpenApiDocument,
        itemInput: EditorInput,
        path: string,
        openApiDefinition: OpenApiDefinitionObject,
        openApiParentDefinition: OpenApiDefinitionObject | undefined,
        definitions: OpenApiDefinitionsDictionary | undefined
    ) {
        super(openApiDocument, path, 'EditorArrayInput', openApiDefinition, openApiParentDefinition, definitions);
        this.itemInput = itemInput;
        this.maxItems = openApiDefinition.maxItems;
        this.minItems = openApiDefinition.minItems;
        this.default = [];
    }
}
