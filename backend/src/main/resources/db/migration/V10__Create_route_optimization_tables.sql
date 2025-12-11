-- Create optimized_routes table
CREATE TABLE optimized_routes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description VARCHAR(500),
    vehicle_id UUID,
    driver_id UUID,
    status VARCHAR(50) NOT NULL DEFAULT 'DRAFT',
    optimization_type VARCHAR(50) NOT NULL DEFAULT 'BALANCED',
    route_coordinates TEXT,
    waypoints TEXT,
    total_distance_km DECIMAL(10,2),
    estimated_duration_hours DECIMAL(8,2),
    estimated_fuel_cost DECIMAL(10,2),
    actual_distance_km DECIMAL(10,2),
    actual_duration_hours DECIMAL(8,2),
    actual_fuel_cost DECIMAL(10,2),
    efficiency_score DECIMAL(5,2),
    planned_start_time TIMESTAMP,
    planned_end_time TIMESTAMP,
    actual_start_time TIMESTAMP,
    actual_end_time TIMESTAMP,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create route_stops table
CREATE TABLE route_stops (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    optimized_route_id UUID NOT NULL,
    stop_order INTEGER NOT NULL,
    name VARCHAR(255) NOT NULL,
    address VARCHAR(500),
    latitude DECIMAL(10,8) NOT NULL,
    longitude DECIMAL(11,8) NOT NULL,
    stop_type VARCHAR(50) NOT NULL DEFAULT 'WAYPOINT',
    estimated_service_time_minutes DECIMAL(8,2),
    actual_service_time_minutes DECIMAL(8,2),
    planned_arrival_time TIMESTAMP,
    planned_departure_time TIMESTAMP,
    actual_arrival_time TIMESTAMP,
    actual_departure_time TIMESTAMP,
    status VARCHAR(50) DEFAULT 'PENDING',
    notes VARCHAR(1000),
    is_completed BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (optimized_route_id) REFERENCES optimized_routes(id) ON DELETE CASCADE
);

-- Create route_executions table
CREATE TABLE route_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    optimized_route_id UUID NOT NULL,
    gps_location_id UUID,
    sequence_number INTEGER NOT NULL,
    latitude DECIMAL(10,8) NOT NULL,
    longitude DECIMAL(11,8) NOT NULL,
    speed DECIMAL(5,2),
    direction DECIMAL(5,2),
    distance_from_planned_km DECIMAL(8,3),
    cumulative_distance_km DECIMAL(8,3),
    timestamp TIMESTAMP NOT NULL,
    deviation_type VARCHAR(50) DEFAULT 'ON_ROUTE',
    notes VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (optimized_route_id) REFERENCES optimized_routes(id) ON DELETE CASCADE
);

-- Add foreign key constraints if tables exist
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'vehicles') THEN
        ALTER TABLE optimized_routes ADD CONSTRAINT fk_optimized_routes_vehicle 
            FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE SET NULL;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'drivers') THEN
        ALTER TABLE optimized_routes ADD CONSTRAINT fk_optimized_routes_driver 
            FOREIGN KEY (driver_id) REFERENCES drivers(id) ON DELETE SET NULL;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'gps_locations') THEN
        ALTER TABLE route_executions ADD CONSTRAINT fk_route_executions_gps_location 
            FOREIGN KEY (gps_location_id) REFERENCES gps_locations(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX idx_optimized_routes_vehicle_id ON optimized_routes(vehicle_id);
CREATE INDEX idx_optimized_routes_driver_id ON optimized_routes(driver_id);
CREATE INDEX idx_optimized_routes_status ON optimized_routes(status);
CREATE INDEX idx_optimized_routes_created_at ON optimized_routes(created_at);
CREATE INDEX idx_optimized_routes_planned_start_time ON optimized_routes(planned_start_time);

CREATE INDEX idx_route_stops_route_id ON route_stops(optimized_route_id);
CREATE INDEX idx_route_stops_order ON route_stops(optimized_route_id, stop_order);
CREATE INDEX idx_route_stops_status ON route_stops(status);

CREATE INDEX idx_route_executions_route_id ON route_executions(optimized_route_id);
CREATE INDEX idx_route_executions_sequence ON route_executions(optimized_route_id, sequence_number);
CREATE INDEX idx_route_executions_timestamp ON route_executions(timestamp);
CREATE INDEX idx_route_executions_deviation_type ON route_executions(deviation_type);

-- Insert basic sample data
INSERT INTO optimized_routes (
    id, name, description, status, optimization_type,
    route_coordinates, waypoints, total_distance_km, estimated_duration_hours,
    estimated_fuel_cost, planned_start_time, planned_end_time
) VALUES 
(
    '11111111-1111-1111-1111-111111111111',
    'Sample Downtown Route',
    'Sample optimized route for downtown area',
    'PLANNED',
    'SHORTEST_DISTANCE',
    '[[-74.0060,40.7128],[-73.9857,40.7589],[-73.9442,40.8176]]',
    '[{"name":"Start","lat":40.7128,"lng":-74.0060,"type":"DEPOT"},{"name":"Stop A","lat":40.7589,"lng":-73.9857,"type":"DELIVERY"},{"name":"Stop B","lat":40.8176,"lng":-73.9442,"type":"DELIVERY"}]',
    25.50,
    2.5,
    45.00,
    CURRENT_TIMESTAMP + INTERVAL '1 hour',
    CURRENT_TIMESTAMP + INTERVAL '3.5 hours'
),
(
    '22222222-2222-2222-2222-222222222222',
    'Sample Service Route',
    'Sample service route with multiple stops',
    'COMPLETED',
    'FUEL_EFFICIENT',
    '[[-74.0060,40.7128],[-73.9712,40.7831],[-73.9442,40.8176]]',
    '[{"name":"Depot","lat":40.7128,"lng":-74.0060,"type":"DEPOT"},{"name":"Service A","lat":40.7831,"lng":-73.9712,"type":"SERVICE"},{"name":"Service B","lat":40.8176,"lng":-73.9442,"type":"SERVICE"}]',
    28.20,
    2.8,
    42.30,
    CURRENT_TIMESTAMP - INTERVAL '5 hours',
    CURRENT_TIMESTAMP - INTERVAL '2 hours'
);

-- Insert sample route stops
INSERT INTO route_stops (
    optimized_route_id, stop_order, name, address, latitude, longitude,
    stop_type, estimated_service_time_minutes, status, is_completed
) VALUES 
-- Sample Downtown Route stops
('11111111-1111-1111-1111-111111111111', 1, 'Start Point', '123 Start St, New York, NY', 40.7128, -74.0060, 'DEPOT', 0, 'PENDING', false),
('11111111-1111-1111-1111-111111111111', 2, 'Delivery Stop A', '456 Business Ave, New York, NY', 40.7589, -73.9857, 'DELIVERY', 15, 'PENDING', false),
('11111111-1111-1111-1111-111111111111', 3, 'Delivery Stop B', '789 Commerce St, New York, NY', 40.8176, -73.9442, 'DELIVERY', 20, 'PENDING', false),

-- Sample Service Route stops (completed)
('22222222-2222-2222-2222-222222222222', 1, 'Service Depot', '123 Depot St, New York, NY', 40.7128, -74.0060, 'DEPOT', 0, 'COMPLETED', true),
('22222222-2222-2222-2222-222222222222', 2, 'Service Location A', '987 Service Rd, New York, NY', 40.7831, -73.9712, 'SERVICE', 30, 'COMPLETED', true),
('22222222-2222-2222-2222-222222222222', 3, 'Service Location B', '147 Repair Ave, New York, NY', 40.8176, -73.9442, 'SERVICE', 25, 'COMPLETED', true);

-- Update completed route with actual metrics
UPDATE optimized_routes 
SET 
    actual_distance_km = 29.15,
    actual_duration_hours = 3.1,
    actual_fuel_cost = 43.75,
    efficiency_score = 92.5,
    actual_start_time = CURRENT_TIMESTAMP - INTERVAL '5 hours',
    actual_end_time = CURRENT_TIMESTAMP - INTERVAL '2 hours'
WHERE id = '22222222-2222-2222-2222-222222222222';

-- Insert sample route execution data for the completed route
INSERT INTO route_executions (
    optimized_route_id, sequence_number, latitude, longitude, speed, direction,
    distance_from_planned_km, cumulative_distance_km, timestamp, deviation_type
) VALUES 
('22222222-2222-2222-2222-222222222222', 1, 40.7128, -74.0060, 0, 90, 0.000, 0.000, CURRENT_TIMESTAMP - INTERVAL '5 hours', 'ON_ROUTE'),
('22222222-2222-2222-2222-222222222222', 2, 40.7200, -73.9950, 35, 45, 0.050, 1.200, CURRENT_TIMESTAMP - INTERVAL '4.8 hours', 'ON_ROUTE'),
('22222222-2222-2222-2222-222222222222', 3, 40.7400, -73.9800, 40, 30, 0.080, 3.500, CURRENT_TIMESTAMP - INTERVAL '4.5 hours', 'MINOR_DEVIATION'),
('22222222-2222-2222-2222-222222222222', 4, 40.7831, -73.9712, 25, 180, 0.020, 12.800, CURRENT_TIMESTAMP - INTERVAL '4 hours', 'ON_ROUTE'),
('22222222-2222-2222-2222-222222222222', 5, 40.8000, -73.9500, 45, 60, 0.120, 18.200, CURRENT_TIMESTAMP - INTERVAL '3.2 hours', 'ON_ROUTE'),
('22222222-2222-2222-2222-222222222222', 6, 40.8176, -73.9442, 30, 270, 0.030, 29.150, CURRENT_TIMESTAMP - INTERVAL '2.5 hours', 'ON_ROUTE');

COMMENT ON TABLE optimized_routes IS 'Stores optimized route plans with multiple stops and performance metrics';
COMMENT ON TABLE route_stops IS 'Individual stops/waypoints within an optimized route';
COMMENT ON TABLE route_executions IS 'Real-time execution tracking data for route replay and analysis';