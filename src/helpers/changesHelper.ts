import { EditorInput, EditorArrayInput, EditorPrimitiveInput } from './../models';
import { ChangesModel, ChangesModelDefaultValue } from '../models';
import { cloneHelper, jsonPath } from './utilsHelper';
import { arrayPath } from './arrayHelpers';

export function changesSetValue(newVal: any, _changes: ChangesModel, path: string, editorInput?: EditorInput): ChangesModel {
    let changes: ChangesModel = cloneHelper(_changes || ChangesModelDefaultValue);
    changes.$set = changes.$set || {};

    if (newVal !== null && editorInput && editorInput.editorType === 'EditorPrimitiveInput') {
        switch ((editorInput as EditorPrimitiveInput).type) {
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

export function changesUnsetPathValue(_changes: ChangesModel, _editorInput: EditorInput): ChangesModel {
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

export type pathValue = {
    pathValue: any;
    isUnset: boolean;
};

export function changesGetPathValue(_changes: ChangesModel, _value: any, _editorInput: EditorInput): pathValue {
    const editorInput = cloneHelper(_editorInput || {});
    if (editorInput.editorType === 'EditorArrayInput') {
        editorInput.path = arrayPath(editorInput as EditorArrayInput);
    }
    return changesGetPathValueByPath(_changes, _value, editorInput.path, editorInput.default);
}

export function changesGetPathValueByPath(_changes: ChangesModel, _value: any, path: string, defaultValue: any = undefined): pathValue {
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

    const pathValue = changes.$set[path] ?? jsonPath(value, '$.' + path);
    // object dont have props or array dont have new items
    let isUnset = Object.keys(changes.$set).filter(key => key.startsWith(path)).length <= 0;
    // value is empty or unset in changes
    isUnset &&= pathValue === undefined || pathValue === null || Object.keys(changes.$unset).filter(x => x === path).length > 0;
    return { pathValue: pathValue ?? defaultValue ?? '', isUnset };
}

export function changesIsUnset(_changes: ChangesModel, _value: any, _editorInput: EditorInput): boolean {
    return changesGetPathValue(_changes, _value, _editorInput).isUnset;
}

export type bulkEntry = { updateOne: { filter: any; update: any } };

function getPrepreBulkForArrayAndObjects(changes: ChangesModel, filter: any): bulkEntry[] {
    let bulkWrite: bulkEntry[] = [];
    const keys = Object.keys(changes.$set || {});
    if (keys.length <= 0) {
        return bulkWrite;
    }
    // make sure created array insted of object
    const arrayRegex = new RegExp('\\.\\d+', 'g');
    const keysWithArrays = Object.keys(changes.$set).filter(key => arrayRegex.test(key));
    for (const key of keysWithArrays) {
        let path = '';
        const arrayPaths = key.split('.');
        for (const subPath of arrayPaths) {
            if (Number.isInteger(+subPath)) {
                const update = { updateOne: { filter: { ...filter, [path]: { $exists: false } }, update: { $set: { [path]: [] } } } };
                if (!bulkWrite.find(x => JSON.stringify(x) === JSON.stringify(update))) {
                    bulkWrite.push(update);
                }
            }
            path += !path ? subPath : `.${subPath}`;
        }
    }

    // create objects if new
    const objectRegex = new RegExp('.([^.0-9][^.]*)', 'g');
    const keysWithObjects = Object.keys(changes.$set).filter(key => objectRegex.test(key));
    for (const key of keysWithObjects) {
        let path = '';
        const objectPaths = key.split('.');
        for (const subPath of objectPaths) {
            if (!Number.isInteger(+subPath) && path.includes('.') && path !== key) {
                const update = { updateOne: { filter: { ...filter, [path]: { $exists: false } }, update: { $set: { [path]: {} } } } };
                if (!bulkWrite.find(x => JSON.stringify(x) === JSON.stringify(update))) {
                    bulkWrite.push(update);
                }
            }
            path += !path ? subPath : `.${subPath}`;
        }
    }

    // clean duplicate
    const distinctBulkWrite: bulkEntry[] = [];
    for (const update of bulkWrite) {
        if (distinctBulkWrite.find(x => JSON.stringify(x) === JSON.stringify(update))) {
            continue;
        }
        distinctBulkWrite.push(update);
    }
    return distinctBulkWrite;
}

function splitBulk(changes: ChangesModel, filter: any, opartion: '$set' | '$unset' | '$pull' | '$push'): bulkEntry[] {
    const bulkWrite: bulkEntry[] = [];
    const keys = Object.keys(changes[opartion] || {});
    if (keys.length <= 0) {
        return bulkWrite;
    }
    const chunk = 5;
    const splitLen = Math.ceil((keys.length * 1.0) / chunk);
    for (let i = 0; i < splitLen; i++) {
        let data = {};
        for (const key of paginate(keys, chunk, i)) {
            data[key] = changes[opartion][key];
        }
        bulkWrite.push({ updateOne: { filter, update: { [opartion]: data } } });
    }
    return bulkWrite;
}

function paginate(array: any[], page_size: number, page_index: number): any[] {
    // human-readable page numbers usually start with 1, so we reduce 1 in the first argument
    return array.slice(page_index * page_size, (page_index + 1) * page_size);
}

export function getBulkWrite(_changes: ChangesModel, filter: any): bulkEntry[] {
    let bulkWrite: bulkEntry[] = [];
    const changes = cloneHelper(_changes);
    filter = filter || {};
    bulkWrite.push(...getPrepreBulkForArrayAndObjects(changes, filter));
    bulkWrite.push(...splitBulk(changes, filter, '$set'));
    bulkWrite.push(...splitBulk(changes, filter, '$unset'));
    bulkWrite.push(...splitBulk(changes, filter, '$pull'));
    bulkWrite.push(...splitBulk(changes, filter, '$push'));
    return bulkWrite;
}
