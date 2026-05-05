from enum import Enum


class Status(str, Enum):
    placed = 'placed'
    approved = 'approved'
    delivered = 'delivered'