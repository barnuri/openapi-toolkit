import { EditorInput } from './../models/editor/EditorInput';
import { ChangesModel, ChangesModelDefaultValue } from '../models';
import { cloneHelper, jsonPath } from './utilsHelper';

export function changesSetValue(newVal: any, _changes: ChangesModel, path: string): ChangesModel {
    let changes: ChangesModel = cloneHelper(_changes || ChangesModelDefaultValue);
    changes.$set = changes.$set || {};
    changes.$set[path] = newVal;
    // cleanup
    delete changes.$unset[path];
    delete changes.$pull[path];
    return changes;
}

export function changesDeletePathValue(_changes: ChangesModel, _editorInput: EditorInput) {
    const editorInput = cloneHelper(_editorInput || {});
    let changes: ChangesModel = cloneHelper(_changes || ChangesModelDefaultValue);

    // cleanup
    Object.keys(changes.$set)
        .filter(key => key.startsWith(editorInput.path))
        .forEach(key => delete changes.$set[key]);

    changes.$unset = { ...changes.$unset, [editorInput.path]: '' };

    return changes;
}

export function changesGetPathValue(_changes: ChangesModel, _value: any, _editorInput: EditorInput) {
    const editorInput = cloneHelper(_editorInput || {});
    return changesGetPathValueByPath(_changes, _value, editorInput.path, (editorInput as any).default);
}

export function changesGetPathValueByPath(
    _changes: ChangesModel,
    _value: any,
    path: string,
    defaultValue: any = undefined,
): { pathValue: any; isUnset: boolean } {
    let value = cloneHelper(_value || {});
    let changes: ChangesModel = cloneHelper(_changes || ChangesModelDefaultValue);
    value = value || {};
    changes = changes || ChangesModelDefaultValue;
    const res = { pathValue: changes.$set[path] ?? jsonPath(value, '$.' + path)[0] ?? defaultValue, isUnset: false };
    if (res.pathValue === undefined || Object.keys(changes.$unset).filter(x => x === path).length > 0) {
        return { pathValue: '', isUnset: true };
    }
    return res;
}

export function chagesIsUnset(_changes: ChangesModel, _value: any, _editorInput: EditorInput) {
    return changesGetPathValue(_changes, _value, _editorInput).isUnset;
}
