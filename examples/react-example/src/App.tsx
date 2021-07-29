import './App.css';
import openapiSchemaExample from 'openapi-toolkit/src/openapiSchemaExample2.json';
import { getEditor, OpenApiDocument } from 'openapi-toolkit';
import EditorsComponent from './components/EditorsComponent';

const editors = ['DeepMappingSettings', 'User', 'Category', 'Tag', 'Pet', 'ApiResponse'].map(tabName =>
    getEditor(openapiSchemaExample as any as OpenApiDocument, tabName),
);

function App() {
    return <EditorsComponent editors={editors} value={{}} onChange={val => console.log(val)} />;
}

export default App;
