from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.month import Month
from app.schemas.month import MonthCreate, MonthOut, MonthUpdate
from app.core.dependencies import get_current_user

router = APIRouter(prefix="/months", tags=["Meses"])

@router.post("/", response_model=MonthOut, status_code=status.HTTP_201_CREATED)
def create_month(
    data: MonthCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    existing = db.query(Month).filter(
        Month.usuario_id == current_user.id,
        Month.anio == data.anio,
        Month.mes == data.mes
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Ya existe un registro para ese mes y año")

    month = Month(
        usuario_id=current_user.id,
        anio=data.anio,
        mes=data.mes,
        ingreso_mensual=data.ingreso_mensual,
        retencion=data.retencion
    )
    db.add(month)
    db.commit()
    db.refresh(month)
    return month

@router.get("/", response_model=list[MonthOut])
def list_months(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(Month).filter(Month.usuario_id == current_user.id).order_by(
        Month.anio.desc(), Month.mes.desc()
    ).all()

@router.get("/{month_id}", response_model=MonthOut)
def get_month(
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
    return month

@router.patch("/{month_id}", response_model=MonthOut)
def update_month(
    month_id: int,
    data: MonthUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    month = db.query(Month).filter(
        Month.id == month_id,
        Month.usuario_id == current_user.id
    ).first()
    if not month:
        raise HTTPException(status_code=404, detail="Mes no encontrado")

    if data.ingreso_mensual is not None:
        month.ingreso_mensual = data.ingreso_mensual
    if data.retencion is not None:
        month.retencion = data.retencion

    db.commit()
    db.refresh(month)
    return month

@router.delete("/{month_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_month(
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
    
    db.delete(month)
    db.commit()
    return None
