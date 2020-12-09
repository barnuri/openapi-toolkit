import { ChangesModel, ChangesModelDefaultValue, Editor } from 'openapi-definition-to-editor';
import * as React from 'react';
import EditorComponent from './EditorComponent';

const EditorsComponent: React.FC<{ value: any; editors: Editor[]; onChange?: (changes: ChangesModel) => void }> = ({ editors, value, onChange }) => {
    const [changes, setChanges] = React.useState(ChangesModelDefaultValue);
    return (
        <div>
            {(editors || []).map((editor, i) => (
                <EditorComponent
                    key={editor.name + i}
                    editor={editor}
                    value={value}
                    changes={changes}
                    setChanges={(newChanges: ChangesModel) => {
                        onChange = onChange || ((_: ChangesModel) => {});
                        onChange(newChanges);
                        setChanges(newChanges);
                    }}
                />
            ))}
        </div>
    );
};

export default EditorsComponent;
