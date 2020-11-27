import { EditorInput } from './EditorInput';

export class EditorPrimitiveInput extends EditorInput {
    type: 'number' | 'date' | 'string' | 'enum' | 'boolean';
    enumNames?: string[] = [];
    enumValues?: number[] = [];
    description?: string;
    title?: string;
    maximum?: number;
    minimum?: number;
    maxLength?: number;
    minLength?: number;
    pattern?: string;
    toHtml() {
        const requiredDot = this.required ? `<span style="color:red">*</span>` : '';
        let html = '';
        if (this.type == 'enum') {
            const options: any[] = this.enumNames || this.enumValues || [];
            html = `<select >` + options.map(o => `<option>${o}</option>`).join('') + '</select>';
        } else if (this.type == 'boolean') {
            html = `<input type='checkbox' />`;
        } else if (this.type == 'string') {
            html = `<input />`;
        } else {
            html = `<input type='${this.type}' />`;
        }
        html = `<div><b>${this.getName()}:<b> ${requiredDot} ${html}</div>`;
        return html;
    }
}
