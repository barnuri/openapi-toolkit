import { OpenApiDefinitionsDictionary } from './../models/openapi/OpenApiDefinitionsDictionary';
import { getApiPaths, getOpenApiDefinitionObject, getOpenApiDefinitionObjectProps } from './openApiHelper';
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
import { cloneHelper, distinct } from './utilsHelper';

type existingObjectEditorInputs = { [inputName: string]: EditorObjectInput };

export function getEditor(openApiDocument: OpenApiDocument, editorName: string, includeInheritProps: boolean = false): Editor {
    let definitions = getDefinisions(openApiDocument);
    const tabContainers = getOpenApiDefinitionObjectProps(definitions[editorName], includeInheritProps, definitions);
    const existingObjectEditorInputs: existingObjectEditorInputs = {};
    const editor = new Editor();
    editor.name = editorName;
    editor.inputs = Object.keys(tabContainers).map(containerName =>
        getEditorInput(definitions, containerName, tabContainers[containerName], undefined, containerName, existingObjectEditorInputs),
    );
    editor.editorAsInput = getEditorInput2(openApiDocument, definitions[editorName]);
    editor.editorAsInput.className = editorName;
    return editor;
}

export function getEditorInput2(openApiDocument: OpenApiDocument, definition: OpenApiDefinition): EditorInput {
    return getEditorInput(getDefinisions(openApiDocument || {}), '', definition || {}, undefined, undefined, {});
}

export function getEditorInput(
    definitions: OpenApiDefinitionsDictionary,
    path: string,
    definition: OpenApiDefinition,
    parentDefinition: OpenApiDefinitionObject | undefined,
    switchableRefName?: string,
    existingObjectEditorInputs: existingObjectEditorInputs = {},
): EditorInput {
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
        const primitive = new EditorPrimitiveInput(getPrimitiveType(definitionObj)!, path, definitionObj, parentDefinition);
        primitive.className = defAndRefName.refName;
        return primitive;
    }
    if (definitionObj.type == 'array') {
        path = path + '[i]';
        const itemOpenApiObj = getOpenApiDefinitionObject(definitionObj.items!, definitions);
        const itemInput = getEditorInput(definitions, path, itemOpenApiObj.def, parentDefinition, undefined, existingObjectEditorInputs);
        itemInput.className = itemOpenApiObj.refName;
        return new EditorArrayInput(itemInput, path, definitionObj, parentDefinition);
    }

    definitionObj.anyOf = definitionObj.anyOf || [];
    const objectInput = new EditorObjectInput([], path, defAndRefName.refName || '', definitionObj, parentDefinition);
    objectInput.className = defAndRefName.refName || switchableRefName;
    if (objectInput.definistionName) {
        const existingObjectInput = existingObjectEditorInputs[objectInput.definistionName];
        if (existingObjectInput) {
            return modifyInputPath(cloneHelper(existingObjectInput), existingObjectInput.path, path);
        }
        existingObjectEditorInputs[objectInput.definistionName] = objectInput;
    }
    const props = getOpenApiDefinitionObjectProps(definitionObj, true, definitions);
    const propsInputs: EditorInput[] =
        Object.keys(props).map(propContainerName =>
            getEditorInput(definitions, `${path}.${propContainerName}`, props[propContainerName], definitionObj, propContainerName, existingObjectEditorInputs),
        ) || [];
    const switchableObjects: EditorInput[] = [];
    for (const switchable of definitionObj.anyOf) {
        if (!switchable.title || switchable.title === definitionObj.title || switchable.title === defAndRefName.refName) {
            continue;
        }
        definitions = { ...getDefinisions(switchable), ...definitions };
        const switchableObject = cloneHelper(getEditorInput(definitions, path, switchable, parentDefinition, switchable.title, existingObjectEditorInputs));
        if (switchableObject.editorType === 'EditorObjectInput') {
            (switchableObject as EditorObjectInput).properties = (switchableObject as EditorObjectInput).properties.filter(
                x => !propsInputs.map(x => x.name).includes(x.name),
            );
            (switchableObject as EditorObjectInput).implements = distinct([
                ...(switchableObject as EditorObjectInput).implements,
                objectInput.definistionName,
                ...(objectInput.openApiDefinition.anyOf?.map(x => x.type || x['$ref']?.split('/').slice(-1)[0]) || []),
            ]).filter(x => x);
        }
        switchableObjects.push(switchableObject);
    }
    let dictionaryInput: EditorInput | undefined = undefined;
    let dictionaryKeyInput: EditorInput | undefined = undefined;
    if (objectInput.isDictionary) {
        dictionaryInput = new EditorPrimitiveInput('string', path, definitionObj, parentDefinition);
        if (!!definitionObj.additionalProperties) {
            try {
                const dictOpenApiObj = getOpenApiDefinitionObject(definitionObj.additionalProperties as any, definitions);
                dictionaryInput = getEditorInput(definitions, path, dictOpenApiObj.def, definitionObj, undefined, existingObjectEditorInputs);
                dictionaryInput.className = dictOpenApiObj.refName;
            } catch {}
        }
        dictionaryInput.name = 'value';

        const dictionaryKeyInputObj = definitionObj['x-dictionaryKey'];
        dictionaryKeyInput = new EditorPrimitiveInput('string', path, definitionObj, parentDefinition);
        if (!!dictionaryKeyInputObj) {
            try {
                const dictOpenApiObj = getOpenApiDefinitionObject(dictionaryKeyInputObj as any, definitions);
                dictionaryKeyInput = getEditorInput(definitions, path, dictOpenApiObj.def, definitionObj, undefined, existingObjectEditorInputs);
                dictionaryKeyInput.className = dictOpenApiObj.refName;
            } catch {}
        }
        dictionaryKeyInput.name = 'key';
    }
    objectInput.properties = propsInputs;
    objectInput.switchableObjects = !objectInput.switchable ? [] : switchableObjects || [];
    objectInput.switchableOptions = !objectInput.switchable ? [] : switchableObjects.map(x => x.openApiDefinition.title!) || [];
    objectInput.dictionaryInput = dictionaryInput;
    objectInput.dictionaryKeyInput = dictionaryKeyInput;
    return objectInput;
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

function isPrimitive(definition: OpenApiDefinitionObject): boolean {
    return getPrimitiveType(definition) !== undefined;
}
