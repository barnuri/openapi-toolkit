import './App.css';
import openapiSchemaExample from 'openapi-definition-to-editor/src/openapiSchemaExample.json';
import { getEditor, OpenApiDocument } from 'openapi-definition-to-editor';
import EditorComponent from './components/EditorComponent';
const editors = ['Order', 'User', 'Category', 'Tag', 'Pet', 'ApiResponse'].map(tabName => getEditor((openapiSchemaExample as any) as OpenApiDocument, tabName));

function App() {
    return <EditorComponent editor={editors[4]} value={{}} />;
}

export default App;
