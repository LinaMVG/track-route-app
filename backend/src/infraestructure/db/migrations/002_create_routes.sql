-- TABLA DE RUTAS
CREATE TABLE IF NOT EXISTS routes (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    origin_city      VARCHAR(150) NOT NULL,
    destination_city VARCHAR(150) NOT NULL,
    vehicle_type     VARCHAR(50)  NOT NULL CHECK (vehicle_type IN ('CAMION', 'TRACTOMULA', 'FURGONETA', 'MOTO_CARGO')),
    status           VARCHAR(50)  NOT NULL CHECK (status IN ('ACTIVA', 'INACTIVA', 'SUSPENDIDA', 'EN_MANTENIMIENTO')),
    carrier          VARCHAR(200) NOT NULL,
    cost             NUMERIC(12,2) NOT NULL,
    distance_km      NUMERIC(8,2),
    estimated_time_hours NUMERIC(6,2),
    region           VARCHAR(100),
    scheduled_at     TIMESTAMPTZ,
    estimated_at     TIMESTAMPTZ,
    is_enabled       BOOLEAN NOT NULL DEFAULT TRUE,
    created_by       UUID REFERENCES users(id),
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);