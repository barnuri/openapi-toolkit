import { EditorPrimitiveInput } from './../models/editor/EditorPrimitiveInput';
import { OpenApiDefinitionObject } from '../models/openapi/OpenApiDefinitionObject';

export function getPrimitiveInput(
    path: string,
    container: OpenApiDefinitionObject,
    parentContainer?: OpenApiDefinitionObject,
): EditorPrimitiveInput | undefined {
    let type: 'number' | 'date' | 'string' | 'enum' | 'boolean' | undefined = undefined;
    if (container.type == 'boolean') {
        type = 'boolean';
    } else if ((container.enum || []).length > 0 || (container['x-enumNames'] || []).length > 0) {
        type = 'enum';
    } else if (container.type == 'integer' || container.type == 'number') {
        type = 'number';
    } else if (container.type == 'string') {
        type = container.format == 'date-time' ? 'date' : 'string';
    }
    if (!type) {
        return undefined;
    }
    const editor = new EditorPrimitiveInput();
    editor.path = path;
    editor.required = inputIsRequired(path, parentContainer);
    editor.type = type;
    editor.description = container.description;
    editor.enumNames = container['x-enumNames'];
    editor.enumValues = container.enum;
    editor.title = container.title;
    editor.pattern = container.pattern;
    editor.maxLength = container.maxLength;
    editor.minLength = container.minLength;
    editor.maximum = container.maximum;
    editor.minimum = container.minimum;

    return editor;
}

export function inputIsRequired(path: string, parentContainer?: OpenApiDefinitionObject) {
    return ((parentContainer || {}).required || []).includes(path.split('.').splice(-1)[0]);
}
