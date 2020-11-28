import { EditorInput } from '../models';

export function getEditorInputName(editor: EditorInput) {
    return (editor.path || '').split('.').splice(-1)[0];
}
