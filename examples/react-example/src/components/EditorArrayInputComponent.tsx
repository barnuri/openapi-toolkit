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
    const existingItems = (jp.query(value, '$.' + arrayPath) as any[]).map(() => ({})) as any[];
    const originalItemsCount = existingItems.length;
    const [items, setItems] = React.useState(existingItems || ([] as any[]));
    const modifyIndex = (i: number) => {
        const itemInput = Object.assign({}, arrayInput.itemInput);
        itemInput.path = itemInput.path.replace('[i]', `.${i}`);
        return itemInput;
    };
    const deleteItem = (index: number) => {
        items[index]['x-editorDeleted'] = true;
        const prefixKey = (i: number) => arrayInput.itemInput.path.replace('[i]', `.${i}`);

        // cleanup
        Object.keys(changes.$set)
            .filter(key => key.includes(prefixKey(index)))
            .forEach(key => delete changes.$set[key]);

        // new item, reorganized indexes
        if (index > originalItemsCount - 1) {
            for (let minNewIndexToModify = index + 1; minNewIndexToModify < items.length; minNewIndexToModify++) {
                Object.keys(changes.$set)
                    .filter(key => key.includes(prefixKey(minNewIndexToModify)))
                    .forEach(key => {
                        changes.$set[key.replace(prefixKey(minNewIndexToModify), prefixKey(minNewIndexToModify - 1))] = changes.$set[key];
                        delete changes.$set[key];
                    });
            }
            items.splice(index, 1);
        }
        // existing item
        else {
            changes.$unset = { ...changes.$unset, [arrayPath]: '' };
        }

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
