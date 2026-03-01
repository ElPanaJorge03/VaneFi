from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.month import Month
from app.services.balance import calcular_resumen_mes
from app.core.dependencies import get_current_user

router = APIRouter(prefix="/months/{month_id}/summary", tags=["Resumen / Balance"])

@router.get("/")
def get_summary(
    month_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    month = db.query(Month).filter(
        Month.id == month_id,
        Month.usuario_id == current_user.id
    ).first()
    if not month:
        raise HTTPException(status_code=404, detail="Mes no encontrado")

    return calcular_resumen_mes(month_id, db)
