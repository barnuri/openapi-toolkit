import importlib
import os
import sys
from functools import lru_cache
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from mcp.server.fastmcp import FastMCP
from client import Client

mcp = FastMCP("pet-store-mcp")


@lru_cache(maxsize=1)
def get_client() -> Client:
    return Client(os.environ.get("BASE_URL", ""))


_route_filter = [r.strip() for r in os.environ.get("TOOL_FILTER_ROUTES", "").split(",") if r.strip()]
_method_filter = [m.strip() for m in os.environ.get("TOOL_FILTER_METHODS", "").split(",") if m.strip()]

ALL_TOOLS: list[str] = ["pet_controller", "store_controller", "user_controller"]

for _module_name in ALL_TOOLS:
    if not _route_filter or _module_name in _route_filter:
        _module = importlib.import_module(f"server.tools.{_module_name}")
        for _tool in _module.TOOLS:
            if not _method_filter or _tool.__name__ in _method_filter:
                mcp.tool()(_tool)


def main() -> None:
    import argparse

    parser = argparse.ArgumentParser(description="pet-store-mcp MCP server")
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
