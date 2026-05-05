import httpx
from ..models.Pet import Pet
from ..models.ApiResponse import ApiResponse

class PetController:
    def __init__(self, base_url: str) -> None:
        self._base_url = base_url

    async def putPet(self, body: Pet, **kwargs) -> Pet:
        async with httpx.AsyncClient() as client:
            response = await client.put(
                f"{self._base_url}/pet",
                json=body.model_dump() if hasattr(body, 'model_dump') else body,
                **kwargs,
            )
            response.raise_for_status()
            return response.json()
    async def postPet(self, body: Pet, **kwargs) -> Pet:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self._base_url}/pet",
                json=body.model_dump() if hasattr(body, 'model_dump') else body,
                **kwargs,
            )
            response.raise_for_status()
            return response.json()
    async def getFindByStatus(self, q_status: str | None = None, **kwargs) -> list[Pet]:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self._base_url}/pet/findByStatus",
                params={k: v for k, v in {"status": q_status}.items() if v is not None},
                **kwargs,
            )
            response.raise_for_status()
            return response.json()
    async def getFindByTags(self, q_tags: list[str] | None = None, **kwargs) -> list[Pet]:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self._base_url}/pet/findByTags",
                params={k: v for k, v in {"tags": q_tags}.items() if v is not None},
                **kwargs,
            )
            response.raise_for_status()
            return response.json()
    async def getPetId(self, p_pet_id: int | None, **kwargs) -> Pet:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self._base_url}/pet/{p_pet_id}",
                **kwargs,
            )
            response.raise_for_status()
            return response.json()
    async def postPetId(self, p_pet_id: int | None, q_name: str | None = None, q_status: str | None = None, **kwargs) -> Pet:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self._base_url}/pet/{p_pet_id}",
                params={k: v for k, v in {"name": q_name, "status": q_status}.items() if v is not None},
                **kwargs,
            )
            response.raise_for_status()
            return response.json()
    async def deletePetId(self, p_pet_id: int | None, h_apikey: str | None, **kwargs) -> dict:
        async with httpx.AsyncClient() as client:
            response = await client.delete(
                f"{self._base_url}/pet/{p_pet_id}",
                headers={'api_key': h_apikey},
                **kwargs,
            )
            response.raise_for_status()
            return response.json()
    async def postPetIdUploadImage(self, body: str | None, p_pet_id: int | None, q_additional_metadata: str | None = None, **kwargs) -> ApiResponse:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self._base_url}/pet/{p_pet_id}/uploadImage",
                json=body.model_dump() if hasattr(body, 'model_dump') else body,
                params={k: v for k, v in {"additionalMetadata": q_additional_metadata}.items() if v is not None},
                **kwargs,
            )
            response.raise_for_status()
            return response.json()