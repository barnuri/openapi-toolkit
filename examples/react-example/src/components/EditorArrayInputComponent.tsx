import { arrayAddItem, arrayChildModifyIndex, arrayDeleteItem, arrayGetIndexes, arrayIsItemDeleted, EditorArrayInput } from 'openapi-toolkit';
import * as React from 'react';
import EditorInputComponent from './EditorInputComponent';
import EditorProps from './EditorProps';

type CompType = React.FC<EditorProps & { arrayInput: EditorArrayInput }>;
const EditorArrayInputComponent: CompType = ({ arrayInput, changes, setChanges, value }) => {
    return (
        <div>
            {<b>{arrayInput.name.replace('[i]', ``).split('.')[0]}:</b>}{' '}
            <button onClick={() => setChanges(arrayAddItem(arrayInput, changes, value))}>Add</button>
            {arrayGetIndexes(arrayInput, changes, value).map(index => (
                <div key={arrayInput.path + index}>
                    {!arrayIsItemDeleted(arrayInput, value, changes, index) && (
                        <>
                            <EditorInputComponent
                                editorInput={arrayChildModifyIndex(index, arrayInput)}
                                changes={changes}
                                setChanges={setChanges}
                                value={value}
                            />
                            <button onClick={() => setChanges(arrayDeleteItem(index, changes, value, arrayInput))}>Delete</button>
                        </>
                    )}
                </div>
            ))}
        </div>
    );
};
export default EditorArrayInputComponent;
