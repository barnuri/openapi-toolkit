from enum import Enum


class StatusEnum(str, Enum):
    placed = 'placed'
    approved = 'approved'
    delivered = 'delivered'