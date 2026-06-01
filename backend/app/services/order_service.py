from decimal import Decimal

from fastapi import HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.models.inventory_log import InventoryLog
from app.models.order import Order, OrderItem, OrderStatus
from app.models.product import Product
from app.schemas.order import OrderCreate, OrderItemResponse, OrderResponse


def _build_order_response(order: Order) -> OrderResponse:
    return OrderResponse(
        id=order.id,
        customer_id=order.customer_id,
        customer_name=order.customer.full_name,
        total_amount=order.total_amount,
        status=order.status,
        order_date=order.order_date,
        items=[
            OrderItemResponse(
                id=item.id,
                product_id=item.product_id,
                product_name=item.product.name,
                quantity=item.quantity,
                unit_price=item.unit_price,
                subtotal=item.subtotal,
            )
            for item in order.items
        ],
    )


def get_order(db: Session, order_id: int) -> Order | None:
    return (
        db.query(Order)
        .options(joinedload(Order.items).joinedload(OrderItem.product), joinedload(Order.customer))
        .filter(Order.id == order_id)
        .first()
    )


def list_orders(
    db: Session, page: int = 1, page_size: int = 10, status_filter: OrderStatus | None = None
) -> tuple[list[Order], int]:
    query = db.query(Order).options(
        joinedload(Order.items).joinedload(OrderItem.product), joinedload(Order.customer)
    )
    if status_filter:
        query = query.filter(Order.status == status_filter)
    total = query.count()
    items = (
        query.order_by(Order.order_date.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )
    return items, total


def create_order(db: Session, data: OrderCreate) -> Order:
    from app.services.customer_service import get_customer

    customer = get_customer(db, data.customer_id)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    products_map: dict[int, Product] = {}
    total = Decimal("0")
    line_items: list[tuple[Product, int, Decimal]] = []

    for item in data.items:
        product = db.query(Product).filter(Product.id == item.product_id).with_for_update().first()
        if not product:
            raise HTTPException(
                status_code=404,
                detail=f"Product with id {item.product_id} not found",
            )
        if product.quantity < item.quantity:
            raise HTTPException(
                status_code=400,
                detail=f"Insufficient stock for '{product.name}'. Available: {product.quantity}, Requested: {item.quantity}",
            )
        products_map[product.id] = product
        subtotal = product.price * item.quantity
        total += subtotal
        line_items.append((product, item.quantity, product.price))

    order = Order(customer_id=data.customer_id, total_amount=total, status=OrderStatus.pending)
    db.add(order)
    db.flush()

    for product, qty, unit_price in line_items:
        subtotal = unit_price * qty
        order_item = OrderItem(
            order_id=order.id,
            product_id=product.id,
            quantity=qty,
            unit_price=unit_price,
            subtotal=subtotal,
        )
        db.add(order_item)

        prev_qty = product.quantity
        product.quantity -= qty
        log = InventoryLog(
            product_id=product.id,
            change_amount=-qty,
            previous_quantity=prev_qty,
            new_quantity=product.quantity,
            reason="Order placement",
            notes=f"Order #{order.id}",
        )
        db.add(log)

    db.commit()
    db.refresh(order)
    return get_order(db, order.id)


def update_order_status(db: Session, order: Order, new_status: OrderStatus) -> Order:
    if order.status == OrderStatus.cancelled:
        raise HTTPException(status_code=400, detail="Cannot update a cancelled order")
    if new_status == OrderStatus.cancelled and order.status != OrderStatus.cancelled:
        _restore_inventory(db, order)
    order.status = new_status
    db.commit()
    return get_order(db, order.id)


def cancel_order(db: Session, order: Order) -> Order:
    if order.status == OrderStatus.cancelled:
        raise HTTPException(status_code=400, detail="Order is already cancelled")
    if order.status == OrderStatus.completed:
        raise HTTPException(status_code=400, detail="Cannot cancel a completed order")
    _restore_inventory(db, order)
    order.status = OrderStatus.cancelled
    db.commit()
    return get_order(db, order.id)


def _restore_inventory(db: Session, order: Order) -> None:
    for item in order.items:
        product = db.query(Product).filter(Product.id == item.product_id).with_for_update().first()
        if product:
            prev_qty = product.quantity
            product.quantity += item.quantity
            db.add(
                InventoryLog(
                    product_id=product.id,
                    change_amount=item.quantity,
                    previous_quantity=prev_qty,
                    new_quantity=product.quantity,
                    reason="Order cancellation",
                    notes=f"Order #{order.id} cancelled",
                )
            )
