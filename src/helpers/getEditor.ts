import { EditorObjectInput } from './../models/editor/EditorObjectInput';
import { OpenApiDefinition } from '../models/openapi/OpenApiDefinition';
import { OpenApiDefinitionObject } from '../models/openapi/OpenApiDefinitionObject';
import { getOpenApiDefinitionObject } from './getOpenApiDefinitionObject';
import { getOpenApiDefinitionObjectProps } from './getOpenApiDefinitionObjectProps';
import { getPrimitiveInput, inputIsRequired } from './getPrimitiveInput';
import { OpenApiDocument } from '../models/openapi/OpenApiDocument';
import { EditorArrayInput } from '../models/editor/EditorArrayInput';
import { EditorInput } from '../models/editor/EditorInput';
import { Editor } from '../models/editor/Editor';

export function getEditor(openApiDocument: OpenApiDocument, definistionName: string): Editor {
    let definitions = openApiDocument.definitions || (openApiDocument.components || {}).schemas || {};
    const tabContainers = getOpenApiDefinitionObjectProps(definitions[definistionName]);
    const inputs: EditorInput[] = [];

    const getEditorInput = (path: string, definition: OpenApiDefinition, parentDefinition?: OpenApiDefinitionObject): EditorInput => {
        let definitionObj = getOpenApiDefinitionObject(definition, definitions);

        // primitive types
        const primitiveInput = getPrimitiveInput(path, definitionObj, parentDefinition);
        if (primitiveInput) {
            return primitiveInput;
        }
        if (definitionObj.type == 'array') {
            const itemsObj = getOpenApiDefinitionObject(definitionObj.items!, definitions);
            path = path + '[i]';
            const itemPrimitiveInput = getPrimitiveInput(path, itemsObj, parentDefinition);
            const arrayInput = new EditorArrayInput();
            arrayInput.path = path;
            arrayInput.required = inputIsRequired(path, parentDefinition);
            arrayInput.itemInput = itemPrimitiveInput || getEditorInput(path, getOpenApiDefinitionObject(definitionObj.items!, definitions), parentDefinition);
            return arrayInput;
        }
        // is object
        const props = getOpenApiDefinitionObjectProps(definitionObj);
        const propsInputs: EditorInput[] = [];
        for (const propContainerName of Object.keys(props)) {
            propsInputs.push(getEditorInput(`${path}.${propContainerName}`, props[propContainerName], definitionObj));
        }
        definitionObj.anyOf = definitionObj.anyOf || [];
        const objectEditor = new EditorObjectInput();
        objectEditor.path = path;
        objectEditor.properties = propsInputs;
        objectEditor.switchable = definitionObj.anyOf.length > 0;
        if (objectEditor.switchable) {
            objectEditor.switchableOptions = definitionObj.anyOf!.map(x => getOpenApiDefinitionObject(x, definitions).title!);
            objectEditor.switchableObjects = [];
            for (const switchable of definitionObj.anyOf!) {
                definitions = { ...switchable.definitions, ...definitions };
                objectEditor.switchableObjects.push(getEditorInput(path, switchable, parentDefinition));
            }
        }
        return objectEditor;
    };

    for (const containerName of Object.keys(tabContainers)) {
        inputs.push(getEditorInput(containerName, tabContainers[containerName]));
    }
    const editor = new Editor();
    editor.name = definistionName;
    editor.inputs = inputs;
    return editor;
}
