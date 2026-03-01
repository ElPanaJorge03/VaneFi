from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.month import Month
from app.models.expense import Expense
from app.schemas.expense import ExpenseCreate, ExpenseOut
from app.core.dependencies import get_current_user

router = APIRouter(prefix="/months/{month_id}/expenses", tags=["Gastos"])

def get_user_month(month_id: int, current_user: User, db: Session) -> Month:
    month = db.query(Month).filter(
        Month.id == month_id,
        Month.usuario_id == current_user.id
    ).first()
    if not month:
        raise HTTPException(status_code=404, detail="Mes no encontrado")
    return month

@router.get("/", response_model=list[ExpenseOut])
def list_expenses(
    month_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    get_user_month(month_id, current_user, db)
    return db.query(Expense).filter(Expense.mes_id == month_id).order_by(Expense.fecha).all()

@router.post("/", response_model=ExpenseOut, status_code=status.HTTP_201_CREATED)
def create_expense(
    month_id: int,
    data: ExpenseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    get_user_month(month_id, current_user, db)
    expense = Expense(mes_id=month_id, **data.model_dump())
    db.add(expense)
    db.commit()
    db.refresh(expense)
    return expense

@router.delete("/{expense_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_expense(
    month_id: int,
    expense_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    get_user_month(month_id, current_user, db)
    expense = db.query(Expense).filter(
        Expense.id == expense_id,
        Expense.mes_id == month_id
    ).first()
    if not expense:
        raise HTTPException(status_code=404, detail="Gasto no encontrado")
    db.delete(expense)
    db.commit()
