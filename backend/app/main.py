import os
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from app.database import Base, engine
import app.models  # noqa: F401 — Importa todos los modelos para que SQLAlchemy los registre

from app.routers import auth, months, expenses, additional_incomes, summary

# Crear tablas automáticamente al iniciar
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="VaneFi API",
    description="API de gestión financiera personal",
    version="1.0.0"
)

# CORS - permitir orígenes en desarrollo y producción
allowed_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://192.168.1.18:5173",
    "http://192.168.1.2:5173",
]

# Agregar el dominio de Railway en producción si existe
railway_url = os.getenv("RAILWAY_PUBLIC_DOMAIN")
if railway_url:
    allowed_origins.append(f"https://{railway_url}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Registrar routers de la API
app.include_router(auth.router)
app.include_router(months.router)
app.include_router(expenses.router)
app.include_router(additional_incomes.router)
app.include_router(summary.router)

@app.get("/api/health")
def health_check():
    return {"status": "ok", "message": "VaneFi API funcionando correctamente"}

# Servir frontend estático en producción
STATIC_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "static")

if os.path.isdir(STATIC_DIR):
    app.mount("/assets", StaticFiles(directory=os.path.join(STATIC_DIR, "assets")), name="static-assets")

    @app.get("/{full_path:path}")
    async def serve_frontend(request: Request, full_path: str):
        """Sirve el frontend React — cualquier ruta no-API devuelve index.html (SPA)"""
        file_path = os.path.join(STATIC_DIR, full_path)
        if full_path and os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(STATIC_DIR, "index.html"))
