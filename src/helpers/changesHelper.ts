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

export function changesGetPathValue(_changes: ChangesModel, _value: any, _editorInput: EditorInput) {
    const editorInput = cloneHelper(_editorInput || {});
    return changesGetPathValueByPath(_changes, _value, editorInput.path, (editorInput as any).default);
}

export function changesGetPathValueByPath(
    _changes: ChangesModel,
    _value: any,
    path: string,
    defaultValue: any = undefined,
): { pathValue: any; isUnset: boolean } {
    let value = cloneHelper(_value || {});
    let changes: ChangesModel = cloneHelper(_changes || ChangesModelDefaultValue);
    value = value || {};
    changes = changes || ChangesModelDefaultValue;
    const res = { pathValue: changes.$set[path] ?? jsonPath(value, '$.' + path)[0] ?? defaultValue, isUnset: false };
    if (res.pathValue === undefined || Object.keys(changes.$unset).filter(x => x === path).length > 0) {
        return { pathValue: '', isUnset: true };
    }
    return res;
}

export function changesIsUnset(_changes: ChangesModel, _value: any, _editorInput: EditorInput) {
    return changesGetPathValue(_changes, _value, _editorInput).isUnset;
}

export type bulkEntry = { updateOne: { filter: any; update: any } };

export function getBulkWrite(_changes: ChangesModel, filter: any): bulkEntry[] {
    const bulkWrite: bulkEntry[] = [];
    const changes = cloneHelper(_changes);
    filter = filter || {};
    if (Object.keys(changes.$set || {}).length > 0) {
        const arrayRegex = new RegExp('\\.\\d+\\.', 'g');
        const keysWithArrays = Object.keys(changes.$set).filter(key => arrayRegex.test(key));
        for (const key of keysWithArrays) {
            let path = '';
            const arrayPaths = key.split('.');
            for (const subPath of arrayPaths) {
                if (Number.isInteger(+subPath)) {
                    bulkWrite.push({ updateOne: { filter: { ...filter, [path]: { $exists: false } }, update: { $set: { [path]: [] } } } });
                }
                path += !path ? subPath : `.${subPath}`;
            }
        }
        bulkWrite.push({ updateOne: { filter, update: { $set: changes.$set } } });
    }
    if (Object.keys(changes.$unset || {}).length > 0) {
        bulkWrite.push({ updateOne: { filter, update: { $unset: changes.$unset } } });
    }
    if (Object.keys(changes.$pull || {}).length > 0) {
        bulkWrite.push({ updateOne: { filter, update: { $pull: changes.$pull } } });
    }

    return bulkWrite;
}
