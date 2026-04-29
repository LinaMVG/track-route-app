# Seguridad — track-route-app

 **Navegación:** [<- README](../README.md) | [ARCHITECTURE](ARCHITECTURE.md) | [STACK](STACK.md) | [LOCAL](LOCAL.md) | [ROUTES](ROUTES.md) | [DATA](DATA.md) | **SECURITY** | [INTEGRATION](INTEGRATION.md) | [RUNBOOK](RUNBOOK.md)

## 1. Autenticación

**JWT HS256** firmado con JWT_SECRET (mínimo 32 caracteres), expiración configurable via JWT_EXPIRES_IN (default 8h).
El token se verifica en cada request autenticado mediante el middleware requireAuth antes de llegar al caso de uso.
El payload JWT incluye: sub (user id), username, role.

## 2. Control de acceso (RBAC)

| Rol        | Permisos                                          |
| ---------- | ------------------------------------------------- |
| ADMIN    | Acceso completo: leer, crear, editar, inhabilitar |
| OPERADOR | Solo lectura: GET /routes y GET /routes/:id   |

El middleware requireRole valida el campo role del payload JWT en cada endpoint protegido.

## 3. Hash de contraseñas

Algoritmo: **bcrypt** con factor de coste **12**.
Comparación timing-safe: cuando el usuario no existe se ejecuta igualmente bcrypt.compare contra un hash ficticio para evitar que el tiempo de respuesta revele si el username es válido.

## 4. Protección HTTP

| Plugin                | Función                                                  |
| --------------------- | -------------------------------------------------------- |
| @fastify/helmet     | Headers de seguridad HTTP (CSP activado en producción)   |
| @fastify/cors       | CORS restringido a la allowlist ALLOWED_ORIGINS        |
| @fastify/rate-limit | Límite de 5 intentos/minuto en POST /auth/login por IP |

## 5. Validación de inputs

Todos los inputs HTTP se validan con **Zod** antes de ejecutar cualquier lógica de negocio:

Los campos vehicleType y status usan .enum() (allowlist explícita).
Los schemas separan la validación de creación (CreateRouteSchema) y actualización (UpdateRouteSchema) para evitar inyección de campos no permitidos.

## 6. Prevención de inyección SQL

Se usan exclusivamente **prepared statements** con parámetros posicionales ($1, $2, ...) en node-postgres. Ninguna query construye SQL mediante concatenación de strings de usuario.

Los tipos especiales (NUMERIC, TIMESTAMPTZ) usan casts explícitos en SQL (::numeric, ::timestamptz) para garantizar la conversión segura.

## 7. Gestión de secretos

Las credenciales se cargan únicamente desde variables de entorno inyectadas en .env.
El archivo .env está excluido de git via .gitignore.
En producción deben inyectarse desde un vault (HashiCorp Vault / Azure Key Vault).
El servidor llama process.exit(1) si alguna variable obligatoria no está definida.

## 8. Logging seguro

Logs estructurados JSON con correlation-id por request.
Nunca se registran contraseñas, tokens completos ni datos sensibles en logs.
Nivel configurable via LOG_LEVEL (default 
).