import { EditorInput } from './../models/editor/EditorInput';
import { ChangesModelDefaultValue } from './../models/editor/ChangesModel';
import { EditorObjectInput, ChangesModel, EditorArrayInput } from '../models';
import { cloneHelper } from './utilsHelper';
import { jsonPath } from './utilsHelper';

export function objectSetSelectedSwitchable(objectInput: EditorObjectInput, _changes: ChangesModel, newSwitchableType: string): ChangesModel {
    let changes = cloneHelper(_changes || ChangesModelDefaultValue);
    changes = changes || ChangesModelDefaultValue;
    const jpath = objectInput.path + '._t';
    changes.$set[jpath] = newSwitchableType;
    return changes;
}
export function objectGetSelectedSwitchable(objectInput: EditorObjectInput, _value: any, _changes: ChangesModel): string {
    let changes = cloneHelper(_changes || ChangesModelDefaultValue);
    let value = cloneHelper(_value || {});
    value = value || {};
    changes = changes || ChangesModelDefaultValue;
    const jpath = objectInput.path + '._t';
    return changes.$set[jpath] ?? jsonPath(value, jpath)[0] ?? '';
}

export function objectGetDictionaryKeys(objectInput: EditorObjectInput, _value: any, _changes: ChangesModel): string[] {
    let changes = cloneHelper(_changes || ChangesModelDefaultValue);
    let value = cloneHelper(_value || {});
    value = value || {};
    changes = changes || ChangesModelDefaultValue;
    const existingKeys = Object.keys(jsonPath(value, objectInput.path)[0] || {});
    const newKeys = changes.dictNewKeys[objectInput.path] || [];
    const deletedKeys = Object.keys(changes.$unset)
        .filter(x => x.startsWith(objectInput.path + '.'))
        .map(x => x.split('.').splice(-1)[0]);
    return [...existingKeys, ...newKeys].filter(x => !deletedKeys.includes(x));
}

export function objectDictonaryInputModify(key: string, objectInput: EditorObjectInput) {
    return modifyDictionaryInput(key, objectInput.dictionaryInput!, objectInput.path);
}

export function objectDictonaryAddKey(key: string, objectInput: EditorObjectInput, _value: any, _changes: ChangesModel) {
    let changes = cloneHelper(_changes || ChangesModelDefaultValue);
    let value = cloneHelper(_value || {});
    value = value || {};
    changes = changes || ChangesModelDefaultValue;
    const currentKeys = objectGetDictionaryKeys(objectInput, value, changes);
    if (currentKeys.includes(key)) {
        return;
    }
    changes.dictNewKeys[objectInput.path] = changes.dictNewKeys[objectInput.path] || [];
    changes.dictNewKeys[objectInput.path].push(key);
    delete changes.$unset[objectInput.path + '.' + key];
    return changes;
}

export function objectDictonaryDeleteKey(key: string, objectInput: EditorObjectInput, _value: any, _changes: ChangesModel) {
    let changes = cloneHelper(_changes || ChangesModelDefaultValue);
    let value = cloneHelper(_value || {});
    value = value || {};
    changes = changes || ChangesModelDefaultValue;
    changes.dictNewKeys[objectInput.path] = changes.dictNewKeys[objectInput.path] || [];
    changes.dictNewKeys[objectInput.path] = changes.dictNewKeys[objectInput.path].filter(x => x !== key);
    changes.$unset[objectInput.path + '.' + key] = '';
    return changes;
}

function modifyDictionaryInput(key: string, editor: EditorInput, parentPath: string): EditorInput {
    let input = cloneHelper(editor || {});
    input.name = input.name.replace(parentPath, parentPath + '.' + key);
    input.path = input.path.replace(parentPath, parentPath + '.' + key);
    if (input.editorType === 'EditorObjectInput') {
        const objInput = input as EditorObjectInput;
        objInput.properties = objInput.properties || [];
        for (let j = 0; j < objInput.properties.length; j++) {
            objInput.properties[j] = modifyDictionaryInput(key, objInput.properties[j], parentPath);
        }
        objInput.switchableObjects = objInput.switchableObjects || [];
        for (let j = 0; j < objInput.switchableObjects.length; j++) {
            objInput.switchableObjects[j] = modifyDictionaryInput(key, objInput.switchableObjects[j], parentPath);
        }
        input = objInput;
    } else if (input.editorType === 'EditorArrayInput') {
        const arrInput = input as EditorArrayInput;
        arrInput.itemInput = modifyDictionaryInput(key, arrInput.itemInput, parentPath);
        input = arrInput;
    }
    return cloneHelper(input);
}
