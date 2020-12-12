import { getEditorInputName } from '../helpers/getEditorInputName';
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

    if (input.editorType == 'EditorArrayInput') {
        const arrayInput = input as EditorArrayInput;
        return `<b>${arrayInput.name}</b>:  array of <div style='padding-left:20px'>${arrayInput.name}</div>`;
    }

    if (input.editorType == 'EditorPrimitiveInput') {
        const primitiveInput = input as EditorPrimitiveInput;
        const requiredDot = primitiveInput.required ? `<span style="color:red">*</span>` : '';
        let html = '';
        if (primitiveInput.type == 'enum') {
            const options: any[] = primitiveInput.enumNames.length > 0 ? primitiveInput.enumNames : primitiveInput.enumValues;
            html = `<select >` + options.map(o => `<option>${o}</option>`).join('') + '</select>';
        } else if (primitiveInput.type == 'boolean') {
            html = `<input type='checkbox' />`;
        } else if (primitiveInput.type == 'string') {
            html = `<input />`;
        } else {
            html = `<input type='${primitiveInput.type}' />`;
        }
        html = `<div><b>${primitiveInput.name}:<b> ${requiredDot} ${html}</div>`;
        return html;
    }

    if (input.editorType == 'EditorObjectInput') {
        const objectInput = input as EditorObjectInput;
        objectInput.properties = objectInput.properties || [];
        const propsHtml = objectInput.properties.map(x => editorInputToHtml(x)).join('');
        if (objectInput.switchable) {
            const commonProps = `<div style='padding-left:20px'> <b><u>common:</u></b>` + propsHtml + '</div>';
            return (
                `<b>${getEditorInputName(objectInput)}</b>:  ` +
                `<b><u>switchable:</u></b> ${objectInput.switchableOptions.join(',')}` +
                commonProps +
                objectInput.switchableObjects
                    .map((x, i) => `<div style='padding-left:20px'><b><u>${objectInput.switchableOptions![i]}</u></b> props: ${editorInputToHtml(x)} </div>`)
                    .join('')
            );
        }
        if (objectInput.isDictionary) {
            return `<b>${objectInput.name}</b> Dictionary: <div>key: <input type='text' />${editorInputToHtml(objectInput.dictionaryInput!)}</div>`;
        }
        return `<b>${objectInput.name}</b>: <div style='padding-left:20px'>${propsHtml}</div>`;
    }

    throw new Error('bad type');
}
