import { ORDER_PROP } from '../../helpers';

export class ChangesModel {
    $set!: { [key: string]: any };
    $unset!: { [key: string]: '' };
    $pull!: { [key: string]: null };
    $push!: { [key: string]: { $each: []; $sort: { [ORDER_PROP]: 1 } } };
    newArrayItemsCount!: { [key: string]: number };
    dictNewKeys!: { [key: string]: string[] };
}

export const ChangesModelDefaultValue: ChangesModel = { $set: {}, $unset: {}, $pull: {}, $push: {}, newArrayItemsCount: {}, dictNewKeys: {} };
