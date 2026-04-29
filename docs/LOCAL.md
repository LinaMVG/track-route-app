# Setup local — track-route-app

 **Navegación:** [<- README](../README.md) | [ARCHITECTURE](ARCHITECTURE.md) | [STACK](STACK.md) | **LOCAL** | [ROUTES](ROUTES.md) | [DATA](DATA.md) | [SECURITY](SECURITY.md) | [INTEGRATION](INTEGRATION.md) | [RUNBOOK](RUNBOOK.md)

## 1. Prerrequisitos

Node.js 20.x o superior
PostgreSQL 14 o superior corriendo localmente
npm 10.x o superior

## 2. Configuración del backend

### 2.1 Variables de entorno

bash
cd backend
cp .env.example .env

Editar .env con los valores reales:

| Variable        | Descripción                               | Ejemplo                                              |
| --------------- | ----------------------------------------- | ---------------------------------------------------- |
| DATABASE_URL  | Cadena de conexión PostgreSQL             | postgresql://postgres:pass@localhost:5432/track_db |
| JWT_SECRET    | Clave de firma JWT — mínimo 32 caracteres | cambiar_por_clave_segura_de_al_menos_32_chars      |
| SOAP_WSDL_URL | URL del WSDL del servicio de tracking     | `http://localhost:8080/tracking?wsdl`                |
| PORT          | Puerto del servidor                       | 3000                                               |
| NODE_ENV      | Entorno de ejecución                      | development                                        |

 El servidor llama process.exit(1) si DATABASE_URL, JWT_SECRET o SOAP_WSDL_URL no están definidas.

### 2.2 Instalación y arranque

bash
cd backend
npm install
npm run migrate   # Crea tablas users y routes en PostgreSQL
npm run seed      # Inserta usuarios y rutas de prueba
npm run dev       # Inicia servidor en http://localhost:3000

### 2.3 Credenciales de prueba (seed)

| Usuario     | Contraseña      | Rol      |
| ----------- | --------------- | -------- |
| admin     | Admin2024!    | ADMIN    |
| operador1 | Operador2024! | OPERADOR |

## 3. Configuración del frontend

bash
cd frontend
npm install
ng serve          # http://localhost:4200

La URL base del backend se configura en src/environments/environment.ts.

## 4. Pruebas

bash
# Backend — pruebas unitarias
cd backend && npm test

# Backend — con reporte de cobertura
cd backend && npm run test:coverage
# Reporte HTML: backend/coverage/lcov-report/index.html

# Frontend — pruebas unitarias
cd frontend && ng test

## 5. Health check

bash
curl http://localhost:3000/health
# {"status":"ok","timestamp":"2026-04-29T..."}

## 6. Troubleshooting

| Síntoma                               | Causa probable                           | Solución                                                           |
| ------------------------------------- | ---------------------------------------- | ------------------------------------------------------------------ |
| Servidor sale con código 1 al iniciar | Variable de entorno faltante             | Verificar DATABASE_URL, JWT_SECRET y SOAP_WSDL_URL en .env |
| ECONNREFUSED al conectar a BD       | PostgreSQL no disponible                 | Comprobar que el servicio PostgreSQL esté activo                   |
| Error 22P02 en PostgreSQL           | Tipo de dato incompatible en query       | Verificar casts explícitos en SQL (::numeric, ::timestamptz)   |
| 404 en GET /api/routes              | Error al cargar el módulo de rutas (Zod) | Verificar que UpdateRouteSchema use RouteBaseSchema.partial()  |
| JWT invalid signature               | JWT_SECRET cambió entre reinicios      | Hacer login nuevamente para obtener un token válido                |
| Tests fallan con Cannot find module | Alias de paths no mapeados en Jest       | Verificar moduleNameMapper en backend/jest.config.ts           |