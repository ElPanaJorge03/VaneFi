#!/bin/bash
# Script de build para Railway
# Instala las dependencias del frontend, construye, y copia al backend

echo "=== Instalando dependencias del backend ==="
cd backend
pip install -r requirements.txt

echo "=== Construyendo frontend ==="
cd ../frontend
npm install
npm run build

echo "=== Copiando frontend al backend ==="
mkdir -p ../backend/static
cp -r dist/* ../backend/static/

echo "=== Build completado ==="
ls -la ../backend/static/
