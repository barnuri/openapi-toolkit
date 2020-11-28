import { Editor } from 'openapi-definition-to-editor';
import * as React from 'react';
import EditorInputComponent from './EditorInputComponent';

const EditorComponent = ({ editor, value }: { value: any; editor: Editor }) => {
    const inputs = editor.inputs || [];
    const [changes, setChanges] = React.useState({} as any);
    console.log(changes);
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
