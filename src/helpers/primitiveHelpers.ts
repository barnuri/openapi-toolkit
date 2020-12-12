import { ChangesModelDefaultValue } from './../models/editor/ChangesModel';
import { EditorPrimitiveInput, ChangesModel } from '../models';
import { cloneHelper } from './cloneHelper';
import { jsonPath } from './jsonPath';

export function primitiveGetValue(_changes: ChangesModel, _value: any, _primitiveInput: EditorPrimitiveInput) {
    try {
        const primitiveInput = cloneHelper(_primitiveInput);
        let value = cloneHelper(_value || {});
        let changes: ChangesModel = cloneHelper(_changes || ChangesModelDefaultValue);
        value = value || {};
        changes = changes || ChangesModelDefaultValue;
        return changes.$set[primitiveInput.path] ?? jsonPath(value, '$.' + primitiveInput.path)[0] ?? '';
    } catch {
        return undefined;
    }
}

export function primitiveSetValue(newVal: string | number | boolean | Date, _changes: ChangesModel, _primitiveInput: EditorPrimitiveInput): ChangesModel {
    const primitiveInput = cloneHelper(_primitiveInput);
    let changes: ChangesModel = cloneHelper(_changes || ChangesModelDefaultValue);
    changes = changes || ChangesModelDefaultValue;
    switch (primitiveInput.type) {
        case 'boolean':
            newVal = newVal === true || newVal === 'true' || newVal === 1;
            break;
        case 'date':
            newVal = new Date(newVal as any);
            break;
        case 'number':
            newVal = +newVal;
            break;
    }
    changes = changesSetValue(newVal, changes, primitiveInput.path);
    return changes;
}

export function changesSetValue(newVal: any, _changes: ChangesModel, path: string): ChangesModel {
    let changes: ChangesModel = cloneHelper(_changes || ChangesModelDefaultValue);
    changes.$set = changes.$set || {};
    changes.$set[path] = newVal;
    return changes;
}
