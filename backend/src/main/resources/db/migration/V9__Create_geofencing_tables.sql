-- Create geofences table
CREATE TABLE geofences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    type VARCHAR(50) NOT NULL CHECK (type IN ('AUTHORIZED_AREA', 'RESTRICTED_AREA', 'CUSTOMER_LOCATION', 'DEPOT', 'SERVICE_AREA', 'ROUTE_CHECKPOINT')),
    shape VARCHAR(20) NOT NULL CHECK (shape IN ('CIRCLE', 'POLYGON')),
    center_latitude DECIMAL(10,8),
    center_longitude DECIMAL(11,8),
    radius_meters INTEGER,
    polygon_coordinates TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    alert_type VARCHAR(30) NOT NULL CHECK (alert_type IN ('ENTRY_ONLY', 'EXIT_ONLY', 'ENTRY_AND_EXIT', 'UNAUTHORIZED_ENTRY', 'ROUTE_DEVIATION')),
    buffer_time_minutes INTEGER DEFAULT 0 CHECK (buffer_time_minutes >= 0),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create geofence_alerts table
CREATE TABLE geofence_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    geofence_id UUID NOT NULL REFERENCES geofences(id) ON DELETE CASCADE,
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    driver_id UUID REFERENCES drivers(id) ON DELETE SET NULL,
    gps_location_id UUID NOT NULL REFERENCES gps_locations(id) ON DELETE CASCADE,
    alert_type VARCHAR(30) NOT NULL CHECK (alert_type IN ('ENTRY', 'EXIT', 'UNAUTHORIZED_ENTRY', 'ROUTE_DEVIATION', 'SPEEDING_IN_ZONE', 'EXTENDED_STAY')),
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    message TEXT NOT NULL,
    latitude DECIMAL(10,8) NOT NULL,
    longitude DECIMAL(11,8) NOT NULL,
    speed DECIMAL(5,2),
    is_acknowledged BOOLEAN NOT NULL DEFAULT FALSE,
    acknowledged_by VARCHAR(100),
    acknowledged_at TIMESTAMP,
    notes TEXT,
    alert_time TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create vehicle_geofence_assignments table
CREATE TABLE vehicle_geofence_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    geofence_id UUID NOT NULL REFERENCES geofences(id) ON DELETE CASCADE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    assigned_at TIMESTAMP NOT NULL DEFAULT NOW(),
    unassigned_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create indexes for geofences
CREATE INDEX idx_geofences_name ON geofences(name);
CREATE INDEX idx_geofences_type ON geofences(type);
CREATE INDEX idx_geofences_is_active ON geofences(is_active);
CREATE INDEX idx_geofences_center_coords ON geofences(center_latitude, center_longitude);

-- Create indexes for geofence_alerts
CREATE INDEX idx_geofence_alerts_geofence_id ON geofence_alerts(geofence_id);
CREATE INDEX idx_geofence_alerts_vehicle_id ON geofence_alerts(vehicle_id);
CREATE INDEX idx_geofence_alerts_driver_id ON geofence_alerts(driver_id);
CREATE INDEX idx_geofence_alerts_alert_time ON geofence_alerts(alert_time DESC);
CREATE INDEX idx_geofence_alerts_severity ON geofence_alerts(severity);
CREATE INDEX idx_geofence_alerts_acknowledged ON geofence_alerts(is_acknowledged);
CREATE INDEX idx_geofence_alerts_vehicle_time ON geofence_alerts(vehicle_id, alert_time DESC);

-- Create indexes for vehicle_geofence_assignments
CREATE INDEX idx_vehicle_geofence_assignments_vehicle_id ON vehicle_geofence_assignments(vehicle_id);
CREATE INDEX idx_vehicle_geofence_assignments_geofence_id ON vehicle_geofence_assignments(geofence_id);
CREATE INDEX idx_vehicle_geofence_assignments_active ON vehicle_geofence_assignments(is_active);
CREATE UNIQUE INDEX idx_vehicle_geofence_unique_active ON vehicle_geofence_assignments(vehicle_id, geofence_id) WHERE is_active = TRUE;

-- Create trigger to update updated_at timestamp for geofences
CREATE OR REPLACE FUNCTION update_geofences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_geofences_updated_at
    BEFORE UPDATE ON geofences
    FOR EACH ROW
    EXECUTE FUNCTION update_geofences_updated_at();

-- Insert sample geofences
INSERT INTO geofences (name, description, type, shape, center_latitude, center_longitude, radius_meters, alert_type) VALUES
('Main Depot', 'Company main depot and headquarters', 'DEPOT', 'CIRCLE', 40.7128, -74.0060, 500, 'ENTRY_AND_EXIT'),
('Customer Site A', 'Major customer location downtown', 'CUSTOMER_LOCATION', 'CIRCLE', 40.7589, -73.9851, 200, 'ENTRY_AND_EXIT'),
('Restricted Zone', 'High security area - no unauthorized access', 'RESTRICTED_AREA', 'CIRCLE', 40.7505, -73.9934, 300, 'UNAUTHORIZED_ENTRY'),
('Service Area North', 'Northern service coverage area', 'SERVICE_AREA', 'CIRCLE', 40.7831, -73.9712, 1000, 'ENTRY_ONLY');

-- Insert sample vehicle assignments
INSERT INTO vehicle_geofence_assignments (vehicle_id, geofence_id, is_active)
SELECT v.id, g.id, TRUE
FROM vehicles v
CROSS JOIN geofences g
WHERE v.status = 'ACTIVE' AND g.is_active = TRUE
LIMIT 10;