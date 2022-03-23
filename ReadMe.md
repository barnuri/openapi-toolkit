# Install

[![Publish Package to npmjs](https://github.com/barnuri/openapi-toolkit/actions/workflows/publishToNpm.yml/badge.svg?branch=2.0.28)](https://github.com/barnuri/openapi-toolkit/actions/workflows/publishToNpm.yml)

```bash
npm i openapi-toolkit
```

# Auto Generate Client/Server (Cli)

```bash
npm i -g openapi-toolkit

# example
openapi-toolkit -i https://petstore3.swagger.io/api/v3/openapi.json -g typescript-axios -o ./src/services/petStore --modelNamePrefix My --modelNameSuffix .dto

# show all options
openapi-toolkit -h

# with docker
docker run --rm --name openapi-toolkit -v "$(pwd)/test-go1:/output" -e CLI_PARAMS="-i https://petstore3.swagger.io/api/v3/openapi.json -g typescript-axios --modelNamePrefix My --modelNameSuffix .dto" barnuri/openapi-toolkit
```

### Help output

```text
openapi-toolkit <command>, default command 'generate'

Commands:
  generate    auto generate proxy client from swagger file             [default]
  generators  generators list
  completion  generate completion script

Options:
      --version                Show version number                     [boolean]
  -h, --help                   Show help                               [boolean]
  -i, --pathOrUrl              path or url for swagger file           [required]
  -o, --output                 output path                            [required]
  -g, --generator              generator name      [default: "typescript-axios"]
  -t, --type                   [choices: "client", "server"] [default: "client"]
  -n, --namepsace                         [default: "OpenapiDefinitionGenerate"]
      --modelsFolderName                                     [default: "models"]
      --modelNamePrefix                                            [default: ""]
      --modelNameSuffix                                            [default: ""]
      --controllersFolderName                           [default: "controllers"]
      --controllerNamePrefix                                       [default: ""]
      --controllerNameSuffix                             [default: "Controller"]
```

## [Vscode Plugin For Auto Generate](https://marketplace.visualstudio.com/items?itemName=Bar.generator-from-swagger)


# Examples

## 1) [React Example](./examples/react-example)

## 2) [Angular Example](./examples/anguler-example)

---

## 3) Look at editorInputToHtml.ts to handle editors by yourself

[editorInputToHtml.ts](src/converters/editorInputToHtml.ts)

## Example of using editorInputToHtml.ts

## Download this file

https://petstore.swagger.io/v2/swagger.json

### Then use this code

```js
import { writeFileSync } from 'fs';
import openapiSchemaExample from './openapiSchemaExample.json';
import { editorInputToHtml, getEditor, OpenApiDocument } from 'openapi-toolkit';

const ex = async () = {
    await axios.get('https://petstore.swagger.io/v2/swagger.json')
    const editors = ['Order', 'User', 'Category', 'Tag', 'Pet', 'ApiResponse'].map(tabName => getEditor((openapiSchemaExample as any) as OpenApiDocument, tabName));
    const html = editorInputToHtml(editors);
    writeFileSync('./openapiSchemaExample.result.json', JSON.stringify(editors, undefined, 4), 'utf-8');
    writeFileSync('./openapiSchemaExample.html', html, 'utf-8');
    var start = process.platform == 'darwin' ? 'open' : process.platform == 'win32' ? 'start' : 'xdg-open';
    require('child_process').exec(start + ' ' + './openapiSchemaExample.html');
}

```

### Result

![Example](https://github.com/barnuri/openapi-toolkit/blob/master/ex.png?raw=true)
