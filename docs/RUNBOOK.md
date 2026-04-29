# Runbook operacional — track-route-app

 **Navegación:** [<- README](../README.md) | [ARCHITECTURE](ARCHITECTURE.md) | [STACK](STACK.md) | [LOCAL](LOCAL.md) | [ROUTES](ROUTES.md) | [DATA](DATA.md) | [SECURITY](SECURITY.md) | [INTEGRATION](INTEGRATION.md) | **RUNBOOK**

## 1. Inicio del sistema

bash
# 1. Asegurarse de que PostgreSQL esté corriendo

# 2. Aplicar migraciones (solo la primera vez o tras cambios de esquema)
cd backend && npm run migrate

# 3. Cargar datos iniciales (solo la primera vez)
npm run seed

# 4. Iniciar backend
npm run dev
# → http://localhost:3000

# 5. Iniciar frontend (otra terminal)
cd frontend && ng serve
# → http://localhost:4200

## 2. Health check

bash
curl http://localhost:3000/health
# Respuesta esperada: {"status":"ok","timestamp":"<ISO8601>"}

## 3. Ejecución de pruebas

bash
cd backend

# Pruebas unitarias
npm test

# Pruebas con reporte de cobertura
npm run test:coverage
# Reporte HTML: backend/coverage/lcov-report/index.html

## 4. Errores comunes

| Error / Síntoma                            | Causa                                    | Acción                                                               |
| ------------------------------------------ | ---------------------------------------- | -------------------------------------------------------------------- |
| Servidor sale con código 1 al iniciar      | Variable de entorno faltante             | Completar DATABASE_URL, JWT_SECRET y SOAP_WSDL_URL en .env   |
| ECONNREFUSED al conectar a BD            | PostgreSQL no disponible                 | Verificar que el servicio PostgreSQL esté activo                     |
| Error 22P02 invalid input syntax         | Tipo de dato incompatible enviado a PG   | Verificar casts explícitos en queries (::numeric, ::timestamptz) |
| 404 en GET /api/routes                   | Error al cargar el módulo de rutas (Zod) | Verificar que UpdateRouteSchema use RouteBaseSchema.partial()    |
| JWT invalid signature                    | JWT_SECRET cambió entre reinicios      | Hacer login nuevamente para obtener un token válido                  |
| Tests fallan con Cannot find module @... | Alias de paths no mapeados en Jest       | Verificar moduleNameMapper en backend/jest.config.ts             |
| NaN como LIMIT en queries de paginación  | Zod v4 .default() retorna undefined    | Usar Number(pagination.limit) \|\| 20 para el valor por defecto    |

## 5. Rotación de credenciales

1. Actualizar JWT_SECRET en el vault o en .env.
2. Reiniciar el servidor backend.
3. Todos los tokens existentes quedarán inválidos — los usuarios deben hacer login nuevamente.
4. Para contraseñas de usuarios en BD: actualizar con un nuevo hash bcrypt (cost 12).

## 6. Logs

Los logs se emiten en formato JSON estructurado por pino. Cada log incluye:

correlationId — trazabilidad por request
method y url — identificación del endpoint
statusCode — en los eventos onResponse
level — info, warn, 

Para ver los logs con formato legible en desarrollo:

bash
npm run dev | npx pino-pretty