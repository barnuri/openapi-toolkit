export class ChangesModel {
    $set: { [key: string]: any };
    $unset: { [key: string]: '' };
    newArrayItemsCount: { [key: string]: number };
}

export const ChangesModelDefaultValue = { $set: {}, $unset: {}, newArrayItemsCount: {} };
