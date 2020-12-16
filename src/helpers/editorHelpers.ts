import { EditorArrayInput } from './../models/editor/EditorArrayInput';
import { EditorObjectInput } from './../models/editor/EditorObjectInput';
import { EditorInput } from '../models/editor/EditorInput';
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
