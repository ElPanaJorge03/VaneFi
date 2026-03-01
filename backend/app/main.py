from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import Base, engine
import app.models  # noqa: F401 — Importa todos los modelos para que SQLAlchemy los registre

from app.routers import auth, months, expenses, additional_incomes, summary

# Crear tablas automáticamente al iniciar (sin Alembic en desarrollo local)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="VaneFi API",
    description="API de gestión financiera personal",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173", 
        "http://127.0.0.1:5173", 
        "http://192.168.1.18:5173",
        "http://192.168.1.2:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(months.router)
app.include_router(expenses.router)
app.include_router(additional_incomes.router)
app.include_router(summary.router)

@app.get("/")
def root():
    return {"message": "VaneFi API funcionando correctamente"}
