from sqlalchemy import Column, Integer, ForeignKey, Numeric, Date, String
from sqlalchemy.orm import relationship
from app.database import Base

class AdditionalIncome(Base):
    __tablename__ = "additional_incomes"

    id = Column(Integer, primary_key=True, index=True)
    mes_id = Column(Integer, ForeignKey("months.id"), nullable=False)
    fecha = Column(Date, nullable=False)
    concepto = Column(String, nullable=False)   # Texto libre
    monto = Column(Numeric(12, 2), nullable=False)

    mes = relationship("Month", back_populates="ingresos_adicionales")
