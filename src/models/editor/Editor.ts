import { EditorInput } from './EditorInput';

export class Editor {
    inputs: EditorInput[];
    name: string;
    toHtml() {
        return `<h1>${this.name}</h1><div style='padding-left:20px'>${(this.inputs || []).map(x => x.toHtml()).join('')}</div>`;
    }
}
