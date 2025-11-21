CREATE TABLE IF NOT EXISTS routes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    driver_id UUID REFERENCES drivers(id) ON DELETE SET NULL,
    start_location_id UUID REFERENCES gps_locations(id),
    end_location_id UUID REFERENCES gps_locations(id),
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP,
    distance_km DECIMAL(10, 2),
    status VARCHAR(20) NOT NULL DEFAULT 'IN_PROGRESS'
);

CREATE INDEX idx_routes_vehicle_status ON routes(vehicle_id, status);
CREATE INDEX idx_routes_start_time ON routes(start_time);
CREATE INDEX idx_routes_vehicle_id ON routes(vehicle_id);
CREATE INDEX idx_routes_driver_id ON routes(driver_id);

