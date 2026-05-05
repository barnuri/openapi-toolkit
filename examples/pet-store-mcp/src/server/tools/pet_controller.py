from mcp_server import get_client
from client.models.Pet import Pet

async def putPet(body: Pet, ) -> dict:
    """PUT /pet"""
    client = get_client()
    return await client.PetController.putPet(body=body)


async def postPet(body: Pet, ) -> dict:
    """POST /pet"""
    client = get_client()
    return await client.PetController.postPet(body=body)


async def getFindByStatus(q_status: str | None = None, ) -> dict:
    """GET /pet/findByStatus"""
    client = get_client()
    return await client.PetController.getFindByStatus(q_status=q_status)


async def getFindByTags(q_tags: list[str] | None = None, ) -> dict:
    """GET /pet/findByTags"""
    client = get_client()
    return await client.PetController.getFindByTags(q_tags=q_tags)


async def getPetId(p_pet_id: int | None, ) -> dict:
    """GET /pet/{petId}"""
    client = get_client()
    return await client.PetController.getPetId(p_pet_id=p_pet_id)


async def postPetId(p_pet_id: int | None, q_name: str | None = None, q_status: str | None = None, ) -> dict:
    """POST /pet/{petId}"""
    client = get_client()
    return await client.PetController.postPetId(p_pet_id=p_pet_id, q_name=q_name, q_status=q_status)


async def deletePetId(p_pet_id: int | None, h_apikey: str | None, ) -> dict:
    """DELETE /pet/{petId}"""
    client = get_client()
    return await client.PetController.deletePetId(p_pet_id=p_pet_id, h_apikey=h_apikey)


async def postPetIdUploadImage(body: str | None, p_pet_id: int | None, q_additional_metadata: str | None = None, ) -> dict:
    """POST /pet/{petId}/uploadImage"""
    client = get_client()
    return await client.PetController.postPetIdUploadImage(body=body, p_pet_id=p_pet_id, q_additional_metadata=q_additional_metadata)


TOOLS = [putPet, postPet, getFindByStatus, getFindByTags, getPetId, postPetId, deletePetId, postPetIdUploadImage]
