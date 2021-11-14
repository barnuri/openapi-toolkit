import { ChangesModelDefaultValue } from './models';
import value from './value.json';

import { getEditor, OpenApiDocument,arrayGetIndexes } from './index';
import axios from 'axios';

axios
    .get('https://petstore.swagger.io/v2/swagger.json')
    .then(res => res.data)
    .then(openapiSchemaExample => {
        const openApiDoc = openapiSchemaExample as any as OpenApiDocument;
        const editors = [].map(tabName => getEditor(openApiDoc, tabName));
        const obj = editors.find(x => x.name === 'BaseConfig')?.inputs; //?.inputs.find(x => x.path === 'topicKeySelector');
        const obj2 = obj?.find(x => x.editorType === 'EditorArrayInput' && x.path == 'monitorGroups[i]');
        const a = arrayGetIndexes(obj2 as any, ChangesModelDefaultValue, value);

        // generate({
        //     ...new GeneratorsOptions(),
        //     pathOrUrl: 'https://petstore.swagger.io/v2/swagger.json',
        //     output: './dist/test1',
        // });

        // let res = {};
        // for (const editor of editors) {
        //     res[editor.name] = editorFilterUnkownPaths(editor, propsPaths);
        // }

        // const html = editorInputToHtml(editors);
        // writeFileSync('./openapiSchemaExample.result.json', JSON.stringify(editors, undefined, 4), 'utf-8');
        // writeFileSync('./openapiSchemaExample.html', html, 'utf-8');
        // var start = process.platform == 'darwin' ? 'open' : process.platform == 'win32' ? 'start' : 'xdg-open';
        // require('child_process').exec(start + ' ' + './openapiSchemaExample.html');

        // let changes = ChangesModelDefaultValue;
        // const c = 1;
    });
