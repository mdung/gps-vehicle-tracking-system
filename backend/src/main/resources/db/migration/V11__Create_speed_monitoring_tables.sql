-- Create speed_limits table
CREATE TABLE IF NOT EXISTS speed_limits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description VARCHAR(500),
    area_type VARCHAR(50) NOT NULL DEFAULT 'GENERAL',
    speed_limit_kmh DECIMAL(5,2) NOT NULL,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    radius_meters DECIMAL(8,2),
    polygon_coordinates TEXT,
    road_type VARCHAR(50) DEFAULT 'CITY_STREET',
    time_restrictions VARCHAR(255),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create speed_violations table
CREATE TABLE IF NOT EXISTS speed_violations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id UUID,
    driver_id UUID,
    gps_location_id UUID,
    speed_limit_id UUID,
    violation_time TIMESTAMP NOT NULL,
    recorded_speed_kmh DECIMAL(5,2) NOT NULL,
    speed_limit_kmh DECIMAL(5,2) NOT NULL,
    speed_over_limit_kmh DECIMAL(5,2) NOT NULL,
    violation_severity VARCHAR(50) NOT NULL DEFAULT 'MINOR',
    latitude DECIMAL(10,8) NOT NULL,
    longitude DECIMAL(11,8) NOT NULL,
    location_description VARCHAR(500),
    weather_conditions VARCHAR(100),
    road_conditions VARCHAR(100),
    is_acknowledged BOOLEAN NOT NULL DEFAULT false,
    acknowledged_by VARCHAR(255),
    acknowledged_at TIMESTAMP,
    acknowledgment_notes VARCHAR(1000),
    fine_amount DECIMAL(10,2),
    points_deducted INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create speed_history table
CREATE TABLE IF NOT EXISTS speed_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id UUID,
    driver_id UUID,
    gps_location_id UUID,
    recorded_time TIMESTAMP NOT NULL,
    speed_kmh DECIMAL(5,2) NOT NULL,
    latitude DECIMAL(10,8) NOT NULL,
    longitude DECIMAL(11,8) NOT NULL,
    applicable_speed_limit_kmh DECIMAL(5,2),
    is_violation BOOLEAN NOT NULL DEFAULT false,
    violation_id UUID,
    road_type VARCHAR(50),
    weather_conditions VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create speed_reports table
CREATE TABLE IF NOT EXISTS speed_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_name VARCHAR(255) NOT NULL,
    report_type VARCHAR(50) NOT NULL DEFAULT 'VIOLATION_SUMMARY',
    vehicle_id UUID,
    driver_id UUID,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_violations INTEGER DEFAULT 0,
    minor_violations INTEGER DEFAULT 0,
    major_violations INTEGER DEFAULT 0,
    severe_violations INTEGER DEFAULT 0,
    total_distance_km DECIMAL(10,2),
    average_speed_kmh DECIMAL(5,2),
    max_speed_kmh DECIMAL(5,2),
    total_fine_amount DECIMAL(10,2),
    total_points_deducted INTEGER DEFAULT 0,
    report_data TEXT,
    generated_by VARCHAR(255),
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_speed_limits_area_type ON speed_limits(area_type);
CREATE INDEX IF NOT EXISTS idx_speed_limits_active ON speed_limits(is_active);
CREATE INDEX IF NOT EXISTS idx_speed_limits_location ON speed_limits(latitude, longitude);

CREATE INDEX IF NOT EXISTS idx_speed_violations_vehicle_id ON speed_violations(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_speed_violations_driver_id ON speed_violations(driver_id);
CREATE INDEX IF NOT EXISTS idx_speed_violations_time ON speed_violations(violation_time);
CREATE INDEX IF NOT EXISTS idx_speed_violations_severity ON speed_violations(violation_severity);
CREATE INDEX IF NOT EXISTS idx_speed_violations_acknowledged ON speed_violations(is_acknowledged);

CREATE INDEX IF NOT EXISTS idx_speed_history_vehicle_id ON speed_history(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_speed_history_driver_id ON speed_history(driver_id);
CREATE INDEX IF NOT EXISTS idx_speed_history_time ON speed_history(recorded_time);
CREATE INDEX IF NOT EXISTS idx_speed_history_violation ON speed_history(is_violation);

CREATE INDEX IF NOT EXISTS idx_speed_reports_type ON speed_reports(report_type);
CREATE INDEX IF NOT EXISTS idx_speed_reports_date_range ON speed_reports(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_speed_reports_generated_at ON speed_reports(generated_at);

-- Insert sample speed limits
INSERT INTO speed_limits (
    id, name, description, area_type, speed_limit_kmh, 
    latitude, longitude, radius_meters, road_type
) VALUES 
(
    '11111111-1111-1111-1111-111111111111',
    'Downtown Business District',
    'Speed limit for downtown business area',
    'BUSINESS_DISTRICT',
    30.0,
    40.7128,
    -74.0060,
    2000.0,
    'CITY_STREET'
),
(
    '22222222-2222-2222-2222-222222222222',
    'Highway Route 95',
    'Main highway speed limit',
    'HIGHWAY',
    100.0,
    40.7500,
    -73.9500,
    5000.0,
    'HIGHWAY'
),
(
    '33333333-3333-3333-3333-333333333333',
    'School Zone - Elementary',
    'Reduced speed limit near elementary school',
    'SCHOOL_ZONE',
    25.0,
    40.7300,
    -73.9800,
    500.0,
    'SCHOOL_ZONE'
),
(
    '44444444-4444-4444-4444-444444444444',
    'Residential Area North',
    'Standard residential speed limit',
    'RESIDENTIAL',
    50.0,
    40.7600,
    -73.9600,
    3000.0,
    'RESIDENTIAL'
)
ON CONFLICT (id) DO NOTHING;

-- Insert sample speed violations
INSERT INTO speed_violations (
    id, violation_time, recorded_speed_kmh, 
    speed_limit_kmh, speed_over_limit_kmh, violation_severity,
    latitude, longitude, location_description, speed_limit_id,
    fine_amount, points_deducted
) VALUES 
(
    '11111111-1111-1111-1111-111111111111',
    CURRENT_TIMESTAMP - INTERVAL '2 hours',
    45.0,
    30.0,
    15.0,
    'MINOR',
    40.7128,
    -74.0060,
    'Downtown Business District - Main Street',
    '11111111-1111-1111-1111-111111111111',
    50.00,
    1
),
(
    '22222222-2222-2222-2222-222222222222',
    CURRENT_TIMESTAMP - INTERVAL '1 day',
    130.0,
    100.0,
    30.0,
    'MAJOR',
    40.7500,
    -73.9500,
    'Highway Route 95 - Mile Marker 15',
    '22222222-2222-2222-2222-222222222222',
    150.00,
    3
),
(
    '33333333-3333-3333-3333-333333333333',
    CURRENT_TIMESTAMP - INTERVAL '3 hours',
    40.0,
    25.0,
    15.0,
    'SEVERE',
    40.7300,
    -73.9800,
    'School Zone - Elementary School Area',
    '33333333-3333-3333-3333-333333333333',
    300.00,
    6
)
ON CONFLICT (id) DO NOTHING;

-- Insert sample speed history
INSERT INTO speed_history (
    recorded_time, speed_kmh, latitude, longitude,
    applicable_speed_limit_kmh, is_violation, road_type
) VALUES 
(CURRENT_TIMESTAMP - INTERVAL '4 hours', 28.0, 40.7128, -74.0060, 30.0, false, 'CITY_STREET'),
(CURRENT_TIMESTAMP - INTERVAL '3.5 hours', 32.0, 40.7130, -74.0058, 30.0, false, 'CITY_STREET'),
(CURRENT_TIMESTAMP - INTERVAL '2 days', 95.0, 40.7500, -73.9500, 100.0, false, 'HIGHWAY'),
(CURRENT_TIMESTAMP - INTERVAL '2 hours', 45.0, 40.7128, -74.0060, 30.0, true, 'CITY_STREET'),
(CURRENT_TIMESTAMP - INTERVAL '1 day', 130.0, 40.7500, -73.9500, 100.0, true, 'HIGHWAY');

-- Insert sample speed report
INSERT INTO speed_reports (
    id, report_name, report_type, start_date, end_date,
    total_violations, minor_violations, major_violations, severe_violations,
    total_distance_km, average_speed_kmh, max_speed_kmh, total_fine_amount, total_points_deducted
) VALUES 
(
    '11111111-1111-1111-1111-111111111111',
    'Weekly Speed Report - Sample Fleet',
    'VIOLATION_SUMMARY',
    CURRENT_DATE - INTERVAL '7 days',
    CURRENT_DATE,
    3,
    1,
    1,
    1,
    245.5,
    42.3,
    130.0,
    500.00,
    10
)
ON CONFLICT (id) DO NOTHING;