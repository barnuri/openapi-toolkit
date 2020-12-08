import { ChangesModelDefaultValue } from './../models/editor/ChangesModel';
import { EditorPrimitiveInput, ChangesModel } from '../models';
import { JSONPath } from 'jsonpath-plus';
import { cloneHelper } from './cloneHelper';

export function primitiveGetValue(_changes: ChangesModel, _value: any, _primitiveInput: EditorPrimitiveInput) {
    try {
        const primitiveInput = cloneHelper(_primitiveInput);
        let value = cloneHelper(_value || {});
        let changes: ChangesModel = cloneHelper(_changes || ChangesModelDefaultValue);
        value = value || {};
        changes = changes || ChangesModelDefaultValue;
        return changes.$set[primitiveInput.path] ?? JSONPath({ json: value, path: '$.' + primitiveInput.path })[0] ?? '';
    } catch {
        return undefined;
    }
}

export function primitiveSetValue(newVal: any, _changes: ChangesModel, _primitiveInput: EditorPrimitiveInput): ChangesModel {
    const primitiveInput = cloneHelper(_primitiveInput);
    let changes: ChangesModel = cloneHelper(_changes || ChangesModelDefaultValue);
    changes = changes || ChangesModelDefaultValue;
    changes = changesSetValue(newVal, changes, primitiveInput.path);
    return changes;
}

export function changesSetValue(newVal: any, _changes: ChangesModel, path: string): ChangesModel {
    let changes: ChangesModel = cloneHelper(_changes || ChangesModelDefaultValue);
    changes.$set = changes.$set || {};
    changes.$set[path] = newVal;
    return changes;
}
