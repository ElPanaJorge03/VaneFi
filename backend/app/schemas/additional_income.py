from pydantic import BaseModel, field_validator
from decimal import Decimal
from datetime import date

class AdditionalIncomeCreate(BaseModel):
    fecha: date
    concepto: str
    monto: Decimal

    @field_validator("monto")
    @classmethod
    def monto_positivo(cls, v):
        if v <= 0:
            raise ValueError("El monto debe ser mayor a 0")
        return v

class AdditionalIncomeOut(BaseModel):
    id: int
    fecha: date
    concepto: str
    monto: Decimal

    class Config:
        from_attributes = True
