# VaneFi - Personal Finance Dashboard 🚀

VaneFi es una aplicación de gestión financiera personal diseñada para ofrecer una experiencia fluida, rápida y similar a una aplicación nativa desde cualquier dispositivo móvil o de escritorio.

## Características Principales (MVP) 🌟
- **Autenticación Segura:** Sistema de registro e inicio de sesión con JWT.
- **Visualización por Calendario:** Panel interactivo que muestra tus movimientos organizados por días y meses.
- **Gestión de Presupuestos:** Configuración de ingresos base mensuales.
- **Retención Intocable (Ahorro Automático):** Sistema para definir y proteger un porcentaje de tus ingresos como ahorro fijo.
- **Balance Histórico:** Seguimiento de sobrantes y ahorros acumulados a través de todos los meses de uso.
- **Movimientos Detallados:** Creación y eliminación de gastos con categorización.
- **Diseño "App Nativa":** Interfaz "Dark Mode" con una navegación fluida, anti-zoom y optimizada milimétricamente para pantallas móviles.

## Arquitectura Tecnológica 🏗️
VaneFi está estructurado en un modelo Cliente-Servidor moderno:

### Backend (API Rest)
- **Framework:** FastAPI (Python)
- **Base de Datos:** SQLite / PostgreSQL (Vía SQLAlchemy)
- **Autenticación:** JWT (JSON Web Tokens) y passlib (bcrypt)
- **Documentación:** Swagger UI autogenerado (`/docs`)

### Frontend (User Interface)
- **Librería Core:** React.js
- **Build Tool:** Vite
- **Estilos:** Vanilla CSS (CSS Modules) + Lucide Icons
- **Gestión de Estado y Peticiones:** Context API, Axios
- **Manejo de Fechas:** date-fns

## Instalación y Ejecución Local 🛠️

### Prerrequisitos
- Node.js y npm (Para el Frontend)
- Python 3.10+ (Para el Backend)

### 1. Iniciar el Backend (FastAPI)
```bash
cd backend
# Activa el entorno virtual (En Windows)
.\venv\Scripts\activate
# Instala las dependencias si no las tienes
pip install -r requirements.txt
# Inicia el motor
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 2. Iniciar el Frontend (React + Vite)
```bash
cd frontend
# Instala paquetes de node
npm install
# Inicia la interfaz expuesta a red local
npm run dev -- --host
```

Abre tu navegador (en PC o Móvil conectado a tu WiFi) en la dirección IP brindada por Vite para acceder a la aplicación.

## Estructura del Proyecto 📂
- `/backend/app/routers`: Controladores de los endpoints.
- `/backend/app/schemas`: Modelos de validación de datos Pydantic.
- `/backend/app/models`: Tablas relacionales SQLAlchemy.
- `/frontend/src/pages`: Vistas completas de la aplicación (Dashboard, Auth, etc.).
- `/frontend/src/context`: Base de datos de sesión reactiva (AuthContext).

Desarrollado con precisión. 💜