# Install

```bash
npm i openapi-definition-to-editor
```

# Examples

## 1) [React Example](./examples/react-example)

## 2) [Angular Example](./examples/anguler-example)

---

## 3) Look at editorInputToHtml.ts to handle editors by yourself

[editorInputToHtml.ts](src/converters/editorInputToHtml.ts)

## Example of using editorInputToHtml.ts

## Download this file

https://raw.githubusercontent.com/barnuri/openapi-definition-to-editor/master/src/openapiSchemaExample.json

### Then use this code

```js
import { writeFileSync } from 'fs';
import openapiSchemaExample from './openapiSchemaExample.json';
import { editorInputToHtml, getEditor, OpenApiDocument } from 'openapi-definition-to-editor';

const editors = ['Order', 'User', 'Category', 'Tag', 'Pet', 'ApiResponse'].map(tabName => getEditor((openapiSchemaExample as any) as OpenApiDocument, tabName));
const html = editorInputToHtml(editors);
writeFileSync('./openapiSchemaExample.result.json', JSON.stringify(editors, undefined, 4), 'utf-8');
writeFileSync('./openapiSchemaExample.html', html, 'utf-8');
var start = process.platform == 'darwin' ? 'open' : process.platform == 'win32' ? 'start' : 'xdg-open';
require('child_process').exec(start + ' ' + './openapiSchemaExample.html');

```

### Result

![Example](https://github.com/barnuri/openapi-definition-to-editor/blob/master/ex.png?raw=true)
