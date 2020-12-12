import { OpenApiDefinitionsDictionary } from './../models/openapi/OpenApiDefinitionsDictionary';
import { getOpenApiDefinitionObject, getOpenApiDefinitionObjectProps } from './openApiHelper';
import {
    EditorInput,
    Editor,
    EditorArrayInput,
    OpenApiDocument,
    EditorPrimitiveInput,
    OpenApiDefinitionObject,
    OpenApiDefinition,
    EditorObjectInput,
    OpenApiDefinitionType,
} from '../models';

export function getEditor(openApiDocument: OpenApiDocument, editorName: string): Editor {
    let definitions = getDefinisions(openApiDocument);
    const tabContainers = getOpenApiDefinitionObjectProps(definitions[editorName]);
    const existingObjectEditorInputs: { [inputName: string]: EditorObjectInput } = {};

    const getEditorInput = (path: string, definition: OpenApiDefinition, parentDefinition: OpenApiDefinitionObject | undefined): EditorInput => {
        const defAndRefName = getOpenApiDefinitionObject(definition, definitions);
        let definitionObj = defAndRefName.def;
        if (Array.isArray(definitionObj.type)) {
            definitionObj.type = [...definitionObj.type, 'string'].filter(x => x != 'null')[0] as OpenApiDefinitionType;
        }
        if (isPrimitive(definitionObj)) {
            return new EditorPrimitiveInput(getPrimitiveType(definitionObj)!, path, definitionObj, parentDefinition);
        }
        if (definitionObj.type == 'array') {
            path = path + '[i]';
            const itemInput = getEditorInput(path, getOpenApiDefinitionObject(definitionObj.items!, definitions).def, parentDefinition);
            return new EditorArrayInput(itemInput, path, definitionObj, parentDefinition);
        }

        definitionObj.anyOf = definitionObj.anyOf || [];
        const switchableOptions = definitionObj.anyOf.map(x => getOpenApiDefinitionObject(x, definitions).def.title!) || [];
        const objectInput = new EditorObjectInput(switchableOptions, path, defAndRefName.refName || '', definitionObj, parentDefinition);
        const existingObjectInput = existingObjectEditorInputs[objectInput.definistionName] || existingObjectEditorInputs[objectInput.name];
        if (existingObjectInput) {
            return { ...existingObjectInput, path, name: objectInput.name };
        }
        existingObjectEditorInputs[objectInput.definistionName || objectInput.name] = objectInput;
        const props = getOpenApiDefinitionObjectProps(definitionObj);
        const propsInputs: EditorInput[] =
            Object.keys(props).map(propContainerName => getEditorInput(`${path}.${propContainerName}`, props[propContainerName], definitionObj)) || [];

        const switchableObjects: EditorInput[] = [];
        for (const switchable of definitionObj.anyOf) {
            definitions = { ...getDefinisions(switchable), ...definitions };
            switchableObjects.push(getEditorInput(path, switchable, parentDefinition));
        }
        let dictionaryInput: EditorInput | undefined = undefined;
        if (!!definitionObj.additionalProperties) {
            try {
                dictionaryInput = getEditorInput(path, getOpenApiDefinitionObject(definitionObj.additionalProperties as any, definitions).def, definitionObj);
            } catch {
                dictionaryInput = new EditorPrimitiveInput('string', path, definitionObj, parentDefinition);
            }
            dictionaryInput.name = 'value';
        }
        objectInput.properties = propsInputs;
        objectInput.switchableObjects = !objectInput.switchable ? [] : switchableObjects || [];
        objectInput.dictionaryInput = dictionaryInput;
        return objectInput;
    };

    const editor = new Editor();
    editor.name = editorName;
    editor.inputs = Object.keys(tabContainers).map(containerName => getEditorInput(containerName, tabContainers[containerName], undefined));
    return editor;
}

export function getDefinisions(openApiDocument: OpenApiDocument | OpenApiDefinitionObject): OpenApiDefinitionsDictionary {
    return { ...(openApiDocument.definitions || {}), ...((openApiDocument.components || {}).schemas || {}) };
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
