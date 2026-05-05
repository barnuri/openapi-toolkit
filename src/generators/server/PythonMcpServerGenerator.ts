import { ApiPath } from '../../models';
import { snakeCase } from '../../helpers';
import { PythonPydanticClientGenerator } from '../client/PythonPydanticClientGenerator';
import { writeFileSync, mkdirSync } from 'fs';
import { join, basename } from 'path';

const tab = ' '.repeat(4);

export class PythonMcpServerGenerator extends PythonPydanticClientGenerator {
    // Inherits modelsFolder = src/client/models, controllersFolder = src/client/controllers,
    // clientFolder = src/client, and all model/controller generation from PythonPydanticClientGenerator.

    // Override generateClient to write client files without a standalone pyproject.toml.
    generateClient(): void {
        writeFileSync(join(this.clientFolder, '__init__.py'), 'from .client import Client\n');
        writeFileSync(join(this.modelsFolder, '__init__.py'), '');
        writeFileSync(join(this.controllersFolder, '__init__.py'), '');
        this.writeClientFile();
    }

    async generate(): Promise<void> {
        // super.generate() → PythonPydanticClientGenerator → GeneratorAbstract:
        //   deletes output, creates src/client/{models,controllers}, generates all models & controllers,
        //   then calls this.generateClient() (overridden above — no standalone pyproject.toml).
        await super.generate();

        const serverFolder = join(this.options.output, 'src', 'server');
        const toolsFolder = join(serverFolder, 'tools');
        mkdirSync(toolsFolder, { recursive: true });

        this.writeMcpPyprojectToml();
        this.writeMcpServerFile();

        // Reset methodsNames so tool files get the same method names as the controllers.
        this.methodsNames = {};
        this.writeToolFiles(toolsFolder);

        writeFileSync(join(this.options.output, 'src', '__init__.py'), '');
        writeFileSync(join(serverFolder, '__init__.py'), '');
        writeFileSync(join(toolsFolder, '__init__.py'), '');
    }

    private writeMcpPyprojectToml(): void {
        const outputName = basename(this.options.output).replace(/[^a-z0-9-_]/gi, '-').toLowerCase();
        const content = `[project]
name = "${outputName}"
version = "0.1.0"
requires-python = ">=3.11"
dependencies = [
    "mcp>=1.0",
    "httpx>=0.27",
    "pydantic>=2.0",
]

[build-system]
requires = ["hatchling"]
build-backend = "hatchling.build"

[tool.hatch.build.targets.wheel]
packages = ["src/client", "src/server"]

[project.scripts]
${outputName} = "mcp_server:main"
`;
        writeFileSync(join(this.options.output, 'pyproject.toml'), content);
    }

    private writeMcpServerFile(): void {
        const controllerNames = this.parsingResult.controllersNames.map(x => snakeCase(this.getControllerName(x)));
        const allToolsList = controllerNames.map(x => `"${x}"`).join(', ');

        const content = `import importlib
import os
import sys
from functools import lru_cache
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from mcp.server.fastmcp import FastMCP
from client import Client

mcp = FastMCP("${basename(this.options.output)}")


@lru_cache(maxsize=1)
def get_client() -> Client:
    return Client(os.environ.get("BASE_URL", ""))


_route_filter = [r.strip() for r in os.environ.get("TOOL_FILTER_ROUTES", "").split(",") if r.strip()]
_method_filter = [m.strip() for m in os.environ.get("TOOL_FILTER_METHODS", "").split(",") if m.strip()]

ALL_TOOLS: list[str] = [${allToolsList}]

for _module_name in ALL_TOOLS:
    if not _route_filter or _module_name in _route_filter:
        _module = importlib.import_module(f"server.tools.{_module_name}")
        for _tool in _module.TOOLS:
            if not _method_filter or _tool.__name__ in _method_filter:
                mcp.tool()(_tool)


def main() -> None:
    import argparse

    parser = argparse.ArgumentParser(description="${basename(this.options.output)} MCP server")
    parser.add_argument("--transport", default="stdio", choices=["stdio", "sse", "streamable-http"], help="Transport type (default: stdio)")
    parser.add_argument("--host", default="0.0.0.0", help="Host for HTTP transports (default: 0.0.0.0)")
    parser.add_argument("--port", type=int, default=8000, help="Port for HTTP transports (default: 8000)")
    parser.add_argument("--path", default="/mcp", help="Path for streamable-http transport (default: /mcp)")
    args = parser.parse_args()

    run_kwargs: dict = {"transport": args.transport}
    if args.transport != "stdio":
        run_kwargs["host"] = args.host
        run_kwargs["port"] = args.port
    if args.transport == "streamable-http":
        run_kwargs["path"] = args.path

    mcp.run(**run_kwargs)


if __name__ == "__main__":
    main()
`;
        writeFileSync(join(this.options.output, 'src', 'mcp_server.py'), content);
    }

    private writeToolFiles(toolsFolder: string): void {
        for (const controllerName of this.parsingResult.controllersNames) {
            const controllerPaths = this.parsingResult.apiPaths.filter(
                x => x.controller.toLowerCase() === controllerName.toLowerCase(),
            );
            this.writeToolFile(controllerName, controllerPaths, toolsFolder);
        }
    }

    private writeToolFile(controller: string, controllerPaths: ApiPath[], toolsFolder: string): void {
        const moduleName = snakeCase(this.getControllerName(controller));
        const clientControllerAttr = this.getControllerName(controller);
        let imports = `from mcp_server import get_client\n`;
        const funcDefs: string[] = [];
        const toolNames: string[] = [];

        for (const controllerPath of controllerPaths) {
            const { funcDef, methodName } = this.generateToolMethodContent(controller, controllerPath, clientControllerAttr);
            funcDefs.push(funcDef);
            toolNames.push(methodName);
        }

        const rawContent = funcDefs.join('\n\n');

        const modelsRefs = [...(rawContent.matchAll(/models\.(\w+)/g) || [])];
        const seenModels = new Set<string>();
        for (const match of modelsRefs) {
            const modelName = match[1];
            if (!seenModels.has(modelName)) {
                seenModels.add(modelName);
                imports += `from client.models.${modelName} import ${modelName}\n`;
            }
        }

        const allContent = rawContent.replace(/models\./g, '');
        const needsAny = allContent.includes(': Any') || allContent.includes('[Any]');
        if (needsAny) {
            imports += `from typing import Any\n`;
        }

        const toolsList = toolNames.join(', ');
        const fileContent = `${imports}\n${allContent}\n\nTOOLS = [${toolsList}]\n`;
        writeFileSync(join(toolsFolder, `${moduleName}.py`), fileContent);
    }

    private generateToolMethodContent(
        _controller: string,
        controllerPath: ApiPath,
        clientControllerAttr: string,
    ): { funcDef: string; methodName: string } {
        const methodName = this.getMethodName(controllerPath);
        const requestType = controllerPath.body.haveBody ? this.getPropDesc(controllerPath.body.schema) : 'None';

        const bodyParam = controllerPath.body.haveBody
            ? `body: ${!controllerPath.body.required ? `${requestType} | None` : requestType}, `
            : '';

        const headers = [...controllerPath.cookieParams, ...controllerPath.headerParams];
        const haveHeaders = headers.length > 0;
        const headersParams = haveHeaders
            ? headers.map(x => `h_${snakeCase(x.name)}: ${x.required ? 'str' : 'str | None'}`).join(', ') + ', '
            : '';

        const pathParams =
            controllerPath.pathParams.length > 0
                ? controllerPath.pathParams
                      .map(x => `p_${snakeCase(x.name)}: ${x.required ? this.getPropDesc(x.schema!) : `${this.getPropDesc(x.schema!)} | None`}`)
                      .join(', ') + ', '
                : '';

        const queryParams =
            controllerPath.queryParams.length > 0
                ? controllerPath.queryParams
                      .map(x => {
                          const type = this.getPropDesc(x.schema!);
                          return x.required
                              ? `q_${snakeCase(x.name)}: ${type}`
                              : `q_${snakeCase(x.name)}: ${type} | None = None`;
                      })
                      .join(', ') + ', '
                : '';

        const allArgs: string[] = [];
        if (controllerPath.body.haveBody) {
            allArgs.push('body=body');
        }
        for (const p of controllerPath.pathParams) {
            allArgs.push(`p_${snakeCase(p.name)}=p_${snakeCase(p.name)}`);
        }
        for (const q of controllerPath.queryParams) {
            allArgs.push(`q_${snakeCase(q.name)}=q_${snakeCase(q.name)}`);
        }
        for (const h of headers) {
            allArgs.push(`h_${snakeCase(h.name)}=h_${snakeCase(h.name)}`);
        }

        let funcDef = '';
        funcDef += `async def ${methodName}(${bodyParam}${pathParams}${queryParams}${headersParams}) -> dict:\n`;
        funcDef += `${tab}"""${controllerPath.method.toUpperCase()} ${controllerPath.path}"""\n`;
        funcDef += `${tab}client = get_client()\n`;
        funcDef += `${tab}return await client.${clientControllerAttr}.${methodName}(${allArgs.join(', ')})\n`;

        return { funcDef, methodName };
    }

}
