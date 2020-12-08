import { ChangesModelDefaultValue } from './../models/editor/ChangesModel';
import { EditorPrimitiveInput, ChangesModel } from '../models';
import { JSONPath } from 'jsonpath-plus';

export function primitiveGetValue(changes: ChangesModel, value: any, primitiveInput: EditorPrimitiveInput) {
    try {
        value = value || {};
        changes = changes || ChangesModelDefaultValue;
        return changes.$set[primitiveInput.path] ?? JSONPath({ json: value, path: '$.' + primitiveInput.path })[0] ?? '';
    } catch {
        return undefined;
    }
}

export function primitiveSetValue(newVal: any, changes: ChangesModel, primitiveInput: EditorPrimitiveInput): ChangesModel {
    changes = changes || ChangesModelDefaultValue;
    let changesModified: ChangesModel = JSON.parse(JSON.stringify(changes));
    changesModified = changesSetValue(newVal, changesModified, primitiveInput.path);
    return changesModified;
}

export function changesSetValue(newVal: any, changes: ChangesModel, path: string): ChangesModel {
    changes = changes || ChangesModelDefaultValue;
    let changesModified: ChangesModel = JSON.parse(JSON.stringify(changes));
    changesModified = {
        $set: { ...changesModified.$set, [path]: newVal },
        $unset: changesModified.$unset,
        newArrayItemsCount: { ...changesModified.newArrayItemsCount },
    };
    return changesModified;
}
