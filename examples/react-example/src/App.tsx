import './App.css';
import openapiSchemaExample from 'openapi-definition-to-editor/src/openapiSchemaExample2.json';
import { getEditor, OpenApiDocument } from 'openapi-definition-to-editor';
import EditorComponent from './components/EditorComponent';

const editors = ['DeepMappingSettings', 'User', 'Category', 'Tag', 'Pet', 'ApiResponse'].map(tabName =>
    getEditor((openapiSchemaExample as any) as OpenApiDocument, tabName),
);

function App() {
    return (
        <div>
            {editors.map((editor, i) => (
                <EditorComponent key={editor.name + i} editor={editor} value={{}} />
            ))}
        </div>
    );
}

export default App;
