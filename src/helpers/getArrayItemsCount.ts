import { EditorArrayInput } from '../models';
import getArrayOriginalItemsCount from './getArrayOriginalItemsCount';
import ChangesModel from '../models/editor/ChangesModel';
import getArrayPath from './getArrayPath';

export default (arrayInput: EditorArrayInput, value: any, changes: ChangesModel) => {
    value = value || {};
    changes = changes || { $set: {}, $unset: {} };

    const originalItemsCount = getArrayOriginalItemsCount(arrayInput, value);
    const regex = new RegExp(getArrayPath(arrayInput) + '\\.(\\d+).*');
    const newIndexes = [
        -1,
        ...Object.keys(changes.$set)
            .map(key => +(regex.exec(key) || [])[1])
            .filter(x => !Number.isNaN(x)),
    ];
    const maxNewIndex = Math.max(...newIndexes);
    const newIndexesNumber = maxNewIndex > originalItemsCount - 1 ? maxNewIndex - (originalItemsCount - 1) : 0;
    return originalItemsCount + newIndexesNumber;
};
