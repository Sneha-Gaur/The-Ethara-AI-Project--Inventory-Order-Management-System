from sqlalchemy.orm import Session, joinedload

from app.models.inventory_log import InventoryLog
from app.models.product import Product
from app.schemas.inventory import InventoryDashboard, InventoryLogResponse, InventorySummary

LOW_STOCK_THRESHOLD = 10


def get_inventory_dashboard(db: Session, low_threshold: int = LOW_STOCK_THRESHOLD) -> InventoryDashboard:
    products = db.query(Product).order_by(Product.quantity.asc()).all()
    logs = (
        db.query(InventoryLog)
        .options(joinedload(InventoryLog.product))
        .order_by(InventoryLog.created_at.desc())
        .limit(20)
        .all()
    )

    summaries = [
        InventorySummary(
            product_id=p.id,
            product_name=p.name,
            sku=p.sku,
            quantity=p.quantity,
            category=p.category,
            is_low_stock=0 < p.quantity <= low_threshold,
        )
        for p in products
    ]

    return InventoryDashboard(
        total_products=len(products),
        total_stock_units=sum(p.quantity for p in products),
        low_stock_count=sum(1 for p in products if 0 < p.quantity <= low_threshold),
        out_of_stock_count=sum(1 for p in products if p.quantity == 0),
        products=summaries,
        recent_logs=[
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
        ],
    )


def get_low_stock_products(db: Session, threshold: int = LOW_STOCK_THRESHOLD) -> list[Product]:
    return (
        db.query(Product)
        .filter(Product.quantity <= threshold)
        .order_by(Product.quantity.asc())
        .all()
    )


def get_inventory_logs(db: Session, product_id: int | None = None, limit: int = 50) -> list[InventoryLog]:
    query = db.query(InventoryLog).options(joinedload(InventoryLog.product)).order_by(InventoryLog.created_at.desc())
    if product_id:
        query = query.filter(InventoryLog.product_id == product_id)
    return query.limit(limit).all()
