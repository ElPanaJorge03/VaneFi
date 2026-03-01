from sqlalchemy import Column, Integer, ForeignKey, Numeric, Date, String, Enum
from sqlalchemy.orm import relationship
from app.database import Base
import enum

class ConceptoGasto(str, enum.Enum):
    comida = "Comida"
    gasolina = "Gasolina"
    deuda = "Deuda"
    pago_servicio = "Pago servicio"
    otro = "Otro"

class FormaPago(str, enum.Enum):
    efectivo = "Efectivo"
    digital = "Digital"

class Expense(Base):
    __tablename__ = "expenses"

    id = Column(Integer, primary_key=True, index=True)
    mes_id = Column(Integer, ForeignKey("months.id"), nullable=False)
    fecha = Column(Date, nullable=False)
    concepto = Column(Enum(ConceptoGasto), nullable=False)
    monto = Column(Numeric(12, 2), nullable=False)
    forma_pago = Column(Enum(FormaPago), nullable=False)

    mes = relationship("Month", back_populates="gastos")
