import { EditorObjectInput } from '../models';
import ChangesModel from '../models/editor/ChangesModel';
import * as jp from 'jsonpath';

export default (objectInput: EditorObjectInput, value: any, changes: ChangesModel) => {
    value = value || {};
    changes = changes || { $set: {}, $unset: {} };
    const jpath = objectInput.path + '_t';
    return changes[jpath] ?? jp.query(value, jpath)[0] ?? '';
};
