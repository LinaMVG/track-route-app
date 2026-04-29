# Stack técnico — track-route-app

 **Navegación:** [<- README](../README.md) | [ARCHITECTURE](ARCHITECTURE.md) | **STACK** | [LOCAL](LOCAL.md) | [ROUTES](ROUTES.md) | [DATA](DATA.md) | [SECURITY](SECURITY.md) | [INTEGRATION](INTEGRATION.md) | [RUNBOOK](RUNBOOK.md)

## 1. Backend

| Categoría            | Tecnología                     | Versión |
| -------------------- | ------------------------------ | ------- |
| Runtime              | Node.js                        | ≥ 20.x  |
| Framework HTTP       | Fastify                        | ^5.8.5  |
| Lenguaje             | TypeScript (strict)            | ^6.0.3  |
| Validación           | Zod                            | ^4.3.6  |
| Autenticación        | @fastify/jwt (HS256)           | ^10.0.0 |
| Seguridad HTTP       | @fastify/helmet, @fastify/cors | —       |
| Rate limiting        | @fastify/rate-limit            | ^10.3.0 |
| Upload multipart     | @fastify/multipart             | ^10.0.0 |
| WebSocket            | @fastify/websocket             | ^11.2.0 |
| Base de datos        | PostgreSQL                     | ≥ 14    |
| Driver BD            | pg (node-postgres)             | ^8.20.0 |
| Hash contraseñas     | bcrypt (cost 12)               | ^6.0.0  |
| Logging              | pino + pino-http               | ^10.3.1 |
| SOAP                 | node-soap                      | ^1.0.0  |
| CSV import           | csv-parse                      | ^6.2.1  |
| Variables de entorno | dotenv                         | ^17.4.2 |

## 2. Frontend

| Categoría       | Tecnología                 | Versión  |
| --------------- | -------------------------- | -------- |
| Framework       | Angular (SSR opcional)     | ^19.2.x  |
| Lenguaje        | TypeScript                 | ~5.7.x   |
| Estado reactivo | Angular Signals            | built-in |
| HTTP Client     | Angular HttpClient         | built-in |
| Routing         | Angular Router (lazy load) | built-in |
| Estilos         | SCSS                       | —        |

## 3. Herramientas de desarrollo y calidad

| Herramienta                | Uso                                     |
| -------------------------- | --------------------------------------- |
| Jest + ts-jest             | Pruebas unitarias backend               |
| @types/jest                | Tipado Jest en TypeScript               |
| supertest                  | Pruebas de integración HTTP             |
| Karma + Jasmine            | Pruebas unitarias frontend              |
| ESLint + typescript-eslint | Linting backend                         |
| tsx                        | Ejecución TS en desarrollo (hot-reload) |
| ts-node-dev                | Alternativa hot-reload                  |

## 4. Scripts principales

### Backend

bash
npm run dev           # Servidor con hot-reload (tsx watch)
npm run build         # Compila TypeScript a dist/
npm run start         # Ejecuta build compilado
npm run migrate       # Aplica migraciones SQL en PostgreSQL
npm run seed          # Carga usuarios y rutas iniciales
npm run soap:mock     # Levanta servidor SOAP mock local
npm test              # Pruebas unitarias (jest --runInBand)
npm run test:coverage # Cobertura de pruebas (reporte en coverage/)

### Frontend

bash
ng serve              # Servidor de desarrollo en http://localhost:4200
ng build              # Build de producción en dist/
ng test               # Pruebas unitarias (Karma)
