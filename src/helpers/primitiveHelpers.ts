import { EditorPrimitiveInput, ChangesModel } from '../models';
import * as jp from 'jsonpath';

export function primitiveGetValue(changes: ChangesModel, value: any, primitiveInput: EditorPrimitiveInput) {
    try {
        value = value || {};
        changes = changes || { $set: {}, $unset: {} };
        return changes.$set[primitiveInput.path] ?? jp.query(value, '$.' + primitiveInput.path)[0] ?? '';
    } catch {
        return undefined;
    }
}

export function primitiveSetValue(newVal: any, changes: ChangesModel, primitiveInput: EditorPrimitiveInput) {
    changes = changes || { $set: {}, $unset: {} };
    let changesModified = JSON.parse(JSON.stringify(changes));
    changesModified = { $set: { ...changesModified.$set, [primitiveInput.path]: newVal }, $unset: changesModified.$unset };
    return changesModified;
}
