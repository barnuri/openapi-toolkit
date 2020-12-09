import { EditorObjectInput, objectGetSelectedSwitchable, objectSetSelectedSwitchable } from 'openapi-definition-to-editor';
import * as React from 'react';
import EditorInputComponent from './EditorInputComponent';
import EditorProps from './EditorProps';

const EditorObjectInputComponent: React.FC<EditorProps & { objectInput: EditorObjectInput }> = ({ objectInput, changes, setChanges, value }) => {
    objectInput.properties = objectInput.properties || [];
    const propsComponents = objectInput.properties.map((x, i) => (
        <EditorInputComponent key={x.path + i} changes={changes} editorInput={x} setChanges={setChanges} value={value} />
    ));
    const switchableSelected = objectGetSelectedSwitchable(objectInput, value, changes);
    if (objectInput.switchable) {
        const commonProps = (
            <div style={{ paddingLeft: '20px' }}>
                <b>
                    <u>common:</u>
                </b>
                {propsComponents}
            </div>
        );
        objectInput.switchableOptions = objectInput.switchableOptions || [];
        objectInput.switchableObjects = objectInput.switchableObjects || [];
        return (
            <div>
                <b>{objectInput.name}</b>:
                <b>
                    <u>switchable:</u>
                </b>
                {['common', ...objectInput.switchableOptions].map(s => (
                    <button key={s} onClick={() => setChanges(objectSetSelectedSwitchable(objectInput, changes, s))}>
                        {s}
                    </button>
                ))}
                {commonProps}
                {objectInput.switchableObjects.map((x, i) => (
                    <div key={x.path + i} style={{ paddingLeft: '20px' }}>
                        {switchableSelected === objectInput.switchableOptions![i] && (
                            <>
                                <b>
                                    <u>{objectInput.switchableOptions![i]}</u>
                                </b>
                                {<EditorInputComponent changes={changes} editorInput={x} setChanges={setChanges} value={value} />}
                            </>
                        )}
                    </div>
                ))}
            </div>
        );
    }
    return (
        <div style={{ paddingLeft: '20px' }}>
            <b>{objectInput.name}</b>: <div style={{ paddingLeft: '20px' }}>{propsComponents}</div>
        </div>
    );
};

export default EditorObjectInputComponent;
