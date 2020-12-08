import { EditorPrimitiveInput, ChangesModel } from '../models';
import { JSONPath } from 'jsonpath-plus';

export function primitiveGetValue(changes: ChangesModel, value: any, primitiveInput: EditorPrimitiveInput) {
    try {
        value = value || {};
        changes = changes || { $set: {}, $unset: {} };
        return changes.$set[primitiveInput.path] ?? JSONPath({ json: value, path: '$.' + primitiveInput.path })[0] ?? '';
    } catch {
        return undefined;
    }
}

export function primitiveSetValue(newVal: any, changes: ChangesModel, primitiveInput: EditorPrimitiveInput): ChangesModel {
    changes = changes || { $set: {}, $unset: {} };
    let changesModified: ChangesModel = JSON.parse(JSON.stringify(changes));
    changesModified = { $set: { ...changesModified.$set, [primitiveInput.path]: newVal }, $unset: changesModified.$unset };
    return changesModified;
}
