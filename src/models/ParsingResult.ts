import { ApiPath } from './ApiPath';
import { Editor } from './editor/Editor';
import { EditorInput } from './editor/EditorInput';
import { EditorObjectInput } from './editor/EditorObjectInput';
import { EditorPrimitiveInput } from './editor/EditorPrimitiveInput';

export default class ParsingResult {
    haveModels!: boolean;
    editors!: Editor[];
    apiPaths!: ApiPath[];
    controllersNames!: string[];
    allObjectEditorInputs!: EditorObjectInput[];
    allEditorInputs!: EditorInput[];
    allPrimitiveEditorInput!: EditorPrimitiveInput[];
    allEnumsEditorInput!: EditorPrimitiveInput[];
}
