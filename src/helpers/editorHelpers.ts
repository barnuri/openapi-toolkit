import { ChangesModel } from '../models';
import { EditorInput, Editor, EditorObjectInput, EditorArrayInput, OpenApiDocument } from '../models';
import { getDefinisions, getEditor } from './getEditor';
import { cloneHelper } from './utilsHelper';

export function modifyInputPath(editor: EditorInput, parentPath: string, newParentPath: string): EditorInput {
    let input = cloneHelper(editor || {});
    input.path = input.path.replace(parentPath, newParentPath);
    input.name = editorNameByPath(input.path);
    if (input.editorType === 'EditorObjectInput') {
        const objInput = input as EditorObjectInput;
        objInput.properties = objInput.properties || [];
        for (let j = 0; j < objInput.properties.length; j++) {
            objInput.properties[j] = modifyInputPath(objInput.properties[j], parentPath, newParentPath);
        }
        objInput.switchableObjects = objInput.switchableObjects || [];
        for (let j = 0; j < objInput.switchableObjects.length; j++) {
            objInput.switchableObjects[j] = modifyInputPath(objInput.switchableObjects[j], parentPath, newParentPath);
        }
        if (objInput.dictionaryInput) {
            objInput.dictionaryInput = modifyInputPath(objInput.dictionaryInput, parentPath, newParentPath);
        }
        input = objInput;
    } else if (input.editorType === 'EditorArrayInput') {
        const arrInput = input as EditorArrayInput;
        arrInput.itemInput = modifyInputPath(arrInput.itemInput, parentPath, newParentPath);
        input = arrInput;
    }
    return cloneHelper(input);
}

export function editorNameByInput(editor: EditorInput): string {
    return editorNameByPath(editor.path);
}

export function editorNameByPath(editorPath: string): string {
    return (editorPath || '').split('.').splice(-1)[0];
}

export function getAllEditors(openApiDocument: OpenApiDocument): Editor[] {
    let definitions = getDefinisions(openApiDocument);
    const allEditors = Object.keys(definitions).map(x => getEditor(openApiDocument, x, true));
    return allEditors;
}

export function getAllEditorInputsByEditors(editors: Editor[]): EditorInput[] {
    let allEditors: EditorInput[] = [];
    for (const editor of editors) {
        for (const input of editor.inputs) {
            allEditors = [...allEditors, ...getAllEditorInputsByInput(input)];
        }
        allEditors.push(editor.editorAsInput);
    }
    return allEditors;
}

export function getAllEditorInputsByInput(editorInput: EditorInput): EditorInput[] {
    let allEditors: EditorInput[] = [];
    let input = cloneHelper(editorInput || {});
    if (input.editorType === 'EditorObjectInput') {
        const objInput = input as EditorObjectInput;
        objInput.properties = objInput.properties || [];
        for (let j = 0; j < objInput.properties.length; j++) {
            allEditors = [...allEditors, ...getAllEditorInputsByInput(objInput.properties[j])];
        }
        objInput.switchableObjects = objInput.switchableObjects || [];
        for (let j = 0; j < objInput.switchableObjects.length; j++) {
            allEditors = [...allEditors, ...getAllEditorInputsByInput(objInput.switchableObjects[j])];
        }
        if (objInput.dictionaryInput) {
            allEditors = [...allEditors, ...getAllEditorInputsByInput(objInput.dictionaryInput)];
        }
        input = objInput;
    } else if (input.editorType === 'EditorArrayInput') {
        const arrInput = input as EditorArrayInput;
        allEditors = [...allEditors, ...getAllEditorInputsByInput(arrInput.itemInput)];
        input = arrInput;
    }
    allEditors = [...allEditors, cloneHelper(input)];
    return allEditors;
}

export function editorFilterUnkownPaths(editor: Editor, pathesToCheck: string[]): string[] {
    const inputs = getAllEditorInputsByEditors([editor]);
    pathesToCheck = pathesToCheck.map(x => x.replace(/\[\d+\]/g, '[i]'));
    const existingPathes = inputs.map(x => x.path.replace(/\[\d+\]/g, '[i]').trim());
    const existBoth = pathesToCheck.filter(value => existingPathes.includes(value));
    return existBoth;
}

const fixPathForArraies = (fieldKey: string): string => {
    const indexesStr = [...fieldKey.matchAll(/\.\d+/g)]?.map(x => x[0].replace('.', '')).join('-');
    const modifiedKey = fieldKey.replace(/\.\d+/g, '') + indexesStr;
    return modifiedKey;
};

export const getEditorChangesHash = (changes: ChangesModel, editorInput: EditorInput): string => {
    const arrayPath = editorInput.path.replace(/\[i\]/g, '');
    let res = '';
    for (const changeType of Object.keys(changes)) {
        for (const fieldKey of Object.keys(changes[changeType])) {
            const fixedFieldKey = fixPathForArraies(fieldKey);
            if (fieldKey.startsWith(arrayPath) || fixedFieldKey.startsWith(fixPathForArraies(arrayPath)) || fixPathForArraies(fieldKey).startsWith(arrayPath)) {
                res += fieldKey + '=' + changes[changeType][fieldKey];
            }
        }
    }
    return res;
};
