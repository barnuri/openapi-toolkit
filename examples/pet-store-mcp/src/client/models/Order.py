from ..models.StatusEnum import StatusEnum
from datetime import datetime
from pydantic import BaseModel, ConfigDict

class Order(BaseModel):
    id: int | None = None
    petId: int | None = None
    quantity: int | None = None
    shipDate: datetime | None = None
    status: StatusEnum | None = None
    complete: bool | None = None