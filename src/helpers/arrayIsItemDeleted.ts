import { EditorArrayInput } from '../models';
import ChangesModel from '../models/editor/ChangesModel';
import getArrayKeyPrefix from './getArrayKeyPrefix';
import getArrayOriginalItemsCount from './getArrayOriginalItemsCount';

export default (arrayInput: EditorArrayInput, value: any, changes: ChangesModel, index: number) => {
    value = value || {};
    changes = changes || { $set: {}, $unset: {} };
    const originalItemsCount = getArrayOriginalItemsCount(arrayInput, value);
    // new item
    if (index >= originalItemsCount) {
        return false;
    }
    // existing item
    return changes.$unset[getArrayKeyPrefix(index, arrayInput)] === '';
};
