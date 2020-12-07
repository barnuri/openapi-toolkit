import { EditorPrimitiveInput } from '../models';
import ChangesModel from '../models/editor/ChangesModel';

export default (newVal: any, changes: ChangesModel, primitiveInput: EditorPrimitiveInput) => {
    changes = changes || { $set: {}, $unset: {} };
    let changesModified = JSON.parse(JSON.stringify(changes));
    changesModified = { $set: { ...changesModified.$set, [primitiveInput.path]: newVal }, $unset: changesModified.$unset };
    return changesModified;
};
