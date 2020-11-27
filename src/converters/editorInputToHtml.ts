import { Editor, EditorArrayInput, EditorInput, EditorObjectInput, EditorPrimitiveInput } from '../models';

export function editorInputToHtml(input: EditorInput | Editor | Editor[]) {
    // Editors[]
    if (Array.isArray(input)) {
        const editors = input as Editor[];
        return editors.map(x => editorInputToHtml(x)).join('');
    }
    if (input instanceof Editor) {
        const editor = input as Editor;
        return `<h1>${editor.name}</h1><div style='padding-left:20px'>${(editor.inputs || []).map(x => editorInputToHtml(x)).join('')}</div>`;
    }

    if (input instanceof EditorArrayInput) {
        const arrayInput = input as EditorArrayInput;
        return `<b>${arrayInput.getName()}</b>:  array of <div style='padding-left:20px'>${editorInputToHtml(arrayInput.itemInput)}</div>`;
    }

    if (input instanceof EditorPrimitiveInput) {
        const primitiveInput = input as EditorPrimitiveInput;
        const requiredDot = primitiveInput.required ? `<span style="color:red">*</span>` : '';
        let html = '';
        if (primitiveInput.type == 'enum') {
            const options: any[] = primitiveInput.enumNames || primitiveInput.enumValues || [];
            html = `<select >` + options.map(o => `<option>${o}</option>`).join('') + '</select>';
        } else if (primitiveInput.type == 'boolean') {
            html = `<input type='checkbox' />`;
        } else if (primitiveInput.type == 'string') {
            html = `<input />`;
        } else {
            html = `<input type='${primitiveInput.type}' />`;
        }
        html = `<div><b>${primitiveInput.getName()}:<b> ${requiredDot} ${html}</div>`;
        return html;
    }

    if (input instanceof EditorObjectInput) {
        const objectInput = input as EditorObjectInput;
        objectInput.properties = objectInput.properties || [];
        const propsHtml = objectInput.properties.map(x => editorInputToHtml(x)).join('');
        if (objectInput.switchable) {
            const commonProps = `<div style='padding-left:20px'> <b><u>common:</u></b>` + propsHtml + '</div>';
            objectInput.switchableOptions = objectInput.switchableOptions || [];
            objectInput.switchableObjects = objectInput.switchableObjects || [];
            return (
                `<b>${objectInput.getName()}</b>:  ` +
                `<b><u>switchable:</u></b> ${objectInput.switchableOptions.join(',')}` +
                commonProps +
                objectInput.switchableObjects
                    .map((x, i) => `<div style='padding-left:20px'><b><u>${objectInput.switchableOptions![i]}</u></b> props: ${editorInputToHtml(x)} </div>`)
                    .join('')
            );
        }
        return `<b>${objectInput.getName()}</b>: <div style='padding-left:20px'>${propsHtml}</div>`;
    }

    throw new Error('bad type');
}
