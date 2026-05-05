from mcp_server import get_client
from client.models.Order import Order

async def getInventory() -> dict:
    """GET /store/inventory"""
    client = get_client()
    return await client.StoreController.getInventory()


async def postOrder(body: Order | None, ) -> dict:
    """POST /store/order"""
    client = get_client()
    return await client.StoreController.postOrder(body=body)


async def getOrderOrderId(p_order_id: int | None, ) -> dict:
    """GET /store/order/{orderId}"""
    client = get_client()
    return await client.StoreController.getOrderOrderId(p_order_id=p_order_id)


async def deleteOrderOrderId(p_order_id: int | None, ) -> dict:
    """DELETE /store/order/{orderId}"""
    client = get_client()
    return await client.StoreController.deleteOrderOrderId(p_order_id=p_order_id)


TOOLS = [getInventory, postOrder, getOrderOrderId, deleteOrderOrderId]
