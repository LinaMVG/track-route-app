# Integración — track-route-app

 **Navegación:** [<- README](../README.md) | [ARCHITECTURE](ARCHITECTURE.md) | [STACK](STACK.md) | [LOCAL](LOCAL.md) | [ROUTES](ROUTES.md) | [DATA](DATA.md) | [SECURITY](SECURITY.md) | **INTEGRATION** | [RUNBOOK](RUNBOOK.md)

## 1. Servicio SOAP de tracking

El backend se integra con un servicio externo de rastreo de envíos via **SOAP** usando node-soap.

| Parámetro  | Variable de entorno | Descripción                           |
| ---------- | ------------------- | ------------------------------------- |
| WSDL URL   | SOAP_WSDL_URL     | URL del descriptor WSDL del servicio  |
| Usuario    | SOAP_USERNAME     | Credencial de acceso al servicio SOAP |
| Contraseña | SOAP_PASSWORD     | Credencial de acceso al servicio SOAP |

**Adaptador:** src/infraestructure/soap/ implementa el puerto ISoapTrackingAdapter definido en el dominio. La lógica de negocio no depende directamente de node-soap.

Para desarrollo local sin el servicio real, se puede levantar un servidor SOAP mock:

bash
cd backend && npm run soap:mock

## 2. WebSocket — monitoreo en tiempo real

El servidor expone un canal WebSocket via @fastify/websocket para enviar alertas y actualizaciones de estado de rutas al frontend sin necesidad de polling.

URL base: ws://localhost:3000
Autenticación: el cliente debe enviar el JWT en el mensaje de handshake inicial.
Uso previsto: alertas de cambio de estado, eventos de monitoreo de rutas activas.

## 3. Frontend → Backend REST

El frontend Angular consume la API REST del backend mediante HttpClient. La URL base se configura en los archivos de entorno:

Desarrollo: src/environments/environment.ts
Producción: src/environments/environment.prod.ts

Un HttpInterceptor de la capa core/ adjunta automáticamente el header Authorization: Bearer <token> a cada petición autenticada.

## 4. Base de datos PostgreSQL

Conexión gestionada mediante un pool de pg configurado en src/shared/container.ts. La cadena de conexión se lee de DATABASE_URL.

### Migraciones

Los archivos SQL se encuentran en src/infraestructure/db/migrations/ y se ejecutan en orden numérico:

| Archivo                 | Descripción    |
| ----------------------- | -------------- |
| 001_create_users.sql  | Tabla users  |
| 002_create_routes.sql | Tabla routes |

bash
cd backend && npm run migrate

Las migraciones son idempotentes (CREATE TABLE IF NOT EXISTS).