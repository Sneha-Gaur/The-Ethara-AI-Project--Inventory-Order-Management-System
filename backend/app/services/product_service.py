import math

from sqlalchemy.orm import Session

from app.models.product import Product
from app.schemas.product import ProductCreate, ProductUpdate


def get_product(db: Session, product_id: int) -> Product | None:
    return db.query(Product).filter(Product.id == product_id).first()


def get_product_by_sku(db: Session, sku: str) -> Product | None:
    return db.query(Product).filter(Product.sku == sku).first()


def list_products(
    db: Session,
    page: int = 1,
    page_size: int = 10,
    search: str | None = None,
    category: str | None = None,
) -> tuple[list[Product], int]:
    query = db.query(Product)
    if search:
        term = f"%{search}%"
        query = query.filter(
            (Product.name.ilike(term)) | (Product.sku.ilike(term)) | (Product.description.ilike(term))
        )
    if category:
        query = query.filter(Product.category == category)
    total = query.count()
    items = (
        query.order_by(Product.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )
    return items, total


def create_product(db: Session, data: ProductCreate) -> Product:
    product = Product(**data.model_dump())
    db.add(product)
    db.commit()
    db.refresh(product)
    return product


def update_product(db: Session, product: Product, data: ProductUpdate) -> Product:
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(product, key, value)
    db.commit()
    db.refresh(product)
    return product


def delete_product(db: Session, product: Product) -> None:
    db.delete(product)
    db.commit()


def list_featured_products(db: Session, limit: int = 8) -> list[Product]:
    return (
        db.query(Product)
        .filter(Product.is_featured.is_(True))
        .order_by(Product.created_at.desc())
        .limit(limit)
        .all()
    )


def list_public_products(db: Session, page: int = 1, page_size: int = 12) -> tuple[list[Product], int]:
    query = db.query(Product).order_by(Product.is_featured.desc(), Product.created_at.desc())
    total = query.count()
    items = query.offset((page - 1) * page_size).limit(page_size).all()
    return items, total


def paginate_meta(total: int, page: int, page_size: int) -> dict:
    return {
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": max(1, math.ceil(total / page_size)) if total else 1,
    }
