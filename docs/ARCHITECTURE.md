# Arquitectura — track-route-app

 **Navegación:** [<- README](../README.md) | **ARCHITECTURE** | [STACK](STACK.md) | [LOCAL](LOCAL.md) | [ROUTES](ROUTES.md) | [DATA](DATA.md) | [SECURITY](SECURITY.md) | [INTEGRATION](INTEGRATION.md) | [RUNBOOK](RUNBOOK.md)

## 1. Patrón general

Arquitectura Hexagonal (Ports & Adapters) en el backend y arquitectura por features en el frontend.

**Backend:** las reglas de negocio (dominio + casos de uso) son independientes de la infraestructura (base de datos, SOAP, HTTP). Cada dependencia externa se acopla únicamente a través de una interfaz (puerto).

**Frontend:** organización por features con servicios de capa core, componentes compartidos y módulos lazy-loaded.

## 2. Capas del backend

src/
├── domain/          # Entidades, value objects, puertos (interfaces puras)
├── application/     # Casos de uso (orquestan el dominio)
├── infraestructure/ # Implementaciones concretas (PostgreSQL, SOAP, caché)
├── interfaces/      # Adaptadores HTTP (Fastify routes, schemas Zod, middlewares)
└── shared/          # Logger, AppError, contenedor DI, manejador de errores

### 2.1 Flujo de una petición HTTP

HTTP Request
    → Fastify route (interfaces/http/routes)
        → Zod schema validation
        → Auth middleware (JWT verify)
        → RBAC middleware (rol requerido)
            → Use Case (application/)
                → Domain entity / port
                → Repository impl (infraestructure/db)
                    → PostgreSQL
            ← Route entity
        ← JSON response

## 3. Casos de uso implementados

| Caso de uso           | Ubicación                     | Roles permitidos |
| --------------------- | ----------------------------- | ---------------- |
| LoginUseCase        | application/use-cases/auth/ | público          |
| ListRoutesUseCase   | application/routes/         | OPERADOR, ADMIN  |
| GetRouteByIdUseCase | application/routes/         | OPERADOR, ADMIN  |
| CreateRouteUseCase  | application/routes/         | ADMIN            |
| UpdateRouteUseCase  | application/routes/         | ADMIN            |
| DisableRouteUseCase | application/routes/         | ADMIN            |

## 4. Frontend — estructura de features

src/app/
├── core/     # AuthService (signals), guards, interceptors, servicios globales
├── features/ # auth/, routes/ (list + form), dashboard/, monitoring/
└── shared/   # Componentes reutilizables (DataTable, NotificationToast), modelos

## 5. Comunicación entre capas

| Canal                | Tecnología         | Uso                                |
| -------------------- | ------------------ | ---------------------------------- |
| Frontend → Backend   | REST / HTTP        | CRUD rutas, autenticación          |
| Backend → Base datos | pg (node-postgres) | Persistencia de usuarios y rutas   |
| Backend → Tracking   | SOAP (node-soap)   | Consulta de posición de envío      |
| Backend → Frontend   | WebSocket          | Alertas y monitoreo en tiempo real |