import { EditorObjectInput, ChangesModel } from '../models';
import * as jp from 'jsonpath';

export function objectSetSelectedSwitchable(objectInput: EditorObjectInput, changes: ChangesModel, newSwitchableType: string) {
    changes = changes || { $set: {}, $unset: {} };
    const jpath = objectInput.path + '_t';
    changes.$set[jpath] = newSwitchableType;
    return changes;
}
export function objectGetSelectedSwitchable(objectInput: EditorObjectInput, value: any, changes: ChangesModel): string {
    try {
        value = value || {};
        changes = changes || { $set: {}, $unset: {} };
        const jpath = objectInput.path + '_t';
        let pathValue = changes.$set[jpath];
        if (pathValue !== undefined) {
            return pathValue;
        }
        pathValue = jp.query(value, jpath)[0];
        if (pathValue !== undefined) {
            return pathValue;
        }
        return '';
    } catch {
        return '';
    }
}
