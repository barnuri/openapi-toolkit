import { Editor } from 'openapi-definition-to-editor';
import * as React from 'react';
import EditorComponent from './EditorComponent';

const EditorsComponent = ({ editors, value }: { value: any; editors: Editor[] }) => {
    const [changes, setChanges] = React.useState({ $set: {}, $unset: {} } as any);
    return (
        <div>
            {(editors || []).map((editor, i) => (
                <EditorComponent key={editor.name + i} editor={editor} value={value} changes={changes} setChanges={setChanges} />
            ))}
        </div>
    );
};

export default EditorsComponent;
