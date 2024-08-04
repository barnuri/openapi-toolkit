# openapi-toolkit
openapi-toolkit is an open-source tool designed to streamline the integration of OpenAPI (formerly known as Swagger) specifications into your development workflow. By taking an OpenAPI/Swagger file as input, the OpenAPI Toolkit automatically generates server and client code, enabling seamless integration of APIs. This automation accelerates development processes, ensures consistency across different platforms, and reduces the risk of manual errors. Whether you're building a new service or integrating with existing APIs, OpenAPI Toolkit simplifies the process by providing ready-to-use code tailored to your OpenAPI specifications.

# Install

[![Run Tests](https://github.com/barnuri/openapi-toolkit/actions/workflows/runTests.yaml/badge.svg)](https://github.com/barnuri/openapi-toolkit/actions/workflows/runTests.yaml) [![Create Tag And Release And Publish To NPM](https://github.com/barnuri/openapi-toolkit/actions/workflows/createTagAndReleaseAndPublish.yaml/badge.svg)](https://github.com/barnuri/openapi-toolkit/actions/workflows/createTagAndReleaseAndPublish.yaml)

[NPM](https://www.npmjs.com/package/openapi-toolkit)

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
docker run --rm --name openapi-toolkit -v "$(pwd)/output:/output" -e CLI_PARAMS="-i https://petstore3.swagger.io/api/v3/openapi.json -g typescript-axios --modelNamePrefix My --modelNameSuffix .dto" barnuri/openapi-toolkit
```

# Auto Generate Client/Server (JS\TS)

```js
const { multipleGenerate, generate } = require('openapi-toolkit');

// use multipleGenerate when you want multiple outputs
(async () => {
    const sharedConfig = { debugLogs: false };
    await multipleGenerate(`https://petstore3.swagger.io/api/v3/openapi.json`, [
        { ...sharedConfig, generator: 'typescript-react-query', output: `./typescript-react-query/src` },
        { ...sharedConfig, generator: 'typescript-axios', output: `./typescript-axios/src` },
        { ...sharedConfig, generator: 'typescript-axios', output: `./typescript-models/src`, modelsOnly: true },
        { ...sharedConfig, generator: 'c#', output: `./c#/src`, },
        { ...sharedConfig, generator: 'go', output: `./go/src` },
        { ...sharedConfig, generator: 'python', output: `./python/src` },
    ]);
})();

// use generate when you want only one output
(async () => {
    await generate({ pathOrUrl: `https://petstore3.swagger.io/api/v3/openapi.json`, generator: 'typescript-react-query', output: `./typescript-react-query/src` });
})();
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
  -n, --namespace                         [default: "OpenapiDefinitionGenerate"]
      --modelsFolderName                                     [default: "models"]
      --modelNamePrefix                                            [default: ""]
      --modelNameSuffix                                            [default: ""]
      --controllersFolderName                           [default: "controllers"]
      --controllerNamePrefix                                       [default: ""]
      --controllerNameSuffix                             [default: "Controller"]
```

## [Vscode Plugin For Auto Generate](https://marketplace.visualstudio.com/items?itemName=Bar.generator-from-swagger)


# [Examples](./examples/ReadMe.md)
