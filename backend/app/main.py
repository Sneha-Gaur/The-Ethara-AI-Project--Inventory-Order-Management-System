import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import settings
from app.database.session import database_health, init_db
from app.routes import auth, customers, inventory, orders, products, reports

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        init_db()
        logger.info("Database ready: %s", database_health())
    except Exception as e:
        logger.error("DATABASE STARTUP FAILED: %s", e)
        raise
    yield


app = FastAPI(
    title="Inventory & Order Management System API",
    description="REST API for inventory, products, customers, orders, and reports",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    messages = []
    for err in exc.errors():
        loc = " → ".join(str(x) for x in err.get("loc", []) if x != "body")
        messages.append(f"{loc}: {err.get('msg')}" if loc else err.get("msg", "invalid"))
    return JSONResponse(
        status_code=422,
        content={"detail": messages[0] if len(messages) == 1 else "; ".join(messages)},
    )


app.include_router(auth.router)
app.include_router(products.router)
app.include_router(customers.router)
app.include_router(orders.router)
app.include_router(inventory.router)
app.include_router(reports.router)


@app.get("/")
def root():
    return {
        "message": "Inventory & Order Management System API",
        "docs": "/docs",
        "health": "/health",
        "db": "/health/db",
    }


@app.get("/health")
def health():
    return {"status": "healthy"}


@app.get("/health/db")
def health_db():
    return database_health()
