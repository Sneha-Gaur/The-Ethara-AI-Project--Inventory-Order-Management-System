from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.order import OrderStatus
from app.models.user import User
from app.schemas.order import OrderCreate, OrderListResponse, OrderResponse, OrderStatusUpdate
from app.services import order_service, product_service
from app.utils.deps import get_current_user

router = APIRouter(prefix="/api/orders", tags=["Orders"])


def _to_response(order) -> OrderResponse:
    from app.services.order_service import _build_order_response
    return _build_order_response(order)


@router.get("", response_model=OrderListResponse)
def list_orders(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    status_filter: OrderStatus | None = Query(None, alias="status"),
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    items, total = order_service.list_orders(db, page, page_size, status_filter)
    meta = product_service.paginate_meta(total, page, page_size)
    return OrderListResponse(
        items=[_to_response(o) for o in items],
        **meta,
    )


@router.get("/{order_id}", response_model=OrderResponse)
def get_order(order_id: int, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    order = order_service.get_order(db, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return _to_response(order)


@router.post("", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
def create_order(
    data: OrderCreate, db: Session = Depends(get_db), _: User = Depends(get_current_user)
):
    order = order_service.create_order(db, data)
    return _to_response(order)


@router.patch("/{order_id}/status", response_model=OrderResponse)
def update_status(
    order_id: int,
    data: OrderStatusUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    order = order_service.get_order(db, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    order = order_service.update_order_status(db, order, data.status)
    return _to_response(order)


@router.post("/{order_id}/cancel", response_model=OrderResponse)
def cancel_order(
    order_id: int, db: Session = Depends(get_db), _: User = Depends(get_current_user)
):
    order = order_service.get_order(db, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    order = order_service.cancel_order(db, order)
    return _to_response(order)
