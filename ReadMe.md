# Install

```bash
npm i openapi-definition-to-editor
```

# Example of using

## Download this file

https://raw.githubusercontent.com/barnuri/openapi-definition-to-editor/master/src/openapiSchemaExample.json

## Then use this code

```js
import { writeFileSync } from 'fs';
import { OpenApiDocument, getEditor } from 'openapi-definition-to-editor';
import openapiSchemaExample from './openapiSchemaExample.json';

const editors = ['Order', 'User', 'Category', 'Tag', 'Pet', 'ApiResponse'].map(tabName => getEditor((openapiSchemaExample as any) as OpenApiDocument, tabName));
const html = editors.map(x => x.toHtml()).join('');
writeFileSync('./openapiSchemaExample.result.json', JSON.stringify(editors, undefined, 4), 'utf-8');
writeFileSync('./openapiSchemaExample.html', html, 'utf-8');
var start = process.platform == 'darwin' ? 'open' : process.platform == 'win32' ? 'start' : 'xdg-open';
require('child_process').exec(start + ' ' + './openapiSchemaExample.html');
```

## Result

![Example](raw.githubusercontent.com/barnuri/openapi-definition-to-editor/master/ex.png)
