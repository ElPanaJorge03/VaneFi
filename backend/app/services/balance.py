from decimal import Decimal
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.month import Month
from app.models.expense import Expense
from app.models.additional_income import AdditionalIncome

ALERTA_UMBRAL = Decimal("0.80")

def calcular_resumen_mes(month_id: int, db: Session) -> dict:
    """
    Calcula todos los valores derivados de un mes:
    - total_gastos
    - total_ingresos_adicionales
    - ahorro (ingreso + ingresos_adicionales - gastos - retención)
    - porcentaje_gastado
    - alerta (True si gastos > 80% del ingreso mensual)
    - pronosticado (promedio de gastos de meses anteriores del mismo usuario)
    """
    month = db.query(Month).filter(Month.id == month_id).first()
    if not month:
        return {}

    total_gastos = db.query(func.sum(Expense.monto)).filter(
        Expense.mes_id == month_id
    ).scalar() or Decimal("0")

    total_ingresos_adicionales = db.query(func.sum(AdditionalIncome.monto)).filter(
        AdditionalIncome.mes_id == month_id
    ).scalar() or Decimal("0")

    ingreso = month.ingreso_mensual
    retencion = month.retencion
    ahorro = ingreso + total_ingresos_adicionales - total_gastos - retencion
    porcentaje_gastado = (total_gastos / ingreso * 100) if ingreso > 0 else Decimal("0")
    alerta = porcentaje_gastado >= (ALERTA_UMBRAL * 100)

    # Pronosticado: promedio de total_gastos de meses anteriores del mismo usuario
    meses_anteriores = db.query(Month).filter(
        Month.usuario_id == month.usuario_id,
        Month.id != month_id
    ).all()

    pronosticado = Decimal("0")
    if meses_anteriores:
        totales = []
        for m in meses_anteriores:
            total = db.query(func.sum(Expense.monto)).filter(
                Expense.mes_id == m.id
            ).scalar() or Decimal("0")
            totales.append(total)
        pronosticado = sum(totales) / len(totales)

    return {
        "mes_id": month_id,
        "ingreso_mensual": ingreso,
        "retencion": retencion,
        "total_gastos": total_gastos,
        "total_ingresos_adicionales": total_ingresos_adicionales,
        "ahorro": ahorro,
        "porcentaje_gastado": round(porcentaje_gastado, 2),
        "alerta": alerta,
        "pronosticado": round(pronosticado, 2),
    }
