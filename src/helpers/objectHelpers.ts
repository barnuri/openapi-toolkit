import { ChangesModelDefaultValue } from './../models/editor/ChangesModel';
import { EditorObjectInput, ChangesModel } from '../models';
import { cloneHelper } from './cloneHelper';
import { jsonPath } from './jsonPath';

export function objectSetSelectedSwitchable(objectInput: EditorObjectInput, _changes: ChangesModel, newSwitchableType: string): ChangesModel {
    let changes = cloneHelper(_changes);
    changes = changes || ChangesModelDefaultValue;
    const jpath = objectInput.path + '._t';
    changes.$set[jpath] = newSwitchableType;
    return changes;
}
export function objectGetSelectedSwitchable(objectInput: EditorObjectInput, _value: any, _changes: ChangesModel): string {
    try {
        let changes = cloneHelper(_changes);
        let value = cloneHelper(_value);
        value = value || {};
        changes = changes || ChangesModelDefaultValue;
        const jpath = objectInput.path + '._t';
        return changes.$set[jpath] ?? jsonPath(value, jpath)[0] ?? '';
    } catch {
        return '';
    }
}
