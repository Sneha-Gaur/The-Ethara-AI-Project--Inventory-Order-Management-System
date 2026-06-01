from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.user import User
from app.schemas.inventory import InventoryDashboard, InventoryLogResponse
from app.services import inventory_service
from app.utils.deps import get_current_user

router = APIRouter(prefix="/api/inventory", tags=["Inventory"])


@router.get("/dashboard", response_model=InventoryDashboard)
def inventory_dashboard(
    low_threshold: int = Query(10, ge=1),
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    return inventory_service.get_inventory_dashboard(db, low_threshold)


@router.get("/logs", response_model=list[InventoryLogResponse])
def inventory_logs(
    product_id: int | None = None,
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    logs = inventory_service.get_inventory_logs(db, product_id, limit)
    return [
        InventoryLogResponse(
            id=log.id,
            product_id=log.product_id,
            product_name=log.product.name if log.product else "Unknown",
            change_amount=log.change_amount,
            previous_quantity=log.previous_quantity,
            new_quantity=log.new_quantity,
            reason=log.reason,
            notes=log.notes,
            created_at=log.created_at,
        )
        for log in logs
    ]


@router.get("/low-stock")
def low_stock(
    threshold: int = Query(10, ge=0),
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    products = inventory_service.get_low_stock_products(db, threshold)
    return [
        {"id": p.id, "name": p.name, "sku": p.sku, "quantity": p.quantity, "category": p.category}
        for p in products
    ]
