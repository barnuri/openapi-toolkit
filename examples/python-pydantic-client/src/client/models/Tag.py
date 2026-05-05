from pydantic import BaseModel, ConfigDict

class Tag(BaseModel):
    id: int | None = None
    name: str | None = None