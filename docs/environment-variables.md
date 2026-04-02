# Variables de entorno

## Backend (`backend/.env`)

Variables detectadas en el código backend:

| Variable | Obligatoria | Descripción | Ejemplo |
|---|---|---|---|
| `JWT_SECRET` | Sí | Se usa para firmar/verificar JWT en autenticación | `JWT_SECRET=super_secret_largo` |
| `NODE_ENV` | Recomendado | Modo de ejecución (`development`, `test`, `production`) | `NODE_ENV=development` |
| `FACEBOOK_GRAPH_VERSION` | No | Versión del Graph API de Facebook (tiene fallback) | `FACEBOOK_GRAPH_VERSION=v17.0` |

Notas:
- En `test`, TypeORM usa `dropSchema`.
- Actualmente conexión de DB está hardcodeada en `backend/data-source.js` (no por env aún).

## Frontend (`frontend/.env`)

Variables detectadas en el frontend:

| Variable | Obligatoria | Descripción | Ejemplo |
|---|---|---|---|
| `VITE_BASE_URL` | Sí | Base URL API para axios/exportaciones | `http://localhost:5000` |
| `VITE_API_URL` | Sí | Base URL para utilidades de rutas de imágenes/API | `http://localhost:5000` |
| `VITE_API_TIMEOUT_MS` | No | Timeout axios en ms | `30000` |
| `VITE_TOKEN_WARNING_MINUTES` | No | Minutos de advertencia de sesión | `10` |
| `VITE_SESSION_WARNING_TIME` | No | Tiempo de advertencia de sesión (`10m`, etc.) | `10m` |

## Archivos de ejemplo
- `backend/.env.example`
- `frontend/.env.example`
