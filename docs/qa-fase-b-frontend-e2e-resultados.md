# QA Fase B - Frontend + E2E

Fecha de ejecucion: 4 de abril de 2026  
Entorno: local (Windows + Node.js)  
Proyecto: `frontend`

## 1) Objetivo de la fase

Completar la Fase B con pruebas automatizadas del frontend en dos niveles:
- pruebas unitarias/componentes (Vitest + Testing Library),
- pruebas end-to-end (Playwright) en desktop y movil.

Objetivo de calidad: validar flujos criticos del sistema de manera reproducible y profesional.

## 2) Implementacion realizada

## 2.1 Infraestructura de testing

Archivos base creados:
- [`frontend/vitest.config.js`](/c:/Users/FABIO/Desktop/labtecnosocial/frontend/vitest.config.js)
- [`frontend/src/test/setupTests.js`](/c:/Users/FABIO/Desktop/labtecnosocial/frontend/src/test/setupTests.js)
- [`frontend/playwright.config.js`](/c:/Users/FABIO/Desktop/labtecnosocial/frontend/playwright.config.js)

Scripts agregados en [`frontend/package.json`](/c:/Users/FABIO/Desktop/labtecnosocial/frontend/package.json):
- `test`
- `test:watch`
- `test:coverage`
- `test:e2e`
- `test:e2e:ui`

Dependencias agregadas:
- `vitest`, `jsdom`
- `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`
- `@playwright/test`

## 2.2 Suites de frontend (unit/component)

### Utilidades de negocio
- [`frontend/src/utils/__tests__/validateCredentials.utility.test.js`](/c:/Users/FABIO/Desktop/labtecnosocial/frontend/src/utils/__tests__/validateCredentials.utility.test.js)
- [`frontend/src/utils/__tests__/textUtils.test.js`](/c:/Users/FABIO/Desktop/labtecnosocial/frontend/src/utils/__tests__/textUtils.test.js)
- [`frontend/src/utils/__tests__/dateAndDuration.test.js`](/c:/Users/FABIO/Desktop/labtecnosocial/frontend/src/utils/__tests__/dateAndDuration.test.js)
- [`frontend/src/utils/__tests__/slugify.test.js`](/c:/Users/FABIO/Desktop/labtecnosocial/frontend/src/utils/__tests__/slugify.test.js)

### Seguridad de ruta/autorizacion
- [`frontend/src/hooks/__tests__/useAuthorization.test.jsx`](/c:/Users/FABIO/Desktop/labtecnosocial/frontend/src/hooks/__tests__/useAuthorization.test.jsx)
- [`frontend/src/generalComponents/__tests__/PrivateRoute.test.jsx`](/c:/Users/FABIO/Desktop/labtecnosocial/frontend/src/generalComponents/__tests__/PrivateRoute.test.jsx)

### API layer frontend (contrato + errores)
- [`frontend/src/api/__tests__/auth.api.test.js`](/c:/Users/FABIO/Desktop/labtecnosocial/frontend/src/api/__tests__/auth.api.test.js)
- [`frontend/src/api/__tests__/coreModules.api.test.js`](/c:/Users/FABIO/Desktop/labtecnosocial/frontend/src/api/__tests__/coreModules.api.test.js)
- [`frontend/src/api/apis/__tests__/socialApis.test.js`](/c:/Users/FABIO/Desktop/labtecnosocial/frontend/src/api/apis/__tests__/socialApis.test.js)
- [`frontend/src/api/__tests__/legacyApis.test.js`](/c:/Users/FABIO/Desktop/labtecnosocial/frontend/src/api/__tests__/legacyApis.test.js)

### Pantalla critica de acceso
- [`frontend/src/pages/Loginpage/__tests__/LoginPage.test.jsx`](/c:/Users/FABIO/Desktop/labtecnosocial/frontend/src/pages/Loginpage/__tests__/LoginPage.test.jsx)

## 2.3 Suites E2E (Playwright)

Helpers:
- [`frontend/e2e/helpers/session.js`](/c:/Users/FABIO/Desktop/labtecnosocial/frontend/e2e/helpers/session.js)

Escenarios:
- [`frontend/e2e/auth-login.spec.js`](/c:/Users/FABIO/Desktop/labtecnosocial/frontend/e2e/auth-login.spec.js)
  - Login exitoso y redireccion a `/inicio`.
- [`frontend/e2e/dashboard-overview.spec.js`](/c:/Users/FABIO/Desktop/labtecnosocial/frontend/e2e/dashboard-overview.spec.js)
  - Dashboard overview con ranking de integraciones.
- [`frontend/e2e/reports-list.spec.js`](/c:/Users/FABIO/Desktop/labtecnosocial/frontend/e2e/reports-list.spec.js)
  - Listado de reportes y render de contenido.

Proyectos navegador configurados:
- `chromium-desktop`
- `chromium-mobile` (Pixel 5)

## 3) Evidencia de ejecucion

## 3.1 Frontend unit/component

Comando:
- `npm.cmd --prefix frontend test`

Resultado:
- **11 archivos de prueba PASS**
- **42 tests PASS**
- **0 fallos**

## 3.2 E2E

Comando:
- `npm.cmd --prefix frontend run test:e2e`

Resultado:
- **6 escenarios PASS**
- **0 fallos**
- Cobertura en desktop y movil.

## 4) Alcance funcional cubierto

Validado automaticamente:
- reglas de validacion de formularios (email/password/texto),
- formato y parseo de fechas/duracion,
- control de acceso (`unauthenticated`, `unauthorized`, `authorized`),
- wrapper de APIs de auth/users/proyectos/planes/reportes/dashboard/redes,
- flujo completo de login,
- carga de dashboard overview,
- carga de modulo de reportes.

## 5) Riesgos residuales (siguiente iteracion profesional)

1. Ampliar E2E a creacion/edicion real de proyecto y planificacion completa.
2. Agregar pruebas visuales de regresion para PDF/exportaciones.
3. Integrar pipeline CI para ejecutar backend + frontend + e2e en cada push.

## 6) Comandos operativos recomendados

Desde raiz:
1. `npm.cmd --prefix backend test`
2. `npm.cmd --prefix frontend test`
3. `npm.cmd --prefix frontend run test:e2e`

Con estos tres comandos se valida de forma automatizada la base critica backend + frontend + flujos e2e.
