import httpx
from ..models.Order import Order

class StoreController:
    def __init__(self, base_url: str) -> None:
        self._base_url = base_url

    async def getInventory(self, **kwargs) -> dict[str, int]:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self._base_url}/store/inventory",
                **kwargs,
            )
            response.raise_for_status()
            return response.json()
    async def postOrder(self, body: Order | None, **kwargs) -> Order:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self._base_url}/store/order",
                json=body.model_dump() if hasattr(body, 'model_dump') else body,
                **kwargs,
            )
            response.raise_for_status()
            return response.json()
    async def getOrderOrderId(self, p_order_id: int | None, **kwargs) -> Order:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self._base_url}/store/order/{p_order_id}",
                **kwargs,
            )
            response.raise_for_status()
            return response.json()
    async def deleteOrderOrderId(self, p_order_id: int | None, **kwargs) -> dict:
        async with httpx.AsyncClient() as client:
            response = await client.delete(
                f"{self._base_url}/store/order/{p_order_id}",
                **kwargs,
            )
            response.raise_for_status()
            return response.json()