import httpx
from ..models.User import User

class UserController:
    def __init__(self, base_url: str) -> None:
        self._base_url = base_url

    async def postUser(self, body: User | None, **kwargs) -> User:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self._base_url}/user",
                json=body.model_dump() if hasattr(body, 'model_dump') else body,
                **kwargs,
            )
            response.raise_for_status()
            return response.json()
    async def postCreateWithList(self, body: list[User] | None, **kwargs) -> User:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self._base_url}/user/createWithList",
                json=body.model_dump() if hasattr(body, 'model_dump') else body,
                **kwargs,
            )
            response.raise_for_status()
            return response.json()
    async def getLogin(self, q_username: str | None = None, q_password: str | None = None, **kwargs) -> str:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self._base_url}/user/login",
                params={k: v for k, v in {"username": q_username, "password": q_password}.items() if v is not None},
                **kwargs,
            )
            response.raise_for_status()
            return response.json()
    async def getLogout(self, **kwargs) -> dict:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self._base_url}/user/logout",
                **kwargs,
            )
            response.raise_for_status()
            return response.json()
    async def getUsername(self, p_username: str | None, **kwargs) -> User:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self._base_url}/user/{p_username}",
                **kwargs,
            )
            response.raise_for_status()
            return response.json()
    async def putUsername(self, body: User | None, p_username: str | None, **kwargs) -> dict:
        async with httpx.AsyncClient() as client:
            response = await client.put(
                f"{self._base_url}/user/{p_username}",
                json=body.model_dump() if hasattr(body, 'model_dump') else body,
                **kwargs,
            )
            response.raise_for_status()
            return response.json()
    async def deleteUsername(self, p_username: str | None, **kwargs) -> dict:
        async with httpx.AsyncClient() as client:
            response = await client.delete(
                f"{self._base_url}/user/{p_username}",
                **kwargs,
            )
            response.raise_for_status()
            return response.json()