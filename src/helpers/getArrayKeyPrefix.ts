import { EditorArrayInput } from '../models';

export default (i: number, arrayInput: EditorArrayInput) => arrayInput.itemInput.path.replace('[i]', `.${i}`);
