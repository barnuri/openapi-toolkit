import { capitalize, distinctByProp, getAllEditorInputsByEditors, getAllEditors, getApiPaths } from '../../helpers';
import { EditorObjectInput, EditorPrimitiveInput, OpenApiDocument } from '../../models';
import ParsingResult from '../../models/ParsingResult';

export default (swagger: OpenApiDocument, debugLogs: boolean) => {
    swagger = swagger;
    console.log('-----  start parsing -----'.cyan());
    console.log('parsing models');
    const editors = getAllEditors(swagger, debugLogs);
    console.log('parse all api pathes');
    const apiPaths = getApiPaths(swagger);
    const controllersNames = distinctByProp([...new Set(apiPaths.map(x => x.controller))], x => x.toLowerCase());
    const allEditorInputs = getAllEditorInputsByEditors(editors);
    const allObjectEditorInputs = allEditorInputs.filter(x => x.editorType === 'EditorObjectInput').map(x => x as EditorObjectInput);
    for (const objectInput of allObjectEditorInputs) {
        if (objectInput.implements) {
            objectInput.implements = objectInput.implements.map(x => capitalize(x));
        }
    }
    const allPrimitiveEditorInput = allEditorInputs
        .filter(x => x.editorType === 'EditorPrimitiveInput')
        .map(x => x as EditorPrimitiveInput);
    const allEnumsEditorInput = allPrimitiveEditorInput.filter(x => x.enumNames.length + x.enumsOptions.length + x.enumValues.length > 0);
    const haveModels = allObjectEditorInputs.length + allEnumsEditorInput.length > 0;
    console.log('-----  done parsing -----'.green());
    return {
        haveModels,
        editors,
        apiPaths,
        controllersNames,
        allObjectEditorInputs,
        allPrimitiveEditorInput,
        allEnumsEditorInput,
        allEditorInputs,
    } as ParsingResult;
};
