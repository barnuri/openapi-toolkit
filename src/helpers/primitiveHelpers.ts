import { ChangesModelDefaultValue } from './../models/editor/ChangesModel';
import { EditorPrimitiveInput, ChangesModel } from '../models';
import { cloneHelper } from './utilsHelper';
import { changesGetPathValue, changesSetValue } from './changesHelper';

export function primitiveGetValue(_changes: ChangesModel, _value: any, _primitiveInput: EditorPrimitiveInput): any {
    return changesGetPathValue(_changes, _value, _primitiveInput).pathValue;
}

export function primitiveSetValue(newVal: string | number | boolean | Date, _changes: ChangesModel, _primitiveInput: EditorPrimitiveInput): ChangesModel {
    const primitiveInput = cloneHelper(_primitiveInput || {});
    let changes: ChangesModel = cloneHelper(_changes || ChangesModelDefaultValue);
    changes = changes || ChangesModelDefaultValue;
    if (newVal !== null) {
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
    }
    changes = changesSetValue(newVal, changes, primitiveInput.path);
    return changes;
}
