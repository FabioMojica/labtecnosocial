# QA Fase B - Cobertura Funcional Critica

Fecha de ejecucion: 4 de abril de 2026  
Entorno: local (Windows + Node.js + PostgreSQL local)  
Comando ejecutado: `npm.cmd --prefix backend test`

## 1) Objetivo de la fase

Extender la cobertura funcional del sistema en modulos criticos de negocio:
- autenticacion y sesiones,
- proyectos, integraciones y dashboard,
- reportes (CRUD + versionado),
- planificacion estrategica y operativa (versionado y permisos).

## 2) Cambios aplicados en Fase B

Archivos nuevos:
- [`backend/tests/helpers/testHarness.js`](/c:/Users/FABIO/Desktop/labtecnosocial/backend/tests/helpers/testHarness.js)
- [`backend/tests/integrations/auth.module.phaseb.spec.js`](/c:/Users/FABIO/Desktop/labtecnosocial/backend/tests/integrations/auth.module.phaseb.spec.js)
- [`backend/tests/integrations/projects.dashboard.integrations.phaseb.spec.js`](/c:/Users/FABIO/Desktop/labtecnosocial/backend/tests/integrations/projects.dashboard.integrations.phaseb.spec.js)
- [`backend/tests/integrations/reports.module.phaseb.spec.js`](/c:/Users/FABIO/Desktop/labtecnosocial/backend/tests/integrations/reports.module.phaseb.spec.js)
- [`backend/tests/integrations/plans.module.phaseb.spec.js`](/c:/Users/FABIO/Desktop/labtecnosocial/backend/tests/integrations/plans.module.phaseb.spec.js)

Objetivo tecnico de los cambios:
- Estandarizar setup de DB de test y autenticacion.
- Cubrir caminos felices y de error por permisos/validaciones/versionado.
- Probar integracion entre modulos (por ejemplo: proyecto -> plan estrategico -> plan operativo).

## 3) Suites y casos de prueba (documentacion formal)

## Suite B1 - Auth API

Archivo: [`backend/tests/integrations/auth.module.phaseb.spec.js`](/c:/Users/FABIO/Desktop/labtecnosocial/backend/tests/integrations/auth.module.phaseb.spec.js)

Casos:
1. Login exitoso retorna `accessToken` y `user`.
2. Login con credenciales invalidas retorna 401.
3. `GET /api/auth/me` con token valido.
4. `GET /api/auth/me` con token invalido retorna 401.
5. `POST /api/auth/refresh` sin cookie retorna 401.
6. `POST /api/auth/refresh` con cookie valida retorna nuevo token.
7. `POST /api/auth/logout` limpia sesion.
8. `GET /api/auth/sumaryData/:id` responde para super-admin.

Resultado: **8/8 PASS**

## Suite B2 - Projects + Integrations + Dashboard

Archivo: [`backend/tests/integrations/projects.dashboard.integrations.phaseb.spec.js`](/c:/Users/FABIO/Desktop/labtecnosocial/backend/tests/integrations/projects.dashboard.integrations.phaseb.spec.js)

Casos:
1. Crear proyecto con responsables e integraciones.
2. Listar proyectos visibles para admin asignado.
3. Obtener detalle de proyecto por ID.
4. Actualizar integraciones (crear/actualizar) por endpoint de integracion.
5. Listar proyectos integrados en dashboard para admin.
6. Validar acceso sin token (bloqueo de seguridad).
7. Validar dashboard para usuario asignado.

Resultado: **7/7 PASS**

## Suite B3 - Reports API

Archivo: [`backend/tests/integrations/reports.module.phaseb.spec.js`](/c:/Users/FABIO/Desktop/labtecnosocial/backend/tests/integrations/reports.module.phaseb.spec.js)

Casos:
1. Crear reporte (`createReport`) con payload valido.
2. Listar reportes.
3. Bloquear listado para rol sin permisos.
4. Obtener reporte por ID.
5. Actualizar reporte e incrementar `report_version`.
6. Eliminar reporte.
7. Verificar 404 al consultar reporte eliminado.

Resultado: **7/7 PASS**

## Suite B4 - Strategic + Operational Plan API

Archivo: [`backend/tests/integrations/plans.module.phaseb.spec.js`](/c:/Users/FABIO/Desktop/labtecnosocial/backend/tests/integrations/plans.module.phaseb.spec.js)

Casos:
1. Crear plan estrategico por ano con estructura completa.
2. Lectura de plan estrategico por usuario.
3. Rechazo de version desactualizada (control de concurrencia).
4. Lectura de plan operativo inicial de proyecto.
5. Guardado de filas operativas con incremento de version.
6. Rechazo de guardado con version stale.
7. Bloqueo de lectura de plan operativo para usuario no asignado.
8. Eliminacion de plan operativo.
9. Eliminacion de plan estrategico y validacion en DB.

Resultado: **9/9 PASS**

## 4) Resultado global de Fase B

- Test suites: **7 passed / 7 total**
- Tests: **46 passed / 46 total**
- Estado: **Aprobado**

Incluye Fase A + Fase B corriendo de forma estable en una sola ejecucion.

## 5) Cobertura funcional alcanzada

Cobertura backend automatizada validada en:
- Autenticacion y sesion (login, refresh, logout, perfil).
- Autorizacion por rol en rutas criticas.
- CRUD y permisos de usuarios (suite previa Fase A).
- CRUD de proyectos e integraciones sociales.
- Dashboard de proyectos integrados.
- CRUD de reportes con versionado.
- Plan estrategico con versionado y consistencia.
- Plan operativo con versionado y control de acceso.

## 6) Riesgos residuales para cierre total de QA

1. No hay aun suite automatizada frontend (componentes).
2. No hay aun suite E2E de flujos UI completos.
3. Integraciones externas (GitHub/Facebook/Instagram) no estan mockeadas en tests automaticos de contrato.

## 7) Criterio de salida de Fase B

Cumplido para backend:
- API critica funcional cubierta y en verde.
- Casos de autorizacion/versionado/error incluidos.
- Evidencia reproducible con comando unico de test.
