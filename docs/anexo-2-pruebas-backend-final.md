# Anexo 2 - Pruebas Backend (Version Final para Tribunal)

## 1. Objetivo del anexo
Documentar de forma verificable las pruebas backend ejecutadas sobre el sistema, alineadas con rutas reales, roles vigentes y resultados obtenidos en ambiente local de QA.

## 2. Alcance
Se validaron modulos criticos de negocio y seguridad:
- Autenticacion y sesion (`/api/auth/...`)
- Gestion de usuarios y permisos (`/api/users/...`)
- Proyectos, integraciones y dashboards (`/api/projects/...`, `/api/apis/...`)
- Reportes (`/api/reports/...`)
- Planes estrategicos (`/api/plans/...`)

## 3. Marco tecnico de pruebas
- Runner: `jest`
- Capa: integracion backend (API + servicios + DB de prueba)
- Entorno: `NODE_ENV=test`
- Base de datos: aislada para pruebas, con limpieza entre ejecuciones

## 4. Normalizacion (terminologia oficial)
Para mantener consistencia metodologica, en la version final del documento se usa:
- Roles: `super-admin`, `admin`, `user`
- Estados de usuario: `enabled`, `disabled`
- Rutas reales: `/api/auth`, `/api/users`, `/api/projects`, `/api/reports`, `/api/plans`, `/api/apis`

## 5. Suites ejecutadas y resultado

| Suite | Archivo | Resultado |
|---|---|---|
| Fase A - usuarios/permisos | `backend/tests/integrations/user.integration.test.js` | PASS |
| Fase B - autenticacion | `backend/tests/integrations/auth.module.phaseb.spec.js` | PASS |
| Fase B - proyectos/dashboard/integraciones | `backend/tests/integrations/projects.dashboard.integrations.phaseb.spec.js` | PASS |
| Fase B - reportes | `backend/tests/integrations/reports.module.phaseb.spec.js` | PASS |
| Fase B - planes estrategicos | `backend/tests/integrations/plans.module.phaseb.spec.js` | PASS |

## 6. Cobertura funcional validada (resumen por modulo)

### 6.1 Autenticacion y sesion
- Login valido genera token.
- Token invalido o ausente retorna `401`.
- Refresh de sesion funciona con cookie valida.
- Logout invalida/limpia sesion.
- Endpoint de perfil autenticado responde correctamente.

### 6.2 Usuarios y permisos
- Creacion de usuarios con validaciones de negocio.
- Bloqueo de duplicados por email.
- Restricciones por rol para creacion/edicion/eliminacion.
- Actualizacion de datos permitida segun privilegio.
- Proteccion de endpoints por middleware de autorizacion.

### 6.3 Proyectos, integraciones y dashboard
- CRUD de proyectos con validaciones.
- Asociación y lectura de integraciones por proyecto.
- Recuperacion de datos para dashboards integrados.
- Manejo de errores controlado ante datos faltantes o invalidos.

### 6.4 Reportes
- Creacion, lectura, actualizacion y eliminacion de reportes.
- Validacion de estructura de payload y permisos.
- Persistencia y recuperacion de metadata del reporte.

### 6.5 Planes estrategicos
- Operaciones de lectura y actualizacion con control de acceso.
- Integridad de relacion entre plan/version/componentes.
- Respuestas consistentes ante escenarios invalidos.

## 7. Evidencia cuantitativa
- Total ejecutado (backend fase A + fase B): **46 pruebas**
- Estado final: **46/46 PASS**
- Fallos bloqueantes: **0**

## 8. Criterio de aceptacion alcanzado
Se considera aceptada la capa backend para pre-entrega porque:
- Los modulos criticos de negocio fueron cubiertos con pruebas automatizadas.
- Los controles de seguridad por autenticacion/autorizacion fueron verificados.
- No existen fallos abiertos en las suites de integracion ejecutadas.

## 9. Riesgos residuales identificados
- Dependencias externas (APIs de terceros) pueden variar disponibilidad y cuotas.
- Se recomienda complementar con pruebas no funcionales (carga y resiliencia) en fase de salida.

## 10. Referencias de soporte
- [qa-fase-a-resultados.md](/c:/Users/FABIO/Desktop/labtecnosocial/docs/qa-fase-a-resultados.md)
- [qa-fase-b-resultados.md](/c:/Users/FABIO/Desktop/labtecnosocial/docs/qa-fase-b-resultados.md)
- [projects.dashboard.integrations.phaseb.spec.js](/c:/Users/FABIO/Desktop/labtecnosocial/backend/tests/integrations/projects.dashboard.integrations.phaseb.spec.js)
