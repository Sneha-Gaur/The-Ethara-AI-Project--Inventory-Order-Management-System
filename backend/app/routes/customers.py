from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.user import User
from app.schemas.customer import (
    CustomerCreate,
    CustomerListResponse,
    CustomerResponse,
    CustomerUpdate,
)
from app.services import customer_service, product_service
from app.utils.deps import get_current_user

router = APIRouter(prefix="/api/customers", tags=["Customers"])


@router.get("", response_model=CustomerListResponse)
def list_customers(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    search: str | None = None,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    items, total = customer_service.list_customers(db, page, page_size, search)
    meta = product_service.paginate_meta(total, page, page_size)
    return CustomerListResponse(items=items, **meta)


@router.get("/{customer_id}", response_model=CustomerResponse)
def get_customer(
    customer_id: int, db: Session = Depends(get_db), _: User = Depends(get_current_user)
):
    customer = customer_service.get_customer(db, customer_id)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    return customer


@router.post("", response_model=CustomerResponse, status_code=status.HTTP_201_CREATED)
def create_customer(
    data: CustomerCreate, db: Session = Depends(get_db), _: User = Depends(get_current_user)
):
    if customer_service.get_customer_by_email(db, data.email):
        raise HTTPException(status_code=400, detail="Email already exists")
    return customer_service.create_customer(db, data)


@router.put("/{customer_id}", response_model=CustomerResponse)
def update_customer(
    customer_id: int,
    data: CustomerUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    customer = customer_service.get_customer(db, customer_id)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    if data.email and data.email != customer.email:
        existing = customer_service.get_customer_by_email(db, data.email)
        if existing:
            raise HTTPException(status_code=400, detail="Email already exists")
    return customer_service.update_customer(db, customer, data)


@router.delete("/{customer_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_customer(
    customer_id: int, db: Session = Depends(get_db), _: User = Depends(get_current_user)
):
    customer = customer_service.get_customer(db, customer_id)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    customer_service.delete_customer(db, customer)
