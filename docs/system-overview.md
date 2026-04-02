# Estructura del sistema

## Módulos principales
- `frontend/`: React + Vite + MUI
- `backend/`: Node.js + Express + TypeORM + PostgreSQL
- `docs/`: documentación de onboarding y operación

## Backend
Puntos clave:
- Servidor: `backend/src/server.js`
- App express: `backend/src/app.js`
- DataSource TypeORM: `backend/data-source.js`
- Scripts:
  - `npm run dev`
  - `npm test`

## Frontend
Puntos clave:
- App React: `frontend/src`
- Build/dev con Vite
- Scripts:
  - `npm run dev`
  - `npm run build`
  - `npm run lint`

## Integraciones
Backend expone rutas para:
- GitHub
- Facebook
- Instagram

Frontend consume por:
- `VITE_BASE_URL`
- `VITE_API_URL`

## Exportaciones
Soporte de reportes con:
- PDF
- (otros formatos según módulo)
