import { OpenApiDefinitionObject } from './../openapi/OpenApiDefinitionObject';
import { EditorInput } from './EditorInput';

export class EditorObjectInput extends EditorInput {
    public properties: EditorInput[];
    public readonly isAbstract: boolean;
    public readonly switchable: boolean;
    public readonly switchableOptions: string[];
    public switchableObjects: EditorInput[];
    public readonly isDictionary: boolean;
    public readonly dictionaryInput: EditorInput | undefined;

    constructor(
        properties: EditorInput[],
        switchableObjects: EditorInput[],
        switchableOptions: string[],
        path: string,
        openApiDefinition: OpenApiDefinitionObject,
        openApiParentDefinition: OpenApiDefinitionObject | undefined,
        dictionaryInput: EditorInput | undefined,
    ) {
        super(path, 'EditorObjectInput', openApiDefinition, openApiParentDefinition);
        openApiDefinition.anyOf = openApiDefinition.anyOf || [];
        this.switchable = openApiDefinition.anyOf.length > 0;
        this.isAbstract = openApiDefinition['x-abstract'] == true;
        this.properties = properties;
        this.switchableOptions = !this.switchable ? [] : switchableOptions || [];
        this.switchableObjects = !this.switchable ? [] : switchableObjects || [];
        this.isDictionary = !!openApiDefinition.additionalProperties;
        this.dictionaryInput = dictionaryInput;
    }
}
