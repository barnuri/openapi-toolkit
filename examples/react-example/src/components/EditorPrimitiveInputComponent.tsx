import { EditorPrimitiveInput, getEditorInputName, primitiveGetValue, primitiveSetValue } from 'openapi-definition-to-editor';
import * as React from 'react';
import EditorProps from './EditorProps';

const EditorPrimitiveInputComponent = ({
    primitiveInput,
    changes,
    setChanges,
    value,
}: EditorProps & {
    primitiveInput: EditorPrimitiveInput;
}) => {
    const onChange = (newVal: any) => setChanges(primitiveSetValue(newVal, changes, primitiveInput));
    const pathValue = primitiveGetValue(changes, value, primitiveInput);
    const requiredDot = primitiveInput.required ? <span style={{ color: 'red' }}>*</span> : <span />;
    let input = <div />;
    if (primitiveInput.type === 'enum') {
        const options: any[] = primitiveInput.enumsOptions || [];
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
            <b>{primitiveInput.name}:</b> {requiredDot} {input}
        </div>
    );
};
export default EditorPrimitiveInputComponent;
