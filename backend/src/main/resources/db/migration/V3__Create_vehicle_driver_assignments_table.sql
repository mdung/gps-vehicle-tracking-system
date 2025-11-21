CREATE TABLE IF NOT EXISTS vehicle_driver_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    driver_id UUID NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    unassigned_at TIMESTAMP,
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE INDEX idx_assignments_vehicle_active ON vehicle_driver_assignments(vehicle_id, is_active);
CREATE INDEX idx_assignments_driver_active ON vehicle_driver_assignments(driver_id, is_active);
CREATE INDEX idx_assignments_vehicle_id ON vehicle_driver_assignments(vehicle_id);
CREATE INDEX idx_assignments_driver_id ON vehicle_driver_assignments(driver_id);

-- Unique constraint for active assignments (one active assignment per vehicle)
CREATE UNIQUE INDEX idx_assignments_unique_active_vehicle 
ON vehicle_driver_assignments(vehicle_id) 
WHERE is_active = TRUE;



