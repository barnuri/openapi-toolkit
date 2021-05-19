import { OpenApiDefinitionObject } from './../openapi/OpenApiDefinitionObject';
import { EditorInput } from './EditorInput';

export class EditorObjectInput extends EditorInput {
    public properties!: EditorInput[];
    public readonly isAbstract: boolean;
    public readonly switchable: boolean;
    public switchableOptions: string[];
    public switchableObjects!: EditorInput[];
    public readonly isDictionary: boolean;
    public dictionaryInput: EditorInput | undefined;
    public dictionaryKeyInput: EditorInput | undefined;
    public readonly definistionName: string;
    public implements: string[];
    constructor(
        switchableOptions: string[],
        path: string,
        definistionName: string,
        openApiDefinition: OpenApiDefinitionObject,
        openApiParentDefinition: OpenApiDefinitionObject | undefined,
    ) {
        super(path, 'EditorObjectInput', openApiDefinition, openApiParentDefinition);
        this.definistionName = definistionName;
        openApiDefinition.anyOf = openApiDefinition.anyOf || [];
        this.switchable = openApiDefinition.anyOf.length > 0;
        this.isAbstract = openApiDefinition['x-abstract'] == true || (openApiDefinition.allOf || []).filter(x => x['x-abstract'] == true).length > 0;
        this.switchableOptions = !this.switchable ? [] : switchableOptions || [];
        this.isDictionary = !!openApiDefinition.additionalProperties || !!openApiDefinition['x-dictionaryKey'];
        this.default = {};
        this.implements = [];
    }
}
