from collections import defaultdict
from decimal import Decimal

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.customer import Customer
from app.models.order import Order, OrderItem, OrderStatus
from app.models.product import Product
from app.schemas.reports import ReportSummary
from app.services.inventory_service import get_low_stock_products


def get_report_summary(db: Session) -> ReportSummary:
    total_products = db.query(func.count(Product.id)).scalar() or 0
    total_customers = db.query(func.count(Customer.id)).scalar() or 0
    total_orders = db.query(func.count(Order.id)).scalar() or 0
    total_revenue = db.query(func.coalesce(func.sum(Order.total_amount), 0)).filter(
        Order.status != OrderStatus.cancelled
    ).scalar() or Decimal("0")

    low_stock = get_low_stock_products(db)
    low_stock_products = [
        {"id": p.id, "name": p.name, "sku": p.sku, "quantity": p.quantity, "category": p.category}
        for p in low_stock
    ]

    status_counts = (
        db.query(Order.status, func.count(Order.id)).group_by(Order.status).all()
    )
    orders_by_status = {str(s.value): c for s, c in status_counts}

    completed_orders = (
        db.query(Order).filter(Order.status == OrderStatus.completed).all()
    )
    monthly: dict[str, Decimal] = defaultdict(lambda: Decimal("0"))
    for o in completed_orders:
        key = o.order_date.strftime("%Y-%m")
        monthly[key] += o.total_amount
    revenue_by_month = [{"month": k, "revenue": float(v)} for k, v in sorted(monthly.items())]

    top = (
        db.query(
            Product.id,
            Product.name,
            func.sum(OrderItem.quantity).label("total_sold"),
        )
        .join(OrderItem, OrderItem.product_id == Product.id)
        .join(Order, Order.id == OrderItem.order_id)
        .filter(Order.status != OrderStatus.cancelled)
        .group_by(Product.id, Product.name)
        .order_by(func.sum(OrderItem.quantity).desc())
        .limit(5)
        .all()
    )
    top_products = [
        {"product_id": r[0], "name": r[1], "total_sold": int(r[2] or 0)} for r in top
    ]

    return ReportSummary(
        total_products=total_products,
        total_customers=total_customers,
        total_orders=total_orders,
        total_revenue=Decimal(str(total_revenue)),
        low_stock_products=low_stock_products,
        orders_by_status=orders_by_status,
        revenue_by_month=revenue_by_month,
        top_products=top_products,
    )
