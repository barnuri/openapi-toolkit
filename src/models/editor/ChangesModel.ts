export class ChangesModel {
    $set!: { [key: string]: any };
    $unset!: { [key: string]: '' };
    $pull!: { [key: string]: null };
    newArrayItemsCount!: { [key: string]: number };
}

export const ChangesModelDefaultValue: ChangesModel = { $set: {}, $unset: {}, $pull: {}, newArrayItemsCount: {} };
