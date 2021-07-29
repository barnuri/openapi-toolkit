import { Editor } from 'openapi-tools';
import * as React from 'react';
import EditorInputComponent from './EditorInputComponent';
import EditorProps from './EditorProps';

const EditorComponent: React.FC<EditorProps & { editor: Editor }> = ({ editor, value, changes, setChanges }) => {
    return (
        <div>
            <h1>{editor.name}</h1>
            <div style={{ paddingLeft: '20px' }}>
                {(editor.inputs || []).map((editorInput, i) => (
                    <EditorInputComponent key={editorInput.path + i} value={value} changes={changes} setChanges={setChanges} editorInput={editorInput} />
                ))}
            </div>
        </div>
    );
};

export default EditorComponent;
