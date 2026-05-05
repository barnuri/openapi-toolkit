from pydantic import BaseModel, ConfigDict

class ApiResponse(BaseModel):
    code: int | None = None
    type: str | None = None
    message: str | None = None