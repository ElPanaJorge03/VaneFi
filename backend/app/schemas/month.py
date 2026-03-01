from pydantic import BaseModel, field_validator
from decimal import Decimal
from datetime import datetime

class MonthCreate(BaseModel):
    anio: int
    mes: int
    ingreso_mensual: Decimal
    retencion: Decimal = Decimal("0")

    @field_validator("mes")
    @classmethod
    def mes_valido(cls, v):
        if not 1 <= v <= 12:
            raise ValueError("El mes debe estar entre 1 y 12")
        return v

    @field_validator("ingreso_mensual")
    @classmethod
    def ingreso_positivo(cls, v):
        if v <= 0:
            raise ValueError("El ingreso mensual debe ser mayor a 0")
        return v

class MonthUpdate(BaseModel):
    ingreso_mensual: Decimal | None = None
    retencion: Decimal | None = None

class MonthOut(BaseModel):
    id: int
    anio: int
    mes: int
    ingreso_mensual: Decimal
    retencion: Decimal
    creado_en: datetime

    class Config:
        from_attributes = True
