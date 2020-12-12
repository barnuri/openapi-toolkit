import { EditorPrimitiveInput } from './../models';
import { OpenApiDefinitionType } from './../models/openapi/OpenApiDefinitionType';
import { EditorObjectInput } from './../models/editor/EditorObjectInput';
import { OpenApiDefinition } from '../models/openapi/OpenApiDefinition';
import { OpenApiDefinitionObject } from '../models/openapi/OpenApiDefinitionObject';
import { getOpenApiDefinitionObject } from './getOpenApiDefinitionObject';
import { getOpenApiDefinitionObjectProps } from './getOpenApiDefinitionObjectProps';
import { OpenApiDocument } from '../models/openapi/OpenApiDocument';
import { EditorArrayInput } from '../models/editor/EditorArrayInput';
import { EditorInput } from '../models/editor/EditorInput';
import { Editor } from '../models/editor/Editor';
import { getEditorInputName } from './getEditorInputName';

export function getEditor(openApiDocument: OpenApiDocument, definistionName: string): Editor {
    let definitions = openApiDocument.definitions || (openApiDocument.components || {}).schemas || {};
    const tabContainers = getOpenApiDefinitionObjectProps(definitions[definistionName]);

    const getEditorInput = (path: string, definition: OpenApiDefinition, parentDefinition: OpenApiDefinitionObject | undefined): EditorInput => {
        let definitionObj = getOpenApiDefinitionObject(definition, definitions);
        if (Array.isArray(definitionObj.type)) {
            definitionObj.type = [...definitionObj.type, 'string'].filter(x => x != 'null')[0] as OpenApiDefinitionType;
        }
        if (isPrimitive(definitionObj)) {
            return new EditorPrimitiveInput(getPrimitiveType(definitionObj)!, path, definitionObj, parentDefinition);
        }
        if (definitionObj.type == 'array') {
            path = path + '[i]';
            const itemInput = getEditorInput(path, getOpenApiDefinitionObject(definitionObj.items!, definitions), parentDefinition);
            return new EditorArrayInput(itemInput, path, definitionObj, parentDefinition);
        }

        const props = getOpenApiDefinitionObjectProps(definitionObj);
        const propsInputs: EditorInput[] =
            Object.keys(props).map(propContainerName => getEditorInput(`${path}.${propContainerName}`, props[propContainerName], definitionObj)) || [];

        definitionObj.anyOf = definitionObj.anyOf || [];
        const switchableOptions = definitionObj.anyOf.map(x => getOpenApiDefinitionObject(x, definitions).title!) || [];
        const switchableObjects: EditorInput[] = [];
        for (const switchable of definitionObj.anyOf) {
            definitions = { ...switchable.definitions, ...definitions };
            switchableObjects.push(getEditorInput(path, switchable, parentDefinition));
        }
        let dictionaryInput: EditorInput | undefined = undefined;
        if (!!definitionObj.additionalProperties) {
            try {
                dictionaryInput = getEditorInput(path, getOpenApiDefinitionObject(definitionObj.additionalProperties as any, definitions), definitionObj);
            } catch {
                dictionaryInput = new EditorPrimitiveInput('string', path, definitionObj, parentDefinition);
            }
            dictionaryInput.name = 'value';
        }
        return new EditorObjectInput(propsInputs, switchableObjects, switchableOptions, path, definitionObj, parentDefinition, dictionaryInput);
    };

    const editor = new Editor();
    editor.name = definistionName;
    editor.inputs = Object.keys(tabContainers).map(containerName => getEditorInput(containerName, tabContainers[containerName], undefined));
    return editor;
}

function getPrimitiveType(definition: OpenApiDefinitionObject): 'number' | 'date' | 'string' | 'enum' | 'boolean' | undefined {
    if (definition.type == 'boolean') {
        return 'boolean';
    } else if ((definition.enum || []).length > 0 || (definition['x-enumNames'] || []).length > 0) {
        return 'enum';
    } else if (definition.type == 'integer' || definition.type == 'number') {
        return 'number';
    } else if (definition.type == 'string') {
        return definition.format == 'date-time' ? 'date' : 'string';
    }
    return undefined;
}

function isPrimitive(definition: OpenApiDefinitionObject) {
    return getPrimitiveType(definition) !== undefined;
}
