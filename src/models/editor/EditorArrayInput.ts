import { EditorInput } from './EditorInput';
export class EditorArrayInput extends EditorInput {
    itemInput: EditorInput;
    maxItems?: number;
    minItems?: number;
}
