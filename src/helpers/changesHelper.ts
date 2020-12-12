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

export function chagesGetPathValue(_changes: ChangesModel, _value: any, _editorInput: EditorInput): { pathValue: any; isUnset: boolean } {
    const editorInput = cloneHelper(_editorInput || {});
    let value = cloneHelper(_value || {});
    let changes: ChangesModel = cloneHelper(_changes || ChangesModelDefaultValue);
    value = value || {};
    changes = changes || ChangesModelDefaultValue;
    const res = { pathValue: changes.$set[editorInput.path] ?? jsonPath(value, '$.' + editorInput.path)[0] ?? (editorInput as any).default, isUnset: false };
    if (res.pathValue === undefined || Object.keys(changes.$unset).filter(x => x === editorInput.path).length > 0) {
        return { pathValue: '', isUnset: true };
    }
    return res;
}
