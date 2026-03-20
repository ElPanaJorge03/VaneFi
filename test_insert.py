import os
from dotenv import load_dotenv

load_dotenv('backend/.env')

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from decimal import Decimal
from datetime import date
import sys
sys.path.insert(0, os.path.abspath('backend'))
from app.models.expense import Expense, ConceptoGasto, FormaPago

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    print("NO DB URL")
    sys.exit(1)

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

db = SessionLocal()
expense = Expense(
    mes_id=1,
    fecha=date(2026, 3, 1),
    concepto=ConceptoGasto.comida,
    monto=Decimal("500000"),
    forma_pago=FormaPago.efectivo
)
db.add(expense)
db.commit()
db.refresh(expense)
print(f"Inserted: {expense.monto}")
db.close()
