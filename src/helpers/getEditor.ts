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
import { modifyInputPath } from './editorHelpers';
import { cloneHelper } from './utilsHelper';

export function getEditor(openApiDocument: OpenApiDocument, editorName: string, includeInheritProps: boolean = false): Editor {
    let definitions = getDefinisions(openApiDocument);
    const tabContainers = getOpenApiDefinitionObjectProps(definitions[editorName], false, definitions);
    const existingObjectEditorInputs: { [inputName: string]: EditorObjectInput } = {};

    const getEditorInput = (
        path: string,
        definition: OpenApiDefinition,
        parentDefinition: OpenApiDefinitionObject | undefined,
        switchableRefName?: string,
    ): EditorInput => {
        const defAndRefName = getOpenApiDefinitionObject(definition, definitions);
        let definitionObj = defAndRefName.def;
        definitionObj.anyOf = definitionObj.anyOf?.filter(x => x.title != definitionObj.title);
        if ((definitionObj.allOf || []).length > 0) {
            defAndRefName.refName = defAndRefName.refName || switchableRefName;
        }
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
        const objectInput = new EditorObjectInput([], path, defAndRefName.refName || '', definitionObj, parentDefinition);
        if (objectInput.definistionName) {
            const existingObjectInput = existingObjectEditorInputs[objectInput.definistionName];
            if (existingObjectInput) {
                return modifyInputPath(cloneHelper(existingObjectInput), existingObjectInput.path, path);
            }
            existingObjectEditorInputs[objectInput.definistionName] = objectInput;
        }
        const props = getOpenApiDefinitionObjectProps(definitionObj, true, definitions);
        const propsInputs: EditorInput[] =
            Object.keys(props).map(propContainerName => getEditorInput(`${path}.${propContainerName}`, props[propContainerName], definitionObj)) || [];
        const switchableObjects: EditorInput[] = [];
        for (const switchable of definitionObj.anyOf) {
            if (!switchable.title || switchable.title === definitionObj.title || switchable.title === defAndRefName.refName) {
                continue;
            }
            definitions = { ...getDefinisions(switchable), ...definitions };
            const switchableObject = cloneHelper(getEditorInput(path, switchable, parentDefinition, switchable.title));
            if (switchableObject.editorType === 'EditorObjectInput') {
                (switchableObject as EditorObjectInput).properties = (switchableObject as EditorObjectInput).properties.filter(
                    x => !propsInputs.map(x => x.name).includes(x.name),
                );
            }
            switchableObjects.push(switchableObject);
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
        objectInput.switchableOptions = !objectInput.switchable ? [] : switchableObjects.map(x => x.openApiDefinition.title!) || [];
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
