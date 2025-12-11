-- Create maintenance_types table
CREATE TABLE IF NOT EXISTS maintenance_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description VARCHAR(500),
    category VARCHAR(100) NOT NULL,
    estimated_duration_hours DECIMAL(5,2),
    estimated_cost DECIMAL(10,2),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create maintenance_schedules table
CREATE TABLE IF NOT EXISTS maintenance_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id UUID NOT NULL,
    maintenance_type_id UUID NOT NULL,
    schedule_type VARCHAR(50) NOT NULL DEFAULT 'MILEAGE',
    mileage_interval INTEGER,
    time_interval_days INTEGER,
    last_service_date DATE,
    last_service_mileage INTEGER,
    next_due_date DATE,
    next_due_mileage INTEGER,
    is_active BOOLEAN NOT NULL DEFAULT true,
    notes VARCHAR(1000),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create maintenance_records table
CREATE TABLE IF NOT EXISTS maintenance_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id UUID NOT NULL,
    maintenance_type_id UUID NOT NULL,
    maintenance_schedule_id UUID,
    service_date DATE NOT NULL,
    service_mileage INTEGER,
    service_provider VARCHAR(255),
    technician_name VARCHAR(255),
    labor_cost DECIMAL(10,2),
    parts_cost DECIMAL(10,2),
    total_cost DECIMAL(10,2),
    duration_hours DECIMAL(5,2),
    status VARCHAR(50) NOT NULL DEFAULT 'COMPLETED',
    priority VARCHAR(50) DEFAULT 'MEDIUM',
    description VARCHAR(1000),
    notes VARCHAR(1000),
    next_service_due_date DATE,
    next_service_due_mileage INTEGER,
    warranty_expiry_date DATE,
    receipt_number VARCHAR(100),
    created_by VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create maintenance_reminders table
CREATE TABLE IF NOT EXISTS maintenance_reminders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id UUID NOT NULL,
    maintenance_schedule_id UUID NOT NULL,
    reminder_type VARCHAR(50) NOT NULL DEFAULT 'DUE_SOON',
    reminder_date DATE NOT NULL,
    due_date DATE NOT NULL,
    due_mileage INTEGER,
    current_mileage INTEGER,
    days_overdue INTEGER DEFAULT 0,
    mileage_overdue INTEGER DEFAULT 0,
    is_acknowledged BOOLEAN NOT NULL DEFAULT false,
    acknowledged_by VARCHAR(255),
    acknowledged_at TIMESTAMP,
    message VARCHAR(500),
    priority VARCHAR(50) DEFAULT 'MEDIUM',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create maintenance_costs table
CREATE TABLE IF NOT EXISTS maintenance_costs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    maintenance_record_id UUID NOT NULL,
    cost_type VARCHAR(100) NOT NULL,
    item_name VARCHAR(255) NOT NULL,
    quantity DECIMAL(8,2) DEFAULT 1,
    unit_cost DECIMAL(10,2) NOT NULL,
    total_cost DECIMAL(10,2) NOT NULL,
    supplier VARCHAR(255),
    part_number VARCHAR(100),
    warranty_months INTEGER DEFAULT 0,
    notes VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add foreign key constraints
DO $$
BEGIN
    -- Add foreign keys for vehicles table if it exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'vehicles') THEN
        BEGIN
            ALTER TABLE maintenance_schedules ADD CONSTRAINT fk_maintenance_schedules_vehicle 
                FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE;
        EXCEPTION WHEN duplicate_object THEN NULL; END;
        
        BEGIN
            ALTER TABLE maintenance_records ADD CONSTRAINT fk_maintenance_records_vehicle 
                FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE;
        EXCEPTION WHEN duplicate_object THEN NULL; END;
        
        BEGIN
            ALTER TABLE maintenance_reminders ADD CONSTRAINT fk_maintenance_reminders_vehicle 
                FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE;
        EXCEPTION WHEN duplicate_object THEN NULL; END;
    END IF;
    
    -- Add internal foreign keys
    BEGIN
        ALTER TABLE maintenance_schedules ADD CONSTRAINT fk_maintenance_schedules_type 
            FOREIGN KEY (maintenance_type_id) REFERENCES maintenance_types(id) ON DELETE CASCADE;
    EXCEPTION WHEN duplicate_object THEN NULL; END;
    
    BEGIN
        ALTER TABLE maintenance_records ADD CONSTRAINT fk_maintenance_records_type 
            FOREIGN KEY (maintenance_type_id) REFERENCES maintenance_types(id) ON DELETE CASCADE;
    EXCEPTION WHEN duplicate_object THEN NULL; END;
    
    BEGIN
        ALTER TABLE maintenance_records ADD CONSTRAINT fk_maintenance_records_schedule 
            FOREIGN KEY (maintenance_schedule_id) REFERENCES maintenance_schedules(id) ON DELETE SET NULL;
    EXCEPTION WHEN duplicate_object THEN NULL; END;
    
    BEGIN
        ALTER TABLE maintenance_reminders ADD CONSTRAINT fk_maintenance_reminders_schedule 
            FOREIGN KEY (maintenance_schedule_id) REFERENCES maintenance_schedules(id) ON DELETE CASCADE;
    EXCEPTION WHEN duplicate_object THEN NULL; END;
    
    BEGIN
        ALTER TABLE maintenance_costs ADD CONSTRAINT fk_maintenance_costs_record 
            FOREIGN KEY (maintenance_record_id) REFERENCES maintenance_records(id) ON DELETE CASCADE;
    EXCEPTION WHEN duplicate_object THEN NULL; END;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_maintenance_types_category ON maintenance_types(category);
CREATE INDEX IF NOT EXISTS idx_maintenance_types_active ON maintenance_types(is_active);

CREATE INDEX IF NOT EXISTS idx_maintenance_schedules_vehicle_id ON maintenance_schedules(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_schedules_type_id ON maintenance_schedules(maintenance_type_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_schedules_next_due_date ON maintenance_schedules(next_due_date);
CREATE INDEX IF NOT EXISTS idx_maintenance_schedules_active ON maintenance_schedules(is_active);

CREATE INDEX IF NOT EXISTS idx_maintenance_records_vehicle_id ON maintenance_records(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_records_type_id ON maintenance_records(maintenance_type_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_records_service_date ON maintenance_records(service_date);
CREATE INDEX IF NOT EXISTS idx_maintenance_records_status ON maintenance_records(status);

CREATE INDEX IF NOT EXISTS idx_maintenance_reminders_vehicle_id ON maintenance_reminders(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_reminders_due_date ON maintenance_reminders(due_date);
CREATE INDEX IF NOT EXISTS idx_maintenance_reminders_acknowledged ON maintenance_reminders(is_acknowledged);
CREATE INDEX IF NOT EXISTS idx_maintenance_reminders_priority ON maintenance_reminders(priority);

CREATE INDEX IF NOT EXISTS idx_maintenance_costs_record_id ON maintenance_costs(maintenance_record_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_costs_type ON maintenance_costs(cost_type);

-- Insert sample maintenance types
INSERT INTO maintenance_types (
    id, name, description, category, estimated_duration_hours, estimated_cost
) VALUES 
(
    '11111111-1111-1111-1111-111111111111',
    'Oil Change',
    'Regular engine oil and filter replacement',
    'ENGINE',
    1.0,
    75.00
),
(
    '22222222-2222-2222-2222-222222222222',
    'Tire Rotation',
    'Rotate tires to ensure even wear',
    'TIRES',
    0.5,
    50.00
),
(
    '33333333-3333-3333-3333-333333333333',
    'Brake Inspection',
    'Comprehensive brake system inspection',
    'BRAKES',
    1.5,
    125.00
),
(
    '44444444-4444-4444-4444-444444444444',
    'Annual Safety Inspection',
    'Mandatory annual vehicle safety inspection',
    'INSPECTION',
    2.0,
    150.00
),
(
    '55555555-5555-5555-5555-555555555555',
    'Transmission Service',
    'Transmission fluid change and inspection',
    'TRANSMISSION',
    2.5,
    200.00
),
(
    '66666666-6666-6666-6666-666666666666',
    'Air Filter Replacement',
    'Replace engine air filter',
    'ENGINE',
    0.25,
    35.00
),
(
    '77777777-7777-7777-7777-777777777777',
    'Battery Test',
    'Battery performance test and maintenance',
    'ELECTRICAL',
    0.5,
    25.00
),
(
    '88888888-8888-8888-8888-888888888888',
    'Coolant System Flush',
    'Complete coolant system flush and refill',
    'COOLING',
    1.5,
    120.00
)
ON CONFLICT (id) DO NOTHING;

-- Insert sample maintenance schedules (only if vehicles exist)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'vehicles') 
       AND EXISTS (SELECT 1 FROM vehicles LIMIT 1) THEN
        
        INSERT INTO maintenance_schedules (
            id, vehicle_id, maintenance_type_id, schedule_type, mileage_interval, time_interval_days,
            last_service_date, last_service_mileage, next_due_date, next_due_mileage
        ) 
        SELECT 
            '11111111-1111-1111-1111-111111111111',
            (SELECT id FROM vehicles LIMIT 1),
            '11111111-1111-1111-1111-111111111111',
            'MILEAGE',
            5000,
            NULL,
            CURRENT_DATE - INTERVAL '2 months',
            45000,
            CURRENT_DATE + INTERVAL '1 month',
            50000
        WHERE NOT EXISTS (SELECT 1 FROM maintenance_schedules WHERE id = '11111111-1111-1111-1111-111111111111');
        
        INSERT INTO maintenance_schedules (
            id, vehicle_id, maintenance_type_id, schedule_type, mileage_interval, time_interval_days,
            last_service_date, last_service_mileage, next_due_date, next_due_mileage
        ) 
        SELECT 
            '22222222-2222-2222-2222-222222222222',
            (SELECT id FROM vehicles LIMIT 1),
            '22222222-2222-2222-2222-222222222222',
            'MILEAGE',
            10000,
            NULL,
            CURRENT_DATE - INTERVAL '3 months',
            40000,
            CURRENT_DATE + INTERVAL '2 months',
            50000
        WHERE NOT EXISTS (SELECT 1 FROM maintenance_schedules WHERE id = '22222222-2222-2222-2222-222222222222');
        
        INSERT INTO maintenance_schedules (
            id, vehicle_id, maintenance_type_id, schedule_type, mileage_interval, time_interval_days,
            last_service_date, last_service_mileage, next_due_date, next_due_mileage
        ) 
        SELECT 
            '33333333-3333-3333-3333-333333333333',
            (SELECT id FROM vehicles LIMIT 1),
            '44444444-4444-4444-4444-444444444444',
            'TIME',
            NULL,
            365,
            CURRENT_DATE - INTERVAL '10 months',
            NULL,
            CURRENT_DATE + INTERVAL '2 months',
            NULL
        WHERE NOT EXISTS (SELECT 1 FROM maintenance_schedules WHERE id = '33333333-3333-3333-3333-333333333333');
    END IF;
END $$;

-- Insert sample maintenance records (only if vehicles exist)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'vehicles') 
       AND EXISTS (SELECT 1 FROM vehicles LIMIT 1) THEN
        
        INSERT INTO maintenance_records (
            id, vehicle_id, maintenance_type_id, service_date, service_mileage, service_provider,
            labor_cost, parts_cost, total_cost, duration_hours, status, description
        ) 
        SELECT 
            '11111111-1111-1111-1111-111111111111',
            (SELECT id FROM vehicles LIMIT 1),
            '11111111-1111-1111-1111-111111111111',
            CURRENT_DATE - INTERVAL '2 months',
            45000,
            'Quick Lube Express',
            25.00,
            50.00,
            75.00,
            1.0,
            'COMPLETED',
            'Regular oil change with synthetic oil'
        WHERE NOT EXISTS (SELECT 1 FROM maintenance_records WHERE id = '11111111-1111-1111-1111-111111111111');
        
        INSERT INTO maintenance_records (
            id, vehicle_id, maintenance_type_id, service_date, service_mileage, service_provider,
            labor_cost, parts_cost, total_cost, duration_hours, status, description
        ) 
        SELECT 
            '22222222-2222-2222-2222-222222222222',
            (SELECT id FROM vehicles LIMIT 1),
            '22222222-2222-2222-2222-222222222222',
            CURRENT_DATE - INTERVAL '3 months',
            40000,
            'Tire Pro Service',
            30.00,
            20.00,
            50.00,
            0.5,
            'COMPLETED',
            'Tire rotation and pressure check'
        WHERE NOT EXISTS (SELECT 1 FROM maintenance_records WHERE id = '22222222-2222-2222-2222-222222222222');
        
        INSERT INTO maintenance_records (
            id, vehicle_id, maintenance_type_id, service_date, service_mileage, service_provider,
            labor_cost, parts_cost, total_cost, duration_hours, status, description
        ) 
        SELECT 
            '33333333-3333-3333-3333-333333333333',
            (SELECT id FROM vehicles LIMIT 1),
            '33333333-3333-3333-3333-333333333333',
            CURRENT_DATE - INTERVAL '1 month',
            47000,
            'Brake Masters',
            75.00,
            150.00,
            225.00,
            2.0,
            'COMPLETED',
            'Brake pad replacement and rotor resurfacing'
        WHERE NOT EXISTS (SELECT 1 FROM maintenance_records WHERE id = '33333333-3333-3333-3333-333333333333');
    END IF;
END $$;

-- Insert sample maintenance reminders (only if vehicles and schedules exist)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'vehicles') 
       AND EXISTS (SELECT 1 FROM vehicles LIMIT 1)
       AND EXISTS (SELECT 1 FROM maintenance_schedules WHERE id = '11111111-1111-1111-1111-111111111111') THEN
        
        INSERT INTO maintenance_reminders (
            id, vehicle_id, maintenance_schedule_id, reminder_type, reminder_date, due_date,
            due_mileage, current_mileage, message, priority
        ) 
        SELECT 
            '11111111-1111-1111-1111-111111111111',
            (SELECT id FROM vehicles LIMIT 1),
            '11111111-1111-1111-1111-111111111111',
            'DUE_SOON',
            CURRENT_DATE,
            CURRENT_DATE + INTERVAL '1 month',
            50000,
            48500,
            'Oil change due in 1500 miles or 1 month',
            'HIGH'
        WHERE NOT EXISTS (SELECT 1 FROM maintenance_reminders WHERE id = '11111111-1111-1111-1111-111111111111');
        
        INSERT INTO maintenance_reminders (
            id, vehicle_id, maintenance_schedule_id, reminder_type, reminder_date, due_date,
            due_mileage, current_mileage, message, priority
        ) 
        SELECT 
            '22222222-2222-2222-2222-222222222222',
            (SELECT id FROM vehicles LIMIT 1),
            '22222222-2222-2222-2222-222222222222',
            'DUE_SOON',
            CURRENT_DATE + INTERVAL '1 month',
            CURRENT_DATE + INTERVAL '2 months',
            50000,
            45000,
            'Tire rotation due in 5000 miles or 2 months',
            'MEDIUM'
        WHERE NOT EXISTS (SELECT 1 FROM maintenance_reminders WHERE id = '22222222-2222-2222-2222-222222222222')
        AND EXISTS (SELECT 1 FROM maintenance_schedules WHERE id = '22222222-2222-2222-2222-222222222222');
        
        INSERT INTO maintenance_reminders (
            id, vehicle_id, maintenance_schedule_id, reminder_type, reminder_date, due_date,
            due_mileage, current_mileage, message, priority
        ) 
        SELECT 
            '33333333-3333-3333-3333-333333333333',
            (SELECT id FROM vehicles LIMIT 1),
            '33333333-3333-3333-3333-333333333333',
            'OVERDUE',
            CURRENT_DATE - INTERVAL '1 week',
            CURRENT_DATE - INTERVAL '1 week',
            NULL,
            NULL,
            'Annual safety inspection is overdue',
            'CRITICAL'
        WHERE NOT EXISTS (SELECT 1 FROM maintenance_reminders WHERE id = '33333333-3333-3333-3333-333333333333')
        AND EXISTS (SELECT 1 FROM maintenance_schedules WHERE id = '33333333-3333-3333-3333-333333333333');
    END IF;
END $$;

-- Insert sample maintenance costs
INSERT INTO maintenance_costs (
    maintenance_record_id, cost_type, item_name, quantity, unit_cost, total_cost, supplier
) VALUES 
('11111111-1111-1111-1111-111111111111', 'PARTS', 'Synthetic Motor Oil 5W-30', 5.0, 8.00, 40.00, 'Auto Parts Plus'),
('11111111-1111-1111-1111-111111111111', 'PARTS', 'Oil Filter', 1.0, 10.00, 10.00, 'Auto Parts Plus'),
('11111111-1111-1111-1111-111111111111', 'LABOR', 'Oil Change Service', 1.0, 25.00, 25.00, 'Quick Lube Express'),

('22222222-2222-2222-2222-222222222222', 'LABOR', 'Tire Rotation', 1.0, 30.00, 30.00, 'Tire Pro Service'),
('22222222-2222-2222-2222-222222222222', 'PARTS', 'Tire Balancing Weights', 4.0, 5.00, 20.00, 'Tire Pro Service'),

('33333333-3333-3333-3333-333333333333', 'PARTS', 'Brake Pads (Front)', 1.0, 80.00, 80.00, 'Brake Parts Co'),
('33333333-3333-3333-3333-333333333333', 'PARTS', 'Brake Pads (Rear)', 1.0, 70.00, 70.00, 'Brake Parts Co'),
('33333333-3333-3333-3333-333333333333', 'LABOR', 'Brake Service', 2.0, 37.50, 75.00, 'Brake Masters');

COMMENT ON TABLE maintenance_types IS 'Defines different types of maintenance services';
COMMENT ON TABLE maintenance_schedules IS 'Scheduled maintenance intervals for vehicles';
COMMENT ON TABLE maintenance_records IS 'Historical records of completed maintenance';
COMMENT ON TABLE maintenance_reminders IS 'Upcoming and overdue maintenance reminders';
COMMENT ON TABLE maintenance_costs IS 'Detailed cost breakdown for maintenance services';