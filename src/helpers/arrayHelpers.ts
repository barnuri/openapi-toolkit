import { ChangesModelDefaultValue } from './../models/editor/ChangesModel';
import { EditorArrayInput, EditorObjectInput, EditorInput, ChangesModel } from '../models';
import { JSONPath } from 'jsonpath-plus';

export function arrayChildModifyIndex(index: number, arrayInput: EditorArrayInput) {
    return modifyIndexChild(index, arrayInput.itemInput);
}

function modifyIndexChild(i: number, editor: EditorInput): EditorInput {
    let input = JSON.parse(JSON.stringify(editor));
    input.name = input.name.replace('[i]', `.${i}`);
    input.path = input.path.replace('[i]', `.${i}`);
    if (input.editorType === 'EditorObjectInput') {
        const objInput = input as EditorObjectInput;
        objInput.properties = objInput.properties || [];
        for (let j = 0; j < objInput.properties.length; j++) {
            objInput.properties[j] = modifyIndexChild(i, objInput.properties[j]);
        }
        objInput.switchableObjects = objInput.switchableObjects || [];
        for (let j = 0; j < objInput.switchableObjects.length; j++) {
            objInput.switchableObjects[j] = modifyIndexChild(i, objInput.switchableObjects[j]);
        }
        input = objInput;
    } else if (input.editorType === 'EditorArrayInput') {
        const arrInput = input as EditorArrayInput;
        arrInput.itemInput = modifyIndexChild(i, arrInput.itemInput);
        input = arrInput;
    }
    return JSON.parse(JSON.stringify(input));
}

export function arrayIsItemDeleted(arrayInput: EditorArrayInput, value: any, changes: ChangesModel, index: number): boolean {
    value = value || {};
    changes = changes || ChangesModelDefaultValue;
    const originalItemsCount = arrayOriginalItemsCount(arrayInput, value);
    // new item
    if (index >= originalItemsCount) {
        return false;
    }
    // existing item
    return changes.$unset[arrayKeyPrefix(index, arrayInput)] === '';
}

export function arrayDeleteItem(index: number, changes: ChangesModel, value: any, arrayInput: EditorArrayInput) {
    value = value || {};
    changes = changes || ChangesModelDefaultValue;

    let changesModified: ChangesModel = JSON.parse(JSON.stringify(changes));
    const originalItemsCount = arrayOriginalItemsCount(arrayInput, value);

    let count = changesModified.newArrayItemsCount[arrayPath(arrayInput)] || arrayItemsCount(arrayInput, value, changesModified);
    // cleanup
    Object.keys(changesModified.$set)
        .filter(key => key.includes(arrayKeyPrefix(index, arrayInput)))
        .forEach(key => delete changesModified.$set[key]);
    // new item, reorganized indexes
    if (index > originalItemsCount - 1) {
        for (let minNewIndexToModify = index + 1; minNewIndexToModify < originalItemsCount; minNewIndexToModify++) {
            const oldKey = arrayKeyPrefix(minNewIndexToModify, arrayInput);
            const newKey = arrayKeyPrefix(minNewIndexToModify - 1, arrayInput);
            Object.keys(changesModified.$set)
                .filter(key => key.includes(oldKey))
                .forEach(key => {
                    changesModified.$set[key.replace(oldKey, newKey)] = changesModified.$set[key];
                    delete changesModified.$set[key];
                });
        }
        changesModified.newArrayItemsCount[arrayPath(arrayInput)] = count - 1;
    }
    // existing item
    else {
        changesModified.$unset = { ...changesModified.$unset, [arrayKeyPrefix(index, arrayInput)]: '' };
    }

    return changesModified;
}

export function arrayItemsCount(arrayInput: EditorArrayInput, value: any, changes: ChangesModel) {
    let count = changes.newArrayItemsCount[arrayPath(arrayInput)];
    if (!count) {
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
    try {
        return (JSONPath({ json: value, path: '$.' + arrayPath(arrayInput) })[0] as any[]).length;
    } catch {
        return 0;
    }
}

export function arrayPath(arrayInput: EditorArrayInput) {
    return arrayInput.path.replace('[i]', ``);
}

export function arrayAddItem(arrayInput: EditorArrayInput, changes: ChangesModel, value: any) {
    value = value || {};
    changes = changes || ChangesModelDefaultValue;
    changes.newArrayItemsCount[arrayPath(arrayInput)] = arrayItemsCount(arrayInput, value, changes) + 1;
    return changes;
}

export function arrayGetIndexes(arrayInput: EditorArrayInput, changes: ChangesModel, value: any) {
    const count = arrayItemsCount(arrayInput, value, changes);
    return Array.from({ length: count }, (x, i) => i);
}
