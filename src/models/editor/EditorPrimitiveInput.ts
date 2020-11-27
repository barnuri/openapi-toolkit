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
}
