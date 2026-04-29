🚀 Track Route App

Sistema backend para la gestión de rutas de transporte, con autenticación segura, manejo de usuarios, procesamiento de datasets y arquitectura limpia (Clean Architecture).

📌 Descripción

Track Route App es una API backend desarrollada en Node.js + TypeScript, orientada a gestionar rutas logísticas (origen, destino, costos, estados, etc.), con funcionalidades como:

Autenticación con JWT
Gestión de rutas
Importación masiva desde CSV
Sistema de roles
Validaciones robustas
Arquitectura hexagonal

Este tipo de sistemas se usa comúnmente en logística y tracking de rutas, donde se requiere registrar trayectos, costos y estados de transporte .

🧱 Arquitectura

El proyecto sigue Clean Architecture / Hexagonal Architecture:

src/
│
├── domain/          → Entidades + reglas de negocio
├── application/     → Casos de uso (Use Cases)
├── infraestructure/ → DB, externos (PostgreSQL, CSV, SOAP)
├── interfaces/      → HTTP (routes, controllers)
├── shared/          → utils, logger, errores
🔹 Principios aplicados
Separación de responsabilidades
Inversión de dependencias
Testabilidad (mock de repositorios)
Bajo acoplamiento
⚙️ Tecnologías
Node.js
TypeScript
Fastify
PostgreSQL
Docker
Zod (validaciones)
Jest (testing)
bcrypt (seguridad)
JWT
🔐 Seguridad
Hash de contraseñas con bcrypt (cost 12)
JWT con expiración configurable
Protección contra timing attacks (dummy hash)
Validación de inputs con Zod
Rate limiting (Fastify)
🗄️ Base de Datos

Motor: PostgreSQL

Tablas principales:

Users
id
username
email
password
role
createdAt
Routes
origin_city
destination_city
distance_km
estimated_time_hours
vehicle_type
carrier
cost
status
🐳 Setup con Docker
docker run --name trackroute-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=track_route_db \
  -p 5432:5432 \
  -d postgres:16
🔧 Configuración

Crear archivo .env:

DATABASE_URL=postgres://postgres:password@localhost:5432/track_route_db
JWT_SECRET=super_secret_key_32_characters_minimum
JWT_EXPIRES_IN=8h
▶️ Ejecución
Desarrollo
npm run dev
Build
npm run build
npm start
🧬 Migraciones
npm run migrate
🌱 Seed de datos
npm run seed

Incluye:

Usuarios iniciales
Importación de dataset CSV
Validación de datos inválidos
🧪 Testing
npm run test

Coverage:

npm run test:coverage
📊 Funcionalidades principales
🔐 Autenticación
Login con JWT
Validación de credenciales
Manejo de errores seguro
🚚 Rutas
Crear ruta
Listar rutas con filtros
Actualizar ruta
Deshabilitar ruta
Paginación con cursor
📂 Importación masiva
Lectura de CSV
Validación de datos
Inserción en base de datos
📥 Ejemplo de endpoint
Login
POST /auth/login
{
  "username": "admin",
  "password": "Admin2024!"
}
🧠 Decisiones técnicas clave
1. Uso de Clean Architecture

Permite:

Escalar el sistema
Testear fácilmente
Cambiar DB sin afectar lógica
2. Uso de Repository Pattern
IRouteRepository

Desacopla la lógica de negocio de la base de datos.

3. Validación con Zod
Evita datos inválidos desde entrada
Mensajes claros
Tipado seguro
4. Uso de JWT desacoplado
signTokenFn

Permite:

Mockear en tests
Cambiar implementación fácilmente
🧪 Testing Strategy
Unit tests para Use Cases
Mock de repositorios
Validación de errores
Coverage mínimo esperado: 80%
🚀 Posibles mejoras
Refresh tokens
RBAC (roles avanzados)
Rate limiting por usuario
Cache con Redis
Deploy en AWS (ECS + RDS)
CI/CD (GitHub Actions)
📌 Estado del proyecto

✔ Backend funcional
✔ Arquitectura limpia
✔ Tests implementados
✔ Seed de datos

----------------


🎨 Frontend — Track Route App

📌 Descripción

El frontend es una aplicación web desarrollada para consumir la API de Track Route App, permitiendo:

Autenticación de usuarios
Gestión de rutas (CRUD)
Visualización de datos logísticos
Filtros y paginación
🧱 Arquitectura Frontend (recomendada)


👉 Angular 17 + Atomic Design
src/
│
├── app/
│   ├── core/        → servicios, guards, interceptors
│   ├── shared/      → componentes reutilizables
│   ├── features/
│   │     ├── auth/
│   │     └── routes/
│   ├── layouts/
│   └── pages/
⚙️ Tecnologías
Angular 17
TypeScript
RxJS
Angular Router
Tailwind o Angular Material
JWT (consumo)
🔐 Autenticación

Flujo:

Usuario inicia sesión
Backend devuelve accessToken
Se guarda en:
localStorage (simple)
o memory (más seguro)
Interceptor agrega token:
Authorization: Bearer <token>
🧩 Módulos clave
🔐 Auth
LoginComponent
AuthService
AuthGuard
Token interceptor
🚚 Routes
ListRoutesComponent
CreateRouteComponent
UpdateRouteComponent
RouteService
📊 Pantallas mínimas 
1. Login
username
password
manejo de error
2. Dashboard / Listado de rutas
tabla con:
origen
destino
estado
costo
filtros:
ciudad
estado
paginación
3. Crear ruta

Formulario con:

originCity
destinationCity
vehicleType
cost
carrier
4. Editar / Deshabilitar
botón editar
botón desactivar
🔌 Integración con backend

Ejemplo service:

@Injectable({ providedIn: 'root' })
export class RouteService {
  private api = 'http://localhost:3000/routes';

  constructor(private http: HttpClient) {}

  getRoutes(params: any) {
    return this.http.get(this.api, { params });
  }

  createRoute(data: any) {
    return this.http.post(this.api, data);
  }

  updateRoute(id: string, data: any) {
    return this.http.put(`${this.api}/${id}`, data);
  }

  disableRoute(id: string) {
    return this.http.patch(`${this.api}/${id}/disable`, {});
  }
}
🧠 Decisiones importantes (para defender en entrevista)
1. Interceptor para JWT

✔ centraliza autenticación
✔ evita repetir código

2. Separación por features

✔ escalable
✔ mantenible

3. Reactive Forms

✔ validaciones robustas
✔ control total del formulario

👩‍💻 Autor

Lina Marcela Velásquez Garzón



