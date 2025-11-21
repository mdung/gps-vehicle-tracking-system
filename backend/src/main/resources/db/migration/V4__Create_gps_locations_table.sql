CREATE TABLE IF NOT EXISTS gps_locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    speed DECIMAL(5, 2),
    direction DECIMAL(5, 2),
    timestamp TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_gps_locations_vehicle_timestamp ON gps_locations(vehicle_id, timestamp DESC);
CREATE INDEX idx_gps_locations_timestamp ON gps_locations(timestamp);
CREATE INDEX idx_gps_locations_vehicle_id ON gps_locations(vehicle_id);



