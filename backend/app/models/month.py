from sqlalchemy import Column, Integer, ForeignKey, Numeric, DateTime, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class Month(Base):
    __tablename__ = "months"

    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    anio = Column(Integer, nullable=False)
    mes = Column(Integer, nullable=False)                          # 1-12
    ingreso_mensual = Column(Numeric(12, 2), nullable=False)
    retencion = Column(Numeric(12, 2), nullable=False, default=0)
    creado_en = Column(DateTime(timezone=True), server_default=func.now())

    # Restricción: un solo registro por usuario/año/mes
    __table_args__ = (UniqueConstraint("usuario_id", "anio", "mes", name="uq_usuario_anio_mes"),)

    usuario = relationship("User", back_populates="meses")
    gastos = relationship("Expense", back_populates="mes", cascade="all, delete-orphan")
    ingresos_adicionales = relationship("AdditionalIncome", back_populates="mes", cascade="all, delete-orphan")
