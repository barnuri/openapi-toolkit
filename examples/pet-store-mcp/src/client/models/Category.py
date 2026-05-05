from pydantic import BaseModel, ConfigDict

class Category(BaseModel):
    id: int | None = None
    name: str | None = None