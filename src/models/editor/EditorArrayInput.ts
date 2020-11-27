import { EditorInput } from './EditorInput';

export class EditorArrayInput extends EditorInput {
    itemInput: EditorInput;
    maxItems?: number;
    minItems?: number;
    toHtml() {
        return `<b>${this.getName()}</b>:  array of <div style='padding-left:20px'>${this.itemInput.toHtml()}</div>`;
    }
}
