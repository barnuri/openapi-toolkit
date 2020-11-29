import { EditorPrimitiveInput, getEditorInputName } from 'openapi-definition-to-editor';
import * as React from 'react';
import EditorProps from './EditorProps';
import * as jp from 'jsonpath';

const EditorPrimitiveInputComponent = ({
    primitiveInput,
    changes,
    setChanges,
    value,
}: EditorProps & {
    primitiveInput: EditorPrimitiveInput;
}) => {
    const onChange = (newVal: any) => setChanges({ $set: { ...changes.$set, [primitiveInput.path]: newVal }, $unset: changes.$unset });
    const pathValue = changes.$set[primitiveInput.path] ?? jp.query(value, '$.' + primitiveInput.path) ?? '';
    const requiredDot = primitiveInput.required ? <span style={{ color: 'red' }}>*</span> : <span />;
    let input = <div />;
    if (primitiveInput.type === 'enum') {
        const options: any[] = primitiveInput.enumNames || primitiveInput.enumValues || [];
        input = (
            <select onChange={e => onChange(e.target.value)} value={pathValue}>
                {options.map(o => (
                    <option key={primitiveInput.path + o}>{o}</option>
                ))}
            </select>
        );
    } else if (primitiveInput.type === 'boolean') {
        input = <input onChange={e => onChange(e.target.checked)} checked={pathValue} type='checkbox' />;
    } else if (primitiveInput.type === 'string') {
        input = <input onChange={e => onChange(e.target.value)} value={pathValue} />;
    } else {
        input = <input onChange={e => onChange(e.target.value)} value={pathValue} type={primitiveInput.type} />;
    }
    return (
        <div>
            <b>{getEditorInputName(primitiveInput)}:</b> {requiredDot} {input}
        </div>
    );
};
export default EditorPrimitiveInputComponent;
