import { EditorPrimitiveInput } from '../models';
import ChangesModel from '../models/editor/ChangesModel';
import * as jp from 'jsonpath';

export default (changes: ChangesModel, value: any, primitiveInput: EditorPrimitiveInput) => {
    try {
        value = value || {};
        changes = changes || { $set: {}, $unset: {} };
        return changes.$set[primitiveInput.path] ?? jp.query(value, '$.' + primitiveInput.path)[0] ?? '';
    } catch {
        return undefined;
    }
};
