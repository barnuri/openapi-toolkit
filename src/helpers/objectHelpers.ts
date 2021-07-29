import { ChangesModelDefaultValue } from './../models/editor/ChangesModel';
import { EditorObjectInput, ChangesModel } from '../models';
import { cloneHelper } from './utilsHelper';
import { jsonPath } from './utilsHelper';
import { modifyInputPath } from './editorHelpers';

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
    return changes.$set[jpath] ?? jsonPath(value, jpath) ?? '';
}

export function objectGetDictionaryKeys(objectInput: EditorObjectInput, _value: any, _changes: ChangesModel): string[] {
    let changes = cloneHelper(_changes || ChangesModelDefaultValue);
    let value = cloneHelper(_value || {});
    value = value || {};
    changes = changes || ChangesModelDefaultValue;
    const existingKeys = Object.keys(jsonPath(value, objectInput.path) || {});
    const newKeys = changes.dictNewKeys[objectInput.path] || [];
    const deletedKeys = Object.keys(changes.$unset)
        .filter(x => x.startsWith(objectInput.path + '.'))
        .map(x => x.split('.').splice(-1)[0]);
    return [...existingKeys, ...newKeys].filter(x => !deletedKeys.includes(x));
}

export function objectDictonaryInputModify(key: string, objectInput: EditorObjectInput) {
    return modifyInputPath(objectInput.dictionaryInput!, objectInput.path, objectInput.path + '.' + key);
}

export function objectDictonaryAddKey(key: string, objectInput: EditorObjectInput, _value: any, _changes: ChangesModel): ChangesModel {
    let changes = cloneHelper(_changes || ChangesModelDefaultValue);
    let value = cloneHelper(_value || {});
    value = value || {};
    changes = changes || ChangesModelDefaultValue;
    const currentKeys = objectGetDictionaryKeys(objectInput, value, changes);
    if (currentKeys.includes(key)) {
        return changes;
    }

    if (!key || (new RegExp('^[a-zA-Z](?=[a-zA-Z0-9._]{2,20}$)(?!.*[_.]{2})[^_.].*[^_.]$', 'gm').exec(key) || []).length <= 0) {
        throw new Error('key is undefined or not match key regex : /^[a-zA-Z](?=[a-zA-Z0-9._]{2,20}$)(?!.*[_.]{2})[^_.].*[^_.]$/gm');
    }

    changes.dictNewKeys[objectInput.path] = changes.dictNewKeys[objectInput.path] || [];
    changes.dictNewKeys[objectInput.path].push(key);
    delete changes.$unset[objectInput.path + '.' + key];
    return changes;
}

export function objectDictonaryDeleteKey(key: string, objectInput: EditorObjectInput, _value: any, _changes: ChangesModel): ChangesModel {
    let changes = cloneHelper(_changes || ChangesModelDefaultValue);
    let value = cloneHelper(_value || {});
    value = value || {};
    changes = changes || ChangesModelDefaultValue;
    changes.dictNewKeys[objectInput.path] = changes.dictNewKeys[objectInput.path] || [];
    changes.dictNewKeys[objectInput.path] = changes.dictNewKeys[objectInput.path].filter(x => x !== key);
    changes.$unset[objectInput.path + '.' + key] = '';
    delete changes.$set[objectInput.path + '.' + key];
    return changes;
}
