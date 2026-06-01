from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.user import User
from app.schemas.product import ProductCreate, ProductListResponse, ProductResponse, ProductUpdate
from app.services import product_service
from app.utils.deps import get_current_user

router = APIRouter(prefix="/api/products", tags=["Products"])


@router.get("", response_model=ProductListResponse)
def list_products(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    search: str | None = None,
    category: str | None = None,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    items, total = product_service.list_products(db, page, page_size, search, category)
    meta = product_service.paginate_meta(total, page, page_size)
    return ProductListResponse(items=items, **meta)


@router.get("/featured", response_model=list[ProductResponse])
def featured_products(
    limit: int = Query(8, ge=1, le=20),
    db: Session = Depends(get_db),
):
    """Public featured products for home page (no auth required)."""
    return product_service.list_featured_products(db, limit)


@router.get("/public", response_model=ProductListResponse)
def public_catalog(
    page: int = Query(1, ge=1),
    page_size: int = Query(12, ge=1, le=50),
    db: Session = Depends(get_db),
):
    """Public product catalog (no auth required)."""
    items, total = product_service.list_public_products(db, page, page_size)
    meta = product_service.paginate_meta(total, page, page_size)
    return ProductListResponse(items=items, **meta)


@router.get("/categories")
def get_categories(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    from app.models.product import Product
    from sqlalchemy import distinct

    cats = db.query(distinct(Product.category)).all()
    return [c[0] for c in cats]


@router.get("/public/{product_id}", response_model=ProductResponse)
def get_public_product(product_id: int, db: Session = Depends(get_db)):
    """Public product/property detail (no auth required)."""
    product = product_service.get_product(db, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@router.get("/{product_id}", response_model=ProductResponse)
def get_product(product_id: int, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    product = product_service.get_product(db, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@router.post("", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
def create_product(
    data: ProductCreate, db: Session = Depends(get_db), _: User = Depends(get_current_user)
):
    if product_service.get_product_by_sku(db, data.sku):
        raise HTTPException(status_code=400, detail="SKU already exists")
    return product_service.create_product(db, data)


@router.put("/{product_id}", response_model=ProductResponse)
def update_product(
    product_id: int,
    data: ProductUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    product = product_service.get_product(db, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    if data.sku and data.sku != product.sku:
        existing = product_service.get_product_by_sku(db, data.sku)
        if existing:
            raise HTTPException(status_code=400, detail="SKU already exists")
    return product_service.update_product(db, product, data)


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(
    product_id: int, db: Session = Depends(get_db), _: User = Depends(get_current_user)
):
    product = product_service.get_product(db, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    product_service.delete_product(db, product)
