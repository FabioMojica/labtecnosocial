# Guía rápida local

Guía pensada para que cualquier persona que clone el repo lo levante en minutos.

## 1) Requisitos
- Node.js 20+ (recomendado LTS)
- npm 10+
- PostgreSQL 14+ (local)

## 2) Clonar e instalar dependencias
```bash
git clone <URL_DEL_REPO>
cd labtecnosocial

cd backend
npm install

cd ../frontend
npm install
```

## 3) Configurar variables de entorno
En backend:
```bash
cd backend
cp .env.example .env
```

En frontend:
```bash
cd frontend
cp .env.example .env
```

Si usas PowerShell en Windows:
```powershell
Copy-Item backend/.env.example backend/.env
Copy-Item frontend/.env.example frontend/.env
```

## 4) Base de datos
El backend usa TypeORM con estos valores por defecto (actuales en código):
- host: `localhost`
- port: `5432`
- user: `postgres`
- password: `postgres`
- database: `labtecnosocial_db`

Crear la base:
```sql
CREATE DATABASE labtecnosocial_db;
```

## 5) Levantar aplicación
Terminal 1 (backend):
```bash
cd backend
npm run dev
```
Backend: `http://localhost:5000`

Terminal 2 (frontend):
```bash
cd frontend
npm run dev
```
Frontend: `http://localhost:5173`

## 6) Verificación rápida
- Ingresar a `http://localhost:5173`
- Confirmar que el frontend haga requests al backend (`http://localhost:5000`)
- Validar que se puede iniciar sesión y navegar módulos

## Errores comunes
- `ECONNREFUSED` a DB: PostgreSQL apagado o credenciales incorrectas.
- `CORS`/401: backend no iniciado o `JWT_SECRET` faltante.
- El frontend no consume API correcta: revisar `VITE_BASE_URL` y `VITE_API_URL`.
