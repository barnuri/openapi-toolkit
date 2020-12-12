import { writeFileSync } from 'fs';
import openapiSchemaExample from './openapiSchemaExample2.json';
import { editorInputToHtml, getEditor, OpenApiDocument, getDefinisions } from './index';

const openApiDoc = (openapiSchemaExample as any) as OpenApiDocument;
const definisions = getDefinisions(openApiDoc);
const editors = Object.keys(definisions).map(tabName => getEditor(openApiDoc, tabName));
const html = editorInputToHtml(editors);
writeFileSync('./openapiSchemaExample.result.json', JSON.stringify(editors, undefined, 4), 'utf-8');
writeFileSync('./openapiSchemaExample.html', html, 'utf-8');
var start = process.platform == 'darwin' ? 'open' : process.platform == 'win32' ? 'start' : 'xdg-open';
require('child_process').exec(start + ' ' + './openapiSchemaExample.html');
