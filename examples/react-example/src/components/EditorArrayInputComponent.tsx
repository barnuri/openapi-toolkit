import { EditorArrayInput, getEditorInputName } from 'openapi-definition-to-editor';
import * as React from 'react';
import EditorInputComponent from './EditorInputComponent';
import EditorProps from './EditorProps';
import * as jp from 'jsonpath';

const EditorArrayInputComponent = ({
    arrayInput,
    changes,
    setChanges,
    value,
}: EditorProps & {
    arrayInput: EditorArrayInput;
}) => {
    const arrayPath = arrayInput.path.replace('[i]', ``);
    const [items, setItems] = React.useState(((jp.query(value, '$.' + arrayPath) as any[]).map(() => ({})) as any[]) || ([] as any[]));
    const modifyIndex = (i: number) => {
        const itemInput = Object.assign({}, arrayInput.itemInput);
        itemInput.path = itemInput.path.replace('[i]', `[${i}]`);
        return itemInput;
    };
    const deleteItem = (index: number) => {
        items[index]['x-editorDeleted'] = true;
        const prefixKey = arrayInput.itemInput.path.replace('[i]', `[${index}]`);
        Object.keys(changes)
            .filter(key => key.includes(prefixKey))
            .forEach(key => delete changes[key]);
        setChanges({ ...changes });
        setItems([...items]);
    };
    return (
        <div>
            {<b>{getEditorInputName(arrayInput).replace('[i]', ``)}:</b>} <button onClick={() => setItems([...items, {}])}>Add</button>
            {items.map((listItem, index) => (
                <div key={arrayInput.path + index}>
                    {!listItem['x-editorDeleted'] && (
                        <>
                            <EditorInputComponent editorInput={modifyIndex(index)} changes={changes} setChanges={setChanges} value={value} />
                            <button onClick={() => deleteItem(index)}>Delete</button>
                        </>
                    )}
                </div>
            ))}
        </div>
    );
};
export default EditorArrayInputComponent;
