import { EditorPrimitiveInput } from './../models/editor/EditorPrimitiveInput';
import { OpenApiDefinitionObject } from '../models/openapi/OpenApiDefinitionObject';

export function getPrimitiveInput(
    path: string,
    definition: OpenApiDefinitionObject,
    parentDefinition?: OpenApiDefinitionObject,
): EditorPrimitiveInput | undefined {
    let type: 'number' | 'date' | 'string' | 'enum' | 'boolean' | undefined = undefined;
    if (definition.type == 'boolean') {
        type = 'boolean';
    } else if ((definition.enum || []).length > 0 || (definition['x-enumNames'] || []).length > 0) {
        type = 'enum';
    } else if (definition.type == 'integer' || definition.type == 'number') {
        type = 'number';
    } else if (definition.type == 'string') {
        type = definition.format == 'date-time' ? 'date' : 'string';
    }
    if (!type) {
        return undefined;
    }
    const editor = new EditorPrimitiveInput();
    editor.openApiDefinition = definition;
    editor.openApiParentDefinition = parentDefinition;
    editor.path = path;
    editor.required = inputIsRequired(path, parentDefinition);
    editor.type = type;
    editor.description = definition.description;
    editor.enumNames = definition['x-enumNames'];
    editor.enumValues = definition.enum;
    editor.title = definition.title;
    editor.pattern = definition.pattern;
    editor.maxLength = definition.maxLength;
    editor.minLength = definition.minLength;
    editor.maximum = definition.maximum;
    editor.minimum = definition.minimum;
    editor.editorType = 'EditorPrimitiveInput';
    return editor;
}

export function inputIsRequired(path: string, parentContainer?: OpenApiDefinitionObject) {
    return ((parentContainer || {}).required || []).includes(path.split('.').splice(-1)[0]);
}
