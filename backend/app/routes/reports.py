from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.user import User
from app.schemas.reports import ReportSummary
from app.services import report_service
from app.utils.deps import get_current_user

router = APIRouter(prefix="/api/reports", tags=["Reports"])


@router.get("/summary", response_model=ReportSummary)
def report_summary(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    return report_service.get_report_summary(db)
