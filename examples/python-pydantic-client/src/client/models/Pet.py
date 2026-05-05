from ..models.Category import Category
from ..models.Tag import Tag
from ..models.StatusEnum import StatusEnum
from pydantic import BaseModel, ConfigDict

class Pet(BaseModel):
    id: int | None = None
    name: str = None
    category: Category | None = None
    photoUrls: list[str] | None = None
    tags: list[Tag] | None = None
    status: StatusEnum | None = None