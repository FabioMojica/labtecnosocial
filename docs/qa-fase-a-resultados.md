# QA Fase A - Estabilizacion de Suite Backend

Fecha de ejecucion: 4 de abril de 2026  
Entorno: local (Windows + Node.js, PostgreSQL local)  
Comando ejecutado: `npm.cmd --prefix backend test`

## 1) Objetivo de la fase

Estabilizar la base de pruebas backend corrigiendo desalineaciones entre:
- rutas reales del API,
- contratos de respuesta,
- fixtures de datos (roles/estados),
- y entorno de test.

## 2) Cambios aplicados en Fase A

Archivos actualizados:
- [`backend/tests/fixtures/fixtures.js`](/c:/Users/FABIO/Desktop/labtecnosocial/backend/tests/fixtures/fixtures.js)
- [`backend/tests/unit/jwt.spec.js`](/c:/Users/FABIO/Desktop/labtecnosocial/backend/tests/unit/jwt.spec.js)
- [`backend/tests/integrations/user.module.spec.js`](/c:/Users/FABIO/Desktop/labtecnosocial/backend/tests/integrations/user.module.spec.js)
- [`backend/data-source.js`](/c:/Users/FABIO/Desktop/labtecnosocial/backend/data-source.js)

Resumen de ajustes:
- Migracion de valores legacy a dominio actual:
  - estados: `enabled/disabled`
  - roles: `super-admin/admin/user`
- Rutas de pruebas alineadas a endpoints vigentes:
  - `POST /api/auth/login`
  - `/api/users/...`
- Validacion de contrato actual de respuesta:
  - `success`, `message`, `data`
- DataSource parametrizado por entorno (`DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_NAME_TEST`, etc.).

## 3) Suites y casos de prueba (documentacion formal)

## Suite A1 - Seguridad JWT y criptografia

Archivo: [`backend/tests/unit/jwt.spec.js`](/c:/Users/FABIO/Desktop/labtecnosocial/backend/tests/unit/jwt.spec.js)

Casos:
1. Hash de contrasena no almacena texto plano y permite comparacion.
2. Token JWT expira correctamente.
3. Token expirado falla en endpoint protegido.
4. Token con firma incorrecta falla en endpoint protegido.

Resultado: **4/4 PASS**

## Suite A2 - Utilidad de password

Archivo: [`backend/tests/unit/password.spec.js`](/c:/Users/FABIO/Desktop/labtecnosocial/backend/tests/unit/password.spec.js)

Casos:
1. `hashPassword` + `comparePassword` funcionan correctamente.

Resultado: **1/1 PASS**

## Suite A3 - Integracion Usuarios API (rutas vigentes)

Archivo: [`backend/tests/integrations/user.module.spec.js`](/c:/Users/FABIO/Desktop/labtecnosocial/backend/tests/integrations/user.module.spec.js)

Casos:
1. `GET /api/users/getAllUsers` responde `success/data`.
2. `POST /api/users/createUser` crea usuario y normaliza estado invalido a `disabled`.
3. `POST /api/users/createUser` rechaza email duplicado (409).
4. `POST /api/users/createUser` rechaza creacion de `super-admin` por `admin` (403).
5. `POST /api/users/createUser` rechaza usuario sin permiso `create` (403).
6. `GET /api/users/getUserByEmail/:email` devuelve usuario existente.
7. `PATCH /api/users/updateUser/:originalEmail` actualiza nombre por admin.
8. `PATCH /api/users/updateUser/:originalEmail` bloquea edicion cruzada por user (403).
9. `DELETE /api/users/deleteUser/:email` bloquea admin por permiso de middleware (403).
10. `DELETE /api/users/deleteUser/:email` permite eliminar con super-admin (200).

Resultado: **10/10 PASS**

## 4) Resultado global de Fase A

- Test suites: **3 passed / 3 total**
- Tests: **15 passed / 15 total**
- Estado: **Aprobado**

## 5) Riesgos residuales tras Fase A

1. Aun no hay pruebas automáticas frontend.
2. Aun no hay pruebas E2E de flujo completo.
3. `DB_NAME_TEST` debe definirse en CI/preproduccion para aislamiento total.

## 6) Criterio de salida de Fase A

Cumplido:
- Suite backend estable en verde.
- Pruebas alineadas al contrato actual.
- Base preparada para ampliar cobertura en Fase B.

