import { ChangesModelDefaultValue } from './../models/editor/ChangesModel';
import { EditorArrayInput, ChangesModel } from '../models';
import { cloneHelper } from './utilsHelper';
import { jsonPath } from './utilsHelper';
import { modifyInputPath } from './editorHelpers';
import { changesGetPathValueByPath } from './changesHelper';

export function arrayChildModifyIndex(index: number, arrayInput: EditorArrayInput) {
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

export function arrayDeleteItem(index: number, _changes: ChangesModel, _value: any, _arrayInput: EditorArrayInput) {
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
        for (let minNewIndexToModify = index + 1; minNewIndexToModify < originalItemsCount; minNewIndexToModify++) {
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

export function arrayItemsCount(_arrayInput: EditorArrayInput, _value: any, _changes: ChangesModel) {
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
        ...Object.keys(changes.$set)
            .map(key => +(regex.exec(key) || [])[1])
            .filter(x => !Number.isNaN(x)),
    ];
    const maxNewIndex = Math.max(...newIndexes);
    const newIndexesNumber = maxNewIndex > originalItemsCount - 1 ? maxNewIndex - (originalItemsCount - 1) : 0;
    return originalItemsCount + newIndexesNumber;
}

export function arrayKeyPrefix(i: number, arrayInput: EditorArrayInput) {
    return arrayInput.itemInput.path.replace('[i]', `.${i}`);
}

export function arrayOriginalItemsCount(arrayInput: EditorArrayInput, value: any) {
    return ((jsonPath(value, '$.' + arrayPath(arrayInput))[0] as any[]) || []).length;
}

export function arrayPath(arrayInput: EditorArrayInput) {
    return arrayInput.path.replace('[i]', ``);
}

export function arrayAddItem(_arrayInput: EditorArrayInput, _changes: ChangesModel, _value: any) {
    const arrayInput = cloneHelper(_arrayInput || {});
    const value = cloneHelper(_value || {});
    let changes: ChangesModel = cloneHelper(_changes || ChangesModelDefaultValue);
    changes = changes || ChangesModelDefaultValue;
    changes.newArrayItemsCount = changes.newArrayItemsCount || {};
    changes.newArrayItemsCount[arrayPath(arrayInput)] = arrayItemsCount(arrayInput, value, changes) + 1;
    return changes;
}

export function arrayGetIndexes(arrayInput: EditorArrayInput, changes: ChangesModel, value: any) {
    const count = arrayItemsCount(arrayInput, value, changes);
    return Array.from({ length: count }, (x, i) => i);
}
