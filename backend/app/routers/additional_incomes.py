from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.month import Month
from app.models.additional_income import AdditionalIncome
from app.schemas.additional_income import AdditionalIncomeCreate, AdditionalIncomeOut
from app.core.dependencies import get_current_user

router = APIRouter(prefix="/months/{month_id}/incomes", tags=["Ingresos Adicionales"])

def get_user_month(month_id: int, current_user: User, db: Session) -> Month:
    month = db.query(Month).filter(
        Month.id == month_id,
        Month.usuario_id == current_user.id
    ).first()
    if not month:
        raise HTTPException(status_code=404, detail="Mes no encontrado")
    return month

@router.get("/", response_model=list[AdditionalIncomeOut])
def list_incomes(
    month_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    get_user_month(month_id, current_user, db)
    return db.query(AdditionalIncome).filter(
        AdditionalIncome.mes_id == month_id
    ).order_by(AdditionalIncome.fecha).all()

@router.post("/", response_model=AdditionalIncomeOut, status_code=status.HTTP_201_CREATED)
def create_income(
    month_id: int,
    data: AdditionalIncomeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    get_user_month(month_id, current_user, db)
    income = AdditionalIncome(mes_id=month_id, **data.model_dump())
    db.add(income)
    db.commit()
    db.refresh(income)
    return income

@router.delete("/{income_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_income(
    month_id: int,
    income_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    get_user_month(month_id, current_user, db)
    income = db.query(AdditionalIncome).filter(
        AdditionalIncome.id == income_id,
        AdditionalIncome.mes_id == month_id
    ).first()
    if not income:
        raise HTTPException(status_code=404, detail="Ingreso no encontrado")
    db.delete(income)
    db.commit()
