from decimal import Decimal
from typing import Any

from pydantic import BaseModel


class ReportSummary(BaseModel):
    total_products: int
    total_customers: int
    total_orders: int
    total_revenue: Decimal
    low_stock_products: list[dict[str, Any]]
    orders_by_status: dict[str, int]
    revenue_by_month: list[dict[str, Any]]
    top_products: list[dict[str, Any]]
