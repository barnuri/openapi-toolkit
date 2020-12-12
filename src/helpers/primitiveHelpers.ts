import { ChangesModelDefaultValue } from './../models/editor/ChangesModel';
import { EditorPrimitiveInput, ChangesModel } from '../models';
import { cloneHelper } from './utilsHelper';
import { jsonPath } from './utilsHelper';
import { changesSetValue } from './changesHelper';

export function primitiveGetValue(_changes: ChangesModel, _value: any, _primitiveInput: EditorPrimitiveInput) {
    const primitiveInput = cloneHelper(_primitiveInput);
    let value = cloneHelper(_value || {});
    let changes: ChangesModel = cloneHelper(_changes || ChangesModelDefaultValue);
    value = value || {};
    changes = changes || ChangesModelDefaultValue;
    return changes.$set[primitiveInput.path] ?? jsonPath(value, '$.' + primitiveInput.path)[0] ?? '';
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
