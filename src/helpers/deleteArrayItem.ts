import { EditorArrayInput } from './../models/editor/EditorArrayInput';
import ChangesModel from '../models/editor/ChangesModel';
import getArrayKeyPrefix from './getArrayKeyPrefix';
import getArrayOriginalItemsCount from './getArrayOriginalItemsCount';

export default (index: number, changes: ChangesModel, value: any, arrayInput: EditorArrayInput) => {
    value = value || {};
    changes = changes || { $set: {}, $unset: {} };

    let changesModified = JSON.parse(JSON.stringify(changes));
    const originalItemsCount = getArrayOriginalItemsCount(arrayInput, value);

    // cleanup
    Object.keys(changesModified.$set)
        .filter(key => key.includes(getArrayKeyPrefix(index, arrayInput)))
        .forEach(key => delete changesModified.$set[key]);

    // new item, reorganized indexes
    if (index > originalItemsCount - 1) {
        for (let minNewIndexToModify = index + 1; minNewIndexToModify < originalItemsCount; minNewIndexToModify++) {
            const oldKey = getArrayKeyPrefix(minNewIndexToModify, arrayInput);
            const newKey = getArrayKeyPrefix(minNewIndexToModify - 1, arrayInput);
            Object.keys(changesModified.$set)
                .filter(key => key.includes(oldKey))
                .forEach(key => {
                    changesModified.$set[key.replace(oldKey, newKey)] = changesModified.$set[key];
                    delete changesModified.$set[key];
                });
        }
    }
    // existing item
    else {
        changesModified.$unset = { ...changesModified.$unset, [getArrayKeyPrefix(index, arrayInput)]: '' };
    }

    return changesModified;
};
