from .controllers.PetController import PetController
from .controllers.StoreController import StoreController
from .controllers.UserController import UserController
import os


class Client:
    def __init__(self, base_url: str | None = None) -> None:
        base_url = base_url or os.environ.get("BASE_URL", "")
        self.PetController = PetController(base_url)
        self.StoreController = StoreController(base_url)
        self.UserController = UserController(base_url)
