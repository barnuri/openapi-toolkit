# openapi-toolkit
openapi-toolkit is an open-source tool designed to streamline the integration of OpenAPI (formerly known as Swagger) specifications into your development workflow. By taking an OpenAPI/Swagger file as input, the OpenAPI Toolkit automatically generates server and client code, enabling seamless integration of APIs. This automation accelerates development processes, ensures consistency across different platforms, and reduces the risk of manual errors. Whether you're building a new service or integrating with existing APIs, OpenAPI Toolkit simplifies the process by providing ready-to-use code tailored to your OpenAPI specifications.

# Generate MCP Server

openapi-toolkit can generate a fully functional [MCP SDK FastMCP](https://github.com/modelcontextprotocol/python-sdk) server from any OpenAPI/Swagger spec — one MCP tool per API endpoint, grouped by controller, with dynamic loading support.

## Step 1 — Generate the Pydantic client

```bash
openapi-toolkit -i https://petstore3.swagger.io/api/v3/openapi.json -g python-pydantic -o ./my-api-client
```

This emits a `uv`-compatible Python package with async `httpx` controllers and Pydantic v2 models.

## Step 2 — Generate the MCP server

```bash
openapi-toolkit -i https://petstore3.swagger.io/api/v3/openapi.json -g python-mcp-server -t server -o ./pet-store-mcp
```

The MCP server is placed next to the client (`../my-api-client`) and references it as a local editable dependency.

Generated layout:
```
my-api-mcp/
  pyproject.toml          # uv project with fastmcp + pydantic client dep
  src/
    mcp_server.py         # FastMCP entry point, dynamic tool loading
    client.py             # cached Client instance (reads BASE_URL from env)
    tools/
      <controller>.py     # one file per API controller tag
```

## Step 3 — Install and run

```bash
cd my-api-mcp
uv sync
BASE_URL=https://petstore3.swagger.io/api/v3 uv run python src/mcp_server.py
```

A fully generated example (Petstore API) is available in this repo: [examples/pet-store-mcp](https://github.com/barnuri/openapi-toolkit/tree/master/examples/pet-store-mcp)

## Environment variables

| Variable | Description |
|---|---|
| `BASE_URL` | Base URL of the target API (required at runtime) |
| `TOOL_FILTER_ROUTES` | Comma-separated list of controller names to load (e.g. `pet,store`). Loads all if unset. |
| `TOOL_FILTER_METHODS` | Comma-separated list of tool function names to register (e.g. `getPetById,addPet`). Registers all if unset. |

**Example — load only the `pet` and `store` controllers:**
```bash
TOOL_FILTER_ROUTES=pet,store BASE_URL=https://... uv run python src/mcp_server.py
```

**Example — load only specific methods:**
```bash
TOOL_FILTER_METHODS=getPetById,addPet BASE_URL=https://... uv run python src/mcp_server.py
```

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
