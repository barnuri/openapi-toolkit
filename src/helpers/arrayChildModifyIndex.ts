import { EditorArrayInput, EditorObjectInput } from '../models';
import { EditorInput } from './../models/editor/EditorInput';

export default (index: number, arrayInput: EditorArrayInput) => modifyIndexChild(index, arrayInput.itemInput);

function modifyIndexChild(i: number, editor: EditorInput) {
    let input = JSON.parse(JSON.stringify(editor));
    input.name = input.name.replace('[i]', `.${i}`);
    input.path = input.path.replace('[i]', `.${i}`);
    if (input.editorType === 'EditorObjectInput') {
        const objInput = input as EditorObjectInput;
        objInput.properties = objInput.properties || [];
        for (let j = 0; j < objInput.properties.length; j++) {
            objInput.properties[j] = modifyIndexChild(i, objInput.properties[j]);
        }
        objInput.switchableObjects = objInput.switchableObjects || [];
        for (let j = 0; j < objInput.switchableObjects.length; j++) {
            objInput.switchableObjects[j] = modifyIndexChild(i, objInput.switchableObjects[j]);
        }
        input = objInput;
    } else if (input.editorType === 'EditorArrayInput') {
        const arrInput = input as EditorArrayInput;
        arrInput.itemInput = modifyIndexChild(i, arrInput.itemInput);
        input = arrInput;
    }
    return JSON.parse(JSON.stringify(input));
}
