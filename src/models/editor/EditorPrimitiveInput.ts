import { OpenApiDefinitionsDictionary } from './../openapi/OpenApiDefinitionsDictionary';
import { OpenApiDefinitionObject } from './../openapi/OpenApiDefinitionObject';
import { EditorInput } from './EditorInput';

export class EditorPrimitiveInput extends EditorInput {
    public readonly type: 'number' | 'date' | 'string' | 'enum' | 'boolean';
    public readonly enumNames: string[];
    public readonly enumValues: number[];
    public readonly enumsOptions: string[] | number[];
    public readonly maximum: number | undefined;
    public readonly minimum: number | undefined;
    public readonly maxLength: number | undefined;
    public readonly minLength: number | undefined;
    public readonly pattern: string | undefined;

    constructor(
        type: 'number' | 'date' | 'string' | 'enum' | 'boolean',
        path: string,
        openApiDefinition: OpenApiDefinitionObject,
        openApiParentDefinition: OpenApiDefinitionObject | undefined,
        definitions: OpenApiDefinitionsDictionary | undefined
    ) {
        super(path, 'EditorPrimitiveInput', openApiDefinition, openApiParentDefinition, definitions);
        this.enumNames = openApiDefinition['x-enumNames'] || [];
        this.enumValues = openApiDefinition.enum || [];
        this.pattern = openApiDefinition.pattern;
        this.maxLength = openApiDefinition.maxLength;
        this.minLength = openApiDefinition.minLength;
        this.maximum = openApiDefinition.maximum;
        this.minimum = openApiDefinition.minimum;
        this.enumsOptions = this.enumNames.length > 0 ? this.enumNames : this.enumValues;
        this.default = openApiDefinition.default;
        this.type = type;
    }
}
