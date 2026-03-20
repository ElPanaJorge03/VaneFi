# ============================================
# Etapa 1: Build del Frontend
# ============================================
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# ============================================
# Etapa 2: Backend + Frontend estático
# ============================================
FROM python:3.11-slim

WORKDIR /app

# Instalar dependencias del sistema para psycopg2
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq-dev gcc \
    && rm -rf /var/lib/apt/lists/*

# Instalar dependencias de Python
COPY backend/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copiar código del backend
COPY backend/ ./

# Copiar frontend construido a la carpeta static
COPY --from=frontend-builder /app/frontend/dist ./static

# Puerto dinámico de Railway
ENV PORT=8000
EXPOSE $PORT

# Arrancar con gunicorn
CMD gunicorn app.main:app \
    --workers 2 \
    --worker-class uvicorn.workers.UvicornWorker \
    --bind 0.0.0.0:$PORT
