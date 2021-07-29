import { ChangesModelDefaultValue } from './../models/editor/ChangesModel';
import { EditorArrayInput, ChangesModel, EditorInput } from '../models';
import { cloneHelper } from './utilsHelper';
import { jsonPath } from './utilsHelper';
import { modifyInputPath } from './editorHelpers';
import { changesGetPathValueByPath } from './changesHelper';

export const ORDER_PROP = '_order';

export function arrayChildModifyIndex(index: number, arrayInput: EditorArrayInput): EditorInput {
    return modifyInputPath(arrayInput.itemInput, arrayInput.itemInput.path, arrayInput.itemInput.path.replace('[i]', `.${index}`));
}

export function arrayIsItemDeleted(_arrayInput: EditorArrayInput, _value: any, _changes: ChangesModel, index: number): boolean {
    const arrayInput = cloneHelper(_arrayInput || {});
    const value = cloneHelper(_value || {});
    let changes: ChangesModel = cloneHelper(_changes || ChangesModelDefaultValue);
    const originalItemsCount = arrayOriginalItemsCount(arrayInput, value);
    // new item
    if (index >= originalItemsCount) {
        return false;
    }
    // is unset
    return changesGetPathValueByPath(changes, value, arrayKeyPrefix(index, arrayInput), '').isUnset;
}

export function arrayDeleteItem(index: number, _changes: ChangesModel, _value: any, _arrayInput: EditorArrayInput): ChangesModel {
    const arrayInput = cloneHelper(_arrayInput || {});
    const value = cloneHelper(_value || {});
    let changes: ChangesModel = cloneHelper(_changes || ChangesModelDefaultValue);
    const originalItemsCount = arrayOriginalItemsCount(arrayInput, value);

    let count = changes.newArrayItemsCount[arrayPath(arrayInput)] || arrayItemsCount(arrayInput, value, changes);
    // cleanup
    Object.keys(changes.$set)
        .filter(key => key.startsWith(arrayKeyPrefix(index, arrayInput)))
        .forEach(key => delete changes.$set[key]);
    // new item, reorganized indexes
    if (index > originalItemsCount - 1) {
        for (let minNewIndexToModify = index + 1; minNewIndexToModify < count; minNewIndexToModify++) {
            const oldKey = arrayKeyPrefix(minNewIndexToModify, arrayInput);
            const newKey = arrayKeyPrefix(minNewIndexToModify - 1, arrayInput);
            Object.keys(changes.$set)
                .filter(key => key.startsWith(oldKey))
                .forEach(key => {
                    changes.$set[key.replace(oldKey, newKey)] = changes.$set[key];
                    delete changes.$set[key];
                });
        }
        changes.newArrayItemsCount = changes.newArrayItemsCount || {};
        changes.newArrayItemsCount[arrayPath(arrayInput)] = count - 1;
    }
    // existing item
    else {
        changes.$unset = { ...changes.$unset, [arrayKeyPrefix(index, arrayInput)]: '' };
        changes.$pull = { ...changes.$pull, [arrayPath(arrayInput)]: null };
    }

    return changes;
}

export function arrayItemsCount(_arrayInput: EditorArrayInput, _value: any, _changes: ChangesModel): number {
    if (!_arrayInput) {
        return 0;
    }
    let changes = cloneHelper(_changes || ChangesModelDefaultValue);
    const arrayInput = cloneHelper(_arrayInput || {});
    let value = cloneHelper(_value || {});

    changes.newArrayItemsCount = changes.newArrayItemsCount || {};
    let count = changes.newArrayItemsCount[arrayPath(arrayInput)];
    if (count !== undefined) {
        return count;
    }
    value = value || {};
    changes = changes || ChangesModelDefaultValue;

    const originalItemsCount = arrayOriginalItemsCount(arrayInput, value);
    const regex = new RegExp(arrayPath(arrayInput) + '\\.(\\d+).*');
    const newIndexes = [
        -1,
        ...Object.keys(changes.$set || [])
            .map(key => +(regex.exec(key) || [])[1])
            .filter(x => !Number.isNaN(x)),
    ];
    const maxNewIndex = newIndexes.sort((a, b) => b - a)[0];
    const newIndexesNumber = maxNewIndex > originalItemsCount - 1 ? maxNewIndex - (originalItemsCount - 1) : 0;
    return originalItemsCount + newIndexesNumber;
}

export function arrayKeyPrefix(i: number, arrayInput: EditorArrayInput): string {
    return arrayInput.itemInput.path.replace('[i]', `.${i}`);
}

export function arrayOriginalItemsCount(arrayInput: EditorArrayInput, value: any): number {
    return ((jsonPath(value, '$.' + arrayPath(arrayInput)) as any[]) || []).length;
}

export function arrayPath(arrayInput: EditorArrayInput): string {
    return arrayInput.path.replace('[i]', ``);
}

export function arrayAddItem(_arrayInput: EditorArrayInput, _changes: ChangesModel, _value: any): ChangesModel {
    const arrayInput = cloneHelper(_arrayInput || {});
    const value = cloneHelper(_value || {});
    let changes: ChangesModel = cloneHelper(_changes || ChangesModelDefaultValue);
    changes = changes || ChangesModelDefaultValue;
    changes.newArrayItemsCount = changes.newArrayItemsCount || {};
    changes.newArrayItemsCount[arrayPath(arrayInput)] = arrayItemsCount(arrayInput, value, changes) + 1;
    return changes;
}

export function arrayGetIndexes(arrayInput: EditorArrayInput, changes: ChangesModel, value: any): number[] {
    const count = arrayItemsCount(arrayInput, value, changes);
    return Array.from({ length: count }, (x, i) => i).sort(
        (i1, i2) => arrayItemOrderInArray(arrayInput, changes, value, i1) - arrayItemOrderInArray(arrayInput, changes, value, i2),
    );
}

export function arrayItemOrderPath(arrayInput: EditorArrayInput, index: number): string {
    return arrayKeyPrefix(index, arrayInput) + `.${ORDER_PROP}`;
}

export function arrayItemOrderInArray(arrayInput: EditorArrayInput, _changes: ChangesModel, _value: any, index: number): number {
    let changes = cloneHelper(_changes || ChangesModelDefaultValue);
    let value = cloneHelper(_value || {});
    value = value || {};
    changes = changes || ChangesModelDefaultValue;
    const jpath = arrayItemOrderPath(arrayInput, index);
    return changes.$set[jpath] ?? jsonPath(value, jpath) ?? index;
}

export function setArrayOrder(arrayInput: EditorArrayInput, _changes: ChangesModel, _value: any, index: number, order: number): ChangesModel {
    let changes = cloneHelper(_changes || ChangesModelDefaultValue);
    let value = cloneHelper(_value || {});
    value = value || {};
    changes = changes || ChangesModelDefaultValue;

    //fill order props for missing items
    for (const index of arrayGetIndexes(arrayInput, changes, value)) {
        const jpath = arrayItemOrderPath(arrayInput, index);
        const orderVal = changes.$set[jpath] ?? jsonPath(value, jpath);
        if (!orderVal && orderVal != 0) {
            changes.$set[jpath] = arrayItemOrderInArray(arrayInput, changes, value, index);
        }
    }

    changes.$push[arrayPath(arrayInput)] = { $each: [], $sort: { [ORDER_PROP]: 1 } };
    changes.$set[arrayItemOrderPath(arrayInput, index)] = order;

    return changes;
}
