import { EditorInput } from './EditorInput';

export class EditorObjectInput extends EditorInput {
    properties: EditorInput[];
    switchable: boolean;
    switchableOptions?: string[];
    switchableObjects?: EditorInput[];
}
