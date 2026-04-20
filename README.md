# LAB Tecnosocial

Aplicación web para gestión de:
- Planificación estratégica
- Planificación operativa
- Proyectos operativos
- Dashboards e integraciones (GitHub, Facebook, Instagram)
- Reportes exportables

## Inicio rápido
La guía completa está en [`docs/quickstart-local.md`](docs/quickstart-local.md).

Resumen:
1. Instalar dependencias:
   - `cd backend && npm install`
   - `cd ../frontend && npm install`
2. Configurar variables de entorno:
   - Copiar `backend/.env.example` a `backend/.env`
   - Copiar `frontend/.env.example` a `frontend/.env`
3. Levantar servicios:
   - Backend: `cd backend && npm run dev`
   - Frontend: `cd frontend && npm run dev`
4. Abrir: `http://localhost:5173`

## Documentación
- [Guía de levantamiento local](docs/quickstart-local.md)
- [Variables de entorno](docs/environment-variables.md)
- [Seguridad de secretos](docs/security-secrets.md)
- [Estructura del sistema](docs/system-overview.md)
- [Auditoria QA y plan de pruebas](docs/qa-auditoria-plan-pruebas.md)
- [Resultados QA Fase A](docs/qa-fase-a-resultados.md)
- [Resultados QA Fase B](docs/qa-fase-b-resultados.md)
- [Resultados QA Fase B Frontend + E2E](docs/qa-fase-b-frontend-e2e-resultados.md)
