# Auditoria QA y Plan de Pruebas

Fecha de auditoria: 4 de abril de 2026  
Sistema: LAB Tecnosocial (backend + frontend)

## 1) Resumen ejecutivo

Estado actual para salida a pruebas: **riesgo medio-alto**.

Hallazgos clave:
- La suite automatizada actual del backend esta rota por desalineacion de rutas y enums (43/46 tests fallan).
- No existe suite automatizada de frontend (unitaria o e2e).
- No hay pipeline de CI visible para bloquear regresiones.
- Modulos criticos (Dashboards APIs, editor de reportes, exportacion PDF, permisos) no tienen cobertura automatizada suficiente.

Recomendacion:
- Ejecutar un plan en 3 fases: **estabilizacion tecnica**, **pruebas funcionales/regresion**, **pruebas no funcionales y salida**.

## 2) Evidencia tecnica observada

### 2.1 Cobertura y tooling
- Backend con Jest/Supertest: [`backend/package.json`](/c:/Users/FABIO/Desktop/labtecnosocial/backend/package.json)
- Frontend sin framework de testing configurado en scripts: [`frontend/package.json`](/c:/Users/FABIO/Desktop/labtecnosocial/frontend/package.json)
- Tests encontrados:
  - [`backend/tests/unit/password.spec.js`](/c:/Users/FABIO/Desktop/labtecnosocial/backend/tests/unit/password.spec.js)
  - [`backend/tests/unit/jwt.spec.js`](/c:/Users/FABIO/Desktop/labtecnosocial/backend/tests/unit/jwt.spec.js)
  - [`backend/tests/integrations/user.module.spec.js`](/c:/Users/FABIO/Desktop/labtecnosocial/backend/tests/integrations/user.module.spec.js)

### 2.2 Fallas concretas de tests (bloqueantes)
- `npm.cmd --prefix backend test`:
  - 46 tests totales
  - 43 fallidos
  - Error dominante: enum `users_state_enum` no acepta `habilitado` (en codigo se usa `enabled/disabled`)
  - Endpoints de pruebas desactualizados (`/api/auth-users/...`) que hoy retornan 404

Referencias:
- Rutas actuales del app: [`backend/src/app.js:61`](/c:/Users/FABIO/Desktop/labtecnosocial/backend/src/app.js:61), [`backend/src/app.js:62`](/c:/Users/FABIO/Desktop/labtecnosocial/backend/src/app.js:62)
- Enum actual de usuario: [`backend/src/entities/User.js:41`](/c:/Users/FABIO/Desktop/labtecnosocial/backend/src/entities/User.js:41)
- Test con ruta antigua: [`backend/tests/unit/jwt.spec.js:42`](/c:/Users/FABIO/Desktop/labtecnosocial/backend/tests/unit/jwt.spec.js:42)
- Test con ruta antigua: [`backend/tests/integrations/user.module.spec.js:80`](/c:/Users/FABIO/Desktop/labtecnosocial/backend/tests/integrations/user.module.spec.js:80)

## 3) Riesgos por modulo

### 3.1 Seguridad y acceso
- JWT, autorizacion por roles, proteccion de rutas y subida de archivos.
- Riesgo: regresiones en permisos entre admin/coordinador/usuario y accesos cruzados.

### 3.2 Planificacion estrategica y operativa
- CRUD, validaciones, relaciones de entidades, estados y filtros.
- Riesgo: inconsistencia de datos por validaciones frontend/backend no alineadas.

### 3.3 Dashboards APIs (GitHub/Facebook/Instagram)
- Dependencia fuerte de APIs externas, rate limits, campos opcionales y cambios de contrato.
- Riesgo: pantallas vacias/errores silenciosos y datos no comparables entre periodos.

### 3.4 Reportes y exportacion PDF
- Editor drag & drop, seleccion de graficas, serializacion de elementos, render PDF multipagina.
- Riesgo: grafica no renderizada, datos truncados, overlap visual, fuentes ilegibles.

## 4) Plan de pruebas recomendado

## Fase A: Estabilizacion base (1-2 dias)

Objetivo: tener una base automatizada confiable antes de ampliar cobertura.

1. Corregir pruebas backend desactualizadas:
- Unificar rutas de test con rutas reales (`/api/users/...`).
- Unificar vocabulario de estados (`enabled/disabled` o estrategia de traduccion consistente).
- Alinear fixtures de roles (`user/admin/super-admin`) con modelo actual.

2. Preparar entorno de test aislado:
- Base de datos de pruebas dedicada.
- Seed minimo deterministico por suite.
- Limpieza por suite (`dropDatabase + synchronize`) ya existe, validar paralelizacion.

3. Definir criterio de salida fase A:
- `backend test` con exito >= 90% de suites planificadas de auth/users.

## Fase B: Cobertura funcional critica (3-5 dias)

Objetivo: cubrir caminos de negocio que rompen entrega.

1. API Tests (backend, obligatorios):
- Auth: login, refresh, expiracion, token invalido, usuario deshabilitado.
- Users: CRUD completo + permisos por rol.
- Projects/Integraciones: crear, editar, vincular GitHub/Facebook/Instagram.
- Reports: crear, actualizar, eliminar, versionado, imagenes y elementos.
- Dashboards APIs: respuestas validas para `today/lastWeek/lastMonth/lastSixMonths/all`.

2. Frontend unit/component tests (agregar Vitest + RTL):
- Formularios criticos: crear proyecto, crear usuario, editar plan.
- Selector de graficas para reportes.
- Render condicional de estados: loading/error/empty/data.
- Notificaciones con tipo correcto (`error/success/warning`).

3. E2E (agregar Playwright):
- Flujo 1: login -> crear proyecto -> vincular integraciones -> ver dashboard.
- Flujo 2: seleccionar graficas -> guardar reporte -> exportar PDF.
- Flujo 3: permisos (admin vs no admin) en rutas protegidas.

4. Criterio de salida fase B:
- 100% de flujos E2E criticos en verde.
- Sin errores de consola bloqueantes en dashboard/reporte.

## Fase C: No funcionales y salida profesional (2-3 dias)

Objetivo: robustez antes de entrega.

1. Pruebas de regresion visual:
- Desktop y movil (ancho minimo 375px).
- Validar que textos/labels no se monten en graficas y PDF.

2. Pruebas de performance basica:
- Tiempo de carga inicial dashboard < 3s en entorno local de referencia.
- Exportacion PDF de reporte medio < 10s.

3. Pruebas de resiliencia APIs externas:
- Token invalido/expirado.
- Timeout y fallback con mensajes de error claros.
- Respuestas parciales o campos faltantes.

4. Pruebas de seguridad base:
- CORS, cookies, JWT y control de roles.
- Subida de archivos: tipo/tamanio/extension.
- Verificar no exposicion de secretos en logs o repo.

5. Criterio de salida fase C:
- Checklist de seguridad minimo completo.
- UAT de negocio aprobado.
- Evidencia de pruebas adjunta (capturas + reporte de ejecucion).

## 5) Suite minima recomendada para liberar v1

1. Backend:
- 30-40 tests de API en auth/users/projects/reports/integraciones.

2. Frontend:
- 20-30 tests de componentes/paginas criticas.

3. E2E:
- 8-12 escenarios (happy path + errores clave).

4. Manual QA:
- Matriz de 40-60 casos con estado PASA/FALLA y evidencia.

## 6) Checklist de salida a produccion

1. Todos los tests automáticos en verde.
2. Sin errores de consola tipo `Unhandled` o `500` en flujos principales.
3. Exportacion PDF validada en 5 reportes reales.
4. Integraciones GitHub/Facebook/Instagram validadas en al menos 2 proyectos.
5. Secretos en `.env` fuera de Git y rotados si hubo exposicion previa.
6. Documentacion de despliegue y rollback disponible.

## 7) Siguiente paso recomendado

Prioridad inmediata: **arreglar y modernizar la suite backend actual** para que vuelva a ser confiable.  
Despues, montar **Playwright** para los 3 flujos criticos de negocio.

