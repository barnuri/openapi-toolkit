import { EditorInput, EditorArrayInput } from './../models';
import { ChangesModel, ChangesModelDefaultValue } from '../models';
import { cloneHelper, jsonPath } from './utilsHelper';
import { arrayItemsCount, arrayPath } from './arrayHelpers';

export function changesSetValue(newVal: any, _changes: ChangesModel, path: string): ChangesModel {
    let changes: ChangesModel = cloneHelper(_changes || ChangesModelDefaultValue);
    changes.$set = changes.$set || {};
    changes.$set[path] = newVal;
    // cleanup
    delete changes.$unset[path];
    const subPathes = path.split('.');
    let pathToDel = '';
    for (const subPath of subPathes) {
        pathToDel += !pathToDel ? subPath : `.${subPath}`;
        delete changes.$unset[pathToDel];
    }
    delete changes.$pull[path];
    return changes;
}

export function changesUnsetPathValue(_changes: ChangesModel, _editorInput: EditorInput) {
    const editorInput = cloneHelper(_editorInput || {});
    let changes: ChangesModel = cloneHelper(_changes || ChangesModelDefaultValue);

    if (editorInput.editorType === 'EditorArrayInput') {
        editorInput.path = arrayPath(editorInput as EditorArrayInput);
    }

    // cleanup
    Object.keys(changes.$set)
        .filter(key => key.startsWith(editorInput.path))
        .forEach(key => delete changes.$set[key]);

    changes.$unset = { ...changes.$unset, [editorInput.path]: '' };
    if (editorInput.editorType === 'EditorArrayInput') {
        delete changes.newArrayItemsCount[arrayPath(editorInput as EditorArrayInput)];
    }
    return changes;
}

export function changesGetPathValue(_changes: ChangesModel, _value: any, _editorInput: EditorInput) {
    const editorInput = cloneHelper(_editorInput || {});
    if (editorInput.editorType === 'EditorArrayInput') {
        editorInput.path = arrayPath(editorInput as EditorArrayInput);
    }
    return changesGetPathValueByPath(_changes, _value, editorInput.path, editorInput.default);
}

export function changesGetPathValueByPath(_changes: ChangesModel, _value: any, path: string, defaultValue: any = undefined) {
    let value = cloneHelper(_value || {});
    let changes: ChangesModel = cloneHelper(_changes || ChangesModelDefaultValue);
    value = value || {};
    changes = changes || ChangesModelDefaultValue;

    const subPathes = path.split('.');
    let pathToCheck = '';
    let unsetFromChanges = false;
    for (const subPath of subPathes) {
        pathToCheck += !pathToCheck ? subPath : `.${subPath}`;
        unsetFromChanges ||= Object.keys(changes.$unset).filter(x => x === pathToCheck).length > 0;
    }
    if (unsetFromChanges) {
        return { pathValue: defaultValue ?? '', isUnset: true };
    }

    const pathValue = changes.$set[path] ?? jsonPath(value, '$.' + path)[0];
    // object dont have props or array dont have new items
    let isUnset = Object.keys(changes.$set).filter(key => key.startsWith(path)).length <= 0;
    // value is empty or unset in changes
    isUnset &&= pathValue === undefined || Object.keys(changes.$unset).filter(x => x === path).length > 0;
    return { pathValue: pathValue ?? defaultValue ?? '', isUnset };
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
