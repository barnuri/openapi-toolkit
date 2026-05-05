from mcp_server import get_client
from client.models.User import User

async def postUser(body: User | None, ) -> dict:
    """POST /user"""
    client = get_client()
    return await client.UserController.postUser(body=body)


async def postCreateWithList(body: list[User] | None, ) -> dict:
    """POST /user/createWithList"""
    client = get_client()
    return await client.UserController.postCreateWithList(body=body)


async def getLogin(q_username: str | None = None, q_password: str | None = None, ) -> dict:
    """GET /user/login"""
    client = get_client()
    return await client.UserController.getLogin(q_username=q_username, q_password=q_password)


async def getLogout() -> dict:
    """GET /user/logout"""
    client = get_client()
    return await client.UserController.getLogout()


async def getUsername(p_username: str | None, ) -> dict:
    """GET /user/{username}"""
    client = get_client()
    return await client.UserController.getUsername(p_username=p_username)


async def putUsername(body: User | None, p_username: str | None, ) -> dict:
    """PUT /user/{username}"""
    client = get_client()
    return await client.UserController.putUsername(body=body, p_username=p_username)


async def deleteUsername(p_username: str | None, ) -> dict:
    """DELETE /user/{username}"""
    client = get_client()
    return await client.UserController.deleteUsername(p_username=p_username)


TOOLS = [postUser, postCreateWithList, getLogin, getLogout, getUsername, putUsername, deleteUsername]
