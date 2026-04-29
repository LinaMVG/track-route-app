# Modelo de datos — track-route-app

 **Navegación:** [<- README](../README.md) | [ARCHITECTURE](ARCHITECTURE.md) | [STACK](STACK.md) | [LOCAL](LOCAL.md) | [ROUTES](ROUTES.md) | **DATA** | [SECURITY](SECURITY.md) | [INTEGRATION](INTEGRATION.md) | [RUNBOOK](RUNBOOK.md)

## 1. Tabla users

| Columna      | Tipo         | Restricciones                    |
| ------------ | ------------ | -------------------------------- |
| id         | UUID         | PK, gen_random_uuid()          |
| username   | VARCHAR(255) | NOT NULL, UNIQUE                 |
| email      | VARCHAR(255) | NOT NULL, UNIQUE                 |
| password   | VARCHAR(255) | NOT NULL — bcrypt hash (cost 12) |
| role       | VARCHAR(50)  | CHECK IN ('ADMIN', 'OPERADOR') |
| is_active  | BOOLEAN      | NOT NULL, DEFAULT TRUE           |
| created_at | TIMESTAMP    | NOT NULL, DEFAULT NOW()          |
| updated_at | TIMESTAMP    | NOT NULL, DEFAULT NOW()          |

## 2. Tabla routes

| Columna                | Tipo          | Restricciones                                                    |
| ---------------------- | ------------- | ---------------------------------------------------------------- |
| id                   | UUID          | PK, gen_random_uuid()                                          |
| origin_city          | VARCHAR(150)  | NOT NULL                                                         |
| destination_city     | VARCHAR(150)  | NOT NULL                                                         |
| vehicle_type         | VARCHAR(50)   | CHECK IN ('CAMION','TRACTOMULA','FURGONETA','MOTO_CARGO')      |
| status               | VARCHAR(50)   | CHECK IN ('ACTIVA','INACTIVA','SUSPENDIDA','EN_MANTENIMIENTO') |
| carrier              | VARCHAR(200)  | NOT NULL                                                         |
| cost                 | NUMERIC(12,2) | NOT NULL                                                         |
| distance_km          | NUMERIC(8,2)  | NULL permitido                                                   |
| estimated_time_hours | NUMERIC(6,2)  | NULL permitido                                                   |
| region               | VARCHAR(100)  | NULL permitido                                                   |
| scheduled_at         | TIMESTAMPTZ   | NULL permitido                                                   |
| estimated_at         | TIMESTAMPTZ   | NULL permitido                                                   |
| is_enabled           | BOOLEAN       | NOT NULL, DEFAULT TRUE                                           |
| created_by           | UUID          | FK → users(id), NULL permitido                                 |
| created_at           | TIMESTAMPTZ   | NOT NULL, DEFAULT NOW()                                          |
| updated_at           | TIMESTAMPTZ   | NOT NULL, DEFAULT NOW()                                          |

## 3. Enumeraciones

### RouteStatus

ACTIVA | INACTIVA | SUSPENDIDA | EN_MANTENIMIENTO

### VehicleType

CAMION | TRACTOMULA | FURGONETA | MOTO_CARGO

## 4. Entidades del dominio (TypeScript)

### Route

typescript
interface Route {
  id: string;
  originCity: string;
  destinationCity: string;
  vehicleType: VehicleType;
  status: RouteStatus;
  carrier: string;
  cost: number;
  distanceKm?: number;
  estimatedTimeHours?: number;
  region?: string;
  scheduledAt?: Date;
  estimatedAt?: Date;
  isEnabled: boolean;
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

### User

typescript
interface User {
  id: string;
  email: string;
  username: string;
  password: string; // bcrypt hash — nunca exponer en respuestas
  role: "ADMIN" | "OPERADOR";
  createdAt: Date;
  isActive: boolean;
}

## 5. Dataset inicial

El archivo dataset/routes_dataset.csv contiene rutas de prueba cargadas mediante npm run seed.

El seed crea además dos usuarios:

| Username    | Contraseña      | Rol      |
| ----------- | --------------- | -------- |
| admin     | Admin2024!    | ADMIN    |
| operador1 | Operador2024! | OPERADOR |