from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class InventoryLogResponse(BaseModel):
    id: int
    product_id: int
    product_name: str
    change_amount: int
    previous_quantity: int
    new_quantity: int
    reason: str
    notes: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class InventorySummary(BaseModel):
    product_id: int
    product_name: str
    sku: str
    quantity: int
    category: str
    is_low_stock: bool


class InventoryDashboard(BaseModel):
    total_products: int
    total_stock_units: int
    low_stock_count: int
    out_of_stock_count: int
    products: list[InventorySummary]
    recent_logs: list[InventoryLogResponse]
