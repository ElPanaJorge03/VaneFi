from pydantic import BaseModel, field_validator
from decimal import Decimal
from datetime import date
from app.models.expense import ConceptoGasto, FormaPago

class ExpenseCreate(BaseModel):
    fecha: date
    concepto: ConceptoGasto
    monto: Decimal
    forma_pago: FormaPago

    @field_validator("monto")
    @classmethod
    def monto_positivo(cls, v):
        if v <= 0:
            raise ValueError("El monto debe ser mayor a 0")
        return v

class ExpenseOut(BaseModel):
    id: int
    fecha: date
    concepto: ConceptoGasto
    monto: Decimal
    forma_pago: FormaPago

    class Config:
        from_attributes = True
