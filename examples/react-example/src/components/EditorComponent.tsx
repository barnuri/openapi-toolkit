import { Editor } from 'openapi-definition-to-editor';
import * as React from 'react';
import EditorInputComponent from './EditorInputComponent';
import EditorProps from './EditorProps';

const EditorComponent = ({ editor, value, changes, setChanges }: EditorProps & { editor: Editor }) => {
    const inputs = editor.inputs || [];
    return (
        <div>
            <h1>{editor.name}</h1>
            <div style={{ paddingLeft: '20px' }}>
                {inputs.map((editorInput, i) => (
                    <EditorInputComponent key={editorInput.path + i} value={value} changes={changes} setChanges={setChanges} editorInput={editorInput} />
                ))}
            </div>
        </div>
    );
};

export default EditorComponent;
