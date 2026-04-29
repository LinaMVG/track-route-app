-- Indices de rendimiento
CREATE INDEX IF NOT EXISTS idx_routes_origin_city ON routes (origin_city);
CREATE INDEX IF NOT EXISTS idx_routes_destination_city ON routes (destination_city);
CREATE INDEX IF NOT EXISTS idx_routes_status ON routes (status);
CREATE INDEX IF NOT EXISTS idx_routes_vehicle_type ON routes (vehicle_type);
CREATE INDEX IF NOT EXISTS idx_routes_carrier ON routes (carrier);
CREATE INDEX IF NOT EXISTS idx_routes_created_at ON routes (created_at, DESC);
CREATE INDEX IF NOT EXISTS idx_routes_cost ON routes (cost DESC);
CREATE INDEX IF NOT EXISTS idx_routes_cursor ON routes (created_at DESC, id);



