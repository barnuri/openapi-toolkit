import { EditorObjectInput } from '../models';
import ChangesModel from '../models/editor/ChangesModel';

export default (objectInput: EditorObjectInput, changes: ChangesModel, newSwitchableType: string) => {
    changes = changes || { $set: {}, $unset: {} };
    const jpath = objectInput.path + '_t';
    changes[jpath] = newSwitchableType;
};
