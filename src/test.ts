import { ChangesModelDefaultValue } from './models';
import { writeFileSync } from 'fs';
import openapiSchemaExample from './openapiSchemaExample.json';
// import value from './value.json';

import { editorInputToHtml, getEditor, OpenApiDocument, getDefinisions } from './index';
import { changesGetPathValue, changesUnsetPathValue, editorFilterUnkownPaths, findPropsByValue, getBulkWrite } from './helpers';

// const propsPaths = findPropsByValue(value, 'title');
const openApiDoc = (openapiSchemaExample as any) as OpenApiDocument;
// const definisions = getDefinisions(openApiDoc);
const editors = [
    // 'CrawlerBaseConfig',
    // 'ShallowMappingSettings',
    'DeepMappingSettings',
    // 'IndexingSettings',
    // 'ParsingSettings',
    // 'ImagesManagerConfig',
    // 'CrawlingSettings',
    // 'WebAuthenticationTemplateConfig',
    // 'BrowserBaseAuthenticationConfig',
    // 'WebDriverRequestSettings',
    // 'CrawlerSelectors',
].map(tabName => getEditor(openApiDoc, tabName));
const keySelector = editors.find(x => x.name === 'DeepMappingSettings')?.inputs.find(x => x.path === 'topicKeySelector');
const ccb = 1;

// let res = {};
// for (const editor of editors) {
//     res[editor.name] = editorFilterUnkownPaths(editor, propsPaths);
// }

// const a = getEditor(openApiDoc, 'ParsingSettings');
// const bbbb = a.inputs.filter(x => x.name === 'processActions[i]');

// const html = editorInputToHtml(editors);
// writeFileSync('./openapiSchemaExample.result.json', JSON.stringify(editors, undefined, 4), 'utf-8');
// writeFileSync('./openapiSchemaExample.html', html, 'utf-8');
// var start = process.platform == 'darwin' ? 'open' : process.platform == 'win32' ? 'start' : 'xdg-open';
// require('child_process').exec(start + ' ' + './openapiSchemaExample.html');

// const aaa = getBulkWrite(
//     {
//         $set: {
//             'parsingSettings.0.dataSelectorsArray.0.name': 'bot_country',
//             'parsingSettings.0.dataSelectorsArray.0.query': "//tr[.//span[contains(text(),'Country')]]/td/div/span",
//             'parsingSettings.0.dataSelectorsArray.0.selectorQueryType': 'Xpath',
//             'parsingSettings.0.dataSelectorsArray.1.name': 'bot_first_seen',
//             'parsingSettings.0.dataSelectorsArray.1.query': "//tr[.//span[contains(text(),'Installed')]]/td",
//             'parsingSettings.0.dataSelectorsArray.2.name': 'bot_id',
//             'parsingSettings.0.dataSelectorsArray.2.selectorQueryType': 'Xpath',
//             'parsingSettings.0.dataSelectorsArray.3.query': '(?<=id=)\\d+',
//             'parsingSettings.0.dataSelectorsArray.3.selectorQueryType': 'Xpath',
//             'parsingSettings.0.dataSelectorsArray.4.name': 'bot_ip',
//             'parsingSettings.0.dataSelectorsArray.4.query': "//tr[.//th[contains(text(),'Ip')]]/td/div/span",
//             'parsingSettings.0.dataSelectorsArray.4.selectorQueryType': 'Xpath',
//             'parsingSettings.0.dataSelectorsArray.5.name': 'bot_last_updated',
//             'parsingSettings.0.dataSelectorsArray.5.query': "//tr[.//span[contains(text(),'Updated')]]/td",
//             'parsingSettings.0.dataSelectorsArray.5.selectorQueryType': 'Xpath',
//             'parsingSettings.0.dataSelectorsArray.6.name': 'bot_name',
//             'parsingSettings.0.dataSelectorsArray.6.query': '//div/h3/b',
//             'parsingSettings.0.dataSelectorsArray.6.selectorQueryType': 'Xpath',
//             'parsingSettings.0.dataSelectorsArray.7.name': 'bot_os',
//             'parsingSettings.0.dataSelectorsArray.7.query': "//tr[.//th[contains(text(),'Os')]]/td/div/span",
//             'parsingSettings.0.dataSelectorsArray.7.selectorQueryType': 'Xpath',
//             'parsingSettings.0.dataSelectorsArray.8.name': 'bot_price',
//             'parsingSettings.0.dataSelectorsArray.8.query': "//tr[.//th[contains(text(),'Price')]]/td/b",
//             'parsingSettings.0.dataSelectorsArray.8.selectorQueryType': 'Xpath',
//             'parsingSettings.0.dataSelectorsArray.9.name': 'data_browser',
//             'parsingSettings.0.dataSelectorsArray.9.query': './td[4]/div[./i]/text()',
//             'parsingSettings.0.dataSelectorsArray.9.selectorQueryType': 'Xpath',
//             'parsingSettings.0.dataSelectorsArray.10.name': 'data_dataset',
//             'parsingSettings.0.dataSelectorsArray.10.query': './td[3]/div/text()',
//             'parsingSettings.0.dataSelectorsArray.10.selectorQueryType': 'Xpath',
//             'parsingSettings.0.dataSelectorsArray.11.name': 'data_id',
//             'parsingSettings.0.dataSelectorsArray.11.query': './@data-key',
//             'parsingSettings.0.dataSelectorsArray.11.selectorQueryType': 'Xpath',
//             'parsingSettings.0.dataSelectorsArray.12.name': 'data_install_date',
//             'parsingSettings.0.dataSelectorsArray.12.query': "./td[6]/span[@data-original-title='grabbed']",
//             'parsingSettings.0.dataSelectorsArray.12.selectorQueryType': 'Xpath',
//             'parsingSettings.0.dataSelectorsArray.13.name': 'data_last_updated',
//             'parsingSettings.0.dataSelectorsArray.13.query': "./td[6]/span[@data-original-title='updated']",
//             'parsingSettings.0.dataSelectorsArray.13.selectorQueryType': 'Xpath',
//             'parsingSettings.0.dataSelectorsArray.14.name': 'data_resource',
//             'parsingSettings.0.dataSelectorsArray.14.query': "./td/div[contains(@style,'margin-left') and child::span]",
//             'parsingSettings.0.dataSelectorsArray.14.selectorQueryType': 'Xpath',
//             'parsingSettings.0.dataSelectorsArray.15.name': 'data_service_name',
//             'parsingSettings.0.dataSelectorsArray.15.query': "./td[1]/div[contains(@style,'margin-bottom')]",
//             'parsingSettings.0.dataSelectorsArray.15.selectorQueryType': 'Xpath',
//             'parsingSettings.0.dataSelectorsArray.16.name': 'data_service_url',
//             'parsingSettings.0.dataSelectorsArray.16.query': "./td[1]/div[not(contains(@style,'margin-bottom'))][1]/@title",
//             'parsingSettings.0.dataSelectorsArray.16.selectorQueryType': 'Xpath',
//             'parsingSettings.0.dataSelectorsArray.17.name': 'data_source_module',
//             'parsingSettings.0.dataSelectorsArray.17.query': './td[2]/div[./i]/text()',
//             'parsingSettings.0.dataSelectorsArray.17.selectorQueryType': 'Xpath',
//         },
//     } as any,
//     { a: '1' },
// );
// console.dir(b, { depth: 100 });
// const c = 1;

// let changes = ChangesModelDefaultValue;
// const c = 1;
// let parent = editors.filter(x => x.name === 'CrawlerBaseConfig')[0];
// let arrayEditor = parent.inputs.filter(x => x.name.includes('sourceGroups'))[0];
// let arrayValue = changesGetPathValue(changes, value, arrayEditor);
// changes = changesUnsetPathValue(changes, arrayEditor);
// arrayValue = changesGetPathValue(changes, value, arrayEditor);

// parent = editors.filter(x => x.name === 'ShallowMappingSettings')[0];
// let objectEditor = parent.inputs.filter(x => x.name.includes('categoryUrlSelector'))[0];
// let objectValue = changesGetPathValue(changes, value, objectEditor);
// changes = changesUnsetPathValue(changes, objectEditor);
// objectValue = changesGetPathValue(changes, value, objectEditor);

// const b = 1;
