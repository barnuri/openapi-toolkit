import {
    arrayChildModifyIndex,
    arrayDeleteItem,
    arrayIsItemDeleted,
    arrayItemsCount,
    EditorArrayInput,
    getEditorInputName,
} from 'openapi-definition-to-editor';
import * as React from 'react';
import EditorInputComponent from './EditorInputComponent';
import EditorProps from './EditorProps';

const EditorArrayInputComponent = ({
    arrayInput,
    changes,
    setChanges,
    value,
}: EditorProps & {
    arrayInput: EditorArrayInput;
}) => {
    const [count, setCount] = React.useState(arrayItemsCount(arrayInput, value, changes));

    return (
        <div>
            {<b>{getEditorInputName(arrayInput).replace('[i]', ``)}:</b>} <button onClick={() => setCount(count + 1)}>Add</button>
            {Array.from({ length: count }, (x, i) => i).map(index => (
                <div key={arrayInput.path + index}>
                    {!arrayIsItemDeleted(arrayInput, value, changes, index) && (
                        <>
                            <EditorInputComponent
                                editorInput={arrayChildModifyIndex(index, arrayInput)}
                                changes={changes}
                                setChanges={setChanges}
                                value={value}
                            />
                            <button onClick={() => arrayDeleteItem(index, changes, value, arrayInput)}>Delete</button>
                        </>
                    )}
                </div>
            ))}
        </div>
    );
};
export default EditorArrayInputComponent;
