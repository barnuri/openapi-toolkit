import { EditorArrayInput } from '../models';

export default (arrayInput: EditorArrayInput) => arrayInput.path.replace('[i]', ``);
