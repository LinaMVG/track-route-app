# Rutas API — track-route-app

 **Navegación:** [<- README](../README.md) | [ARCHITECTURE](ARCHITECTURE.md) | [STACK](STACK.md) | [LOCAL](LOCAL.md) | **ROUTES** | [DATA](DATA.md) | [SECURITY](SECURITY.md) | [INTEGRATION](INTEGRATION.md) | [RUNBOOK](RUNBOOK.md)

## Base URL

http://localhost:3000/api

## Autenticación

Todos los endpoints (excepto POST /auth/login) requieren header:

Authorization: Bearer <access_token>

---

## Módulo de autenticación

### POST /auth/login

Autentica un usuario y retorna un JWT.

**Rate limit:** 5 peticiones / minuto por IP.

**Body:**

json
{ "username": "admin", "password": "Admin2024!" }

**Respuesta 200:**

json
{
  "success": true,
  "data": {
    "accessToken": "eyJ...",
    "expiresIn": "8h",
    "user": { "id": "uuid", "username": "admin", "role": "ADMIN" }
  }
}

**Errores:** 401 UNAUTHORIZED — credenciales inválidas o usuario inactivo.

---

### GET /auth/me

Retorna información del usuario autenticado. Requiere JWT válido.

**Respuesta 200:**

json
{ "id": "uuid", "username": "admin", "role": "ADMIN" }

---

## Módulo de rutas de envío

### GET /routes

Lista rutas con paginación por cursor y filtros opcionales.

**Roles:** OPERADOR, ADMIN.

**Query params:**

| Parámetro         | Tipo   | Descripción                                                            |
| ----------------- | ------ | ---------------------------------------------------------------------- |
| originCity      | string | Filtra por ciudad de origen                                            |
| destinationCity | string | Filtra por ciudad de destino                                           |
| vehicleType     | enum   | CAMION \| TRACTOMULA \| FURGONETA \| MOTO_CARGO                |
| status          | enum   | ACTIVA \| INACTIVA \| SUSPENDIDA \| EN_MANTENIMIENTO           |
| carrier         | string | Filtra por transportista                                               |
| cursor          | string | UUID del último elemento de la página anterior (paginación por cursor) |
| limit           | number | Resultados por página — default 20, máximo 100                     |

**Respuesta 200:**

json
{
  "data": [{ "id": "uuid", "originCity": "Bogotá", "...": "..." }],
  "nextCursor": "uuid-or-null",
  "total": 150
}

---

### GET /routes/:id

Obtiene una ruta por su ID.

**Roles:** OPERADOR, ADMIN.

**Respuesta 200:** objeto Route completo.

**Errores:** 404 NOT_FOUND.

---

### POST /routes

Crea una nueva ruta.

**Rol:** ADMIN.

**Body:**

json
{
  "originCity": "Bogotá",
  "destinationCity": "Medellín",
  "vehicleType": "CAMION",
  "status": "ACTIVA",
  "carrier": "Transportes Colombia S.A.S",
  "cost": 1500000,
  "distanceKm": 415,
  "estimatedTimeHours": 8,
  "region": "Andina",
  "scheduledAt": "2025-01-15T08:00:00Z"
}

Campos opcionales: distanceKm, estimatedTimeHours, region, scheduledAt, estimatedAt.

**Respuesta 201:** objeto Route creado.

**Errores:** 422 VALIDATION_ERROR, 401 UNAUTHORIZED, 403 FORBIDDEN.

---

### PUT /routes/:id

Actualiza una ruta existente. Todos los campos del body son opcionales.

**Rol:** ADMIN.

**Body:** mismo esquema que POST /routes, todos los campos opcionales.

**Respuesta 200:** objeto Route actualizado.

**Errores:** 404 NOT_FOUND, 422 VALIDATION_ERROR.

---

### PATCH /routes/:id/disable

Inhabilita una ruta (soft delete — establece isEnabled = false).

**Rol:** ADMIN.

**Respuesta 200:** objeto Route con isEnabled: false.

**Errores:** 404 NOT_FOUND, 409 CONFLICT (ruta ya inhabilitada).

---

## Formato de errores

json
{
  "success": false,
  "errorCode": "NOT_FOUND",
  "message": "Ruta no encontrada",
  "details": []
}

| errorCode             | HTTP |
| ----------------------- | ---- |
| UNAUTHORIZED          | 401  |
| FORBIDDEN             | 403  |
| NOT_FOUND             | 404  |
| CONFLICT              | 409  |
| VALIDATION_ERROR      | 422  |
| BAD_REQUEST           | 400  |
| INTERNAL_SERVER_ERROR | 500  |