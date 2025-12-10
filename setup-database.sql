-- Database setup script for fuel management
-- Run this if you're having issues with the fuel management tables

-- Check if database exists
SELECT 'Database exists' as status;

-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('vehicles', 'drivers', 'fuel_records', 'fuel_efficiency');

-- If fuel tables don't exist, you can manually create them:

-- Create fuel_records table
CREATE TABLE IF NOT EXISTS fuel_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id UUID NOT NULL,
    driver_id UUID,
    fuel_amount_liters DECIMAL(10,3) NOT NULL CHECK (fuel_amount_liters > 0),
    fuel_cost DECIMAL(10,2) NOT NULL CHECK (fuel_cost > 0),
    cost_per_liter DECIMAL(10,3) NOT NULL CHECK (cost_per_liter > 0),
    odometer_reading DECIMAL(10,2) CHECK (odometer_reading >= 0),
    fuel_station VARCHAR(100),
    fuel_type VARCHAR(50),
    record_type VARCHAR(50) NOT NULL CHECK (record_type IN ('REFUEL', 'CONSUMPTION_CALCULATION', 'MAINTENANCE')),
    notes TEXT,
    refuel_date TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create fuel_efficiency table
CREATE TABLE IF NOT EXISTS fuel_efficiency (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id UUID NOT NULL,
    driver_id UUID,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    total_distance_km DECIMAL(10,2) NOT NULL CHECK (total_distance_km >= 0),
    total_fuel_consumed_liters DECIMAL(10,3) NOT NULL CHECK (total_fuel_consumed_liters > 0),
    fuel_efficiency_km_per_liter DECIMAL(10,3) NOT NULL CHECK (fuel_efficiency_km_per_liter >= 0),
    total_fuel_cost DECIMAL(10,2) NOT NULL CHECK (total_fuel_cost >= 0),
    cost_per_km DECIMAL(10,3) NOT NULL CHECK (cost_per_km >= 0),
    number_of_refuels INTEGER NOT NULL CHECK (number_of_refuels >= 0),
    average_cost_per_liter DECIMAL(10,3) CHECK (average_cost_per_liter >= 0),
    calculation_period VARCHAR(20) NOT NULL CHECK (calculation_period IN ('DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY')),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Add foreign key constraints if vehicles and drivers tables exist
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'vehicles') THEN
        ALTER TABLE fuel_records ADD CONSTRAINT fk_fuel_records_vehicle 
        FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE;
        
        ALTER TABLE fuel_efficiency ADD CONSTRAINT fk_fuel_efficiency_vehicle 
        FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'drivers') THEN
        ALTER TABLE fuel_records ADD CONSTRAINT fk_fuel_records_driver 
        FOREIGN KEY (driver_id) REFERENCES drivers(id) ON DELETE SET NULL;
        
        ALTER TABLE fuel_efficiency ADD CONSTRAINT fk_fuel_efficiency_driver 
        FOREIGN KEY (driver_id) REFERENCES drivers(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_fuel_records_vehicle_id ON fuel_records(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_fuel_records_driver_id ON fuel_records(driver_id);
CREATE INDEX IF NOT EXISTS idx_fuel_records_refuel_date ON fuel_records(refuel_date);
CREATE INDEX IF NOT EXISTS idx_fuel_records_vehicle_date ON fuel_records(vehicle_id, refuel_date DESC);

CREATE INDEX IF NOT EXISTS idx_fuel_efficiency_vehicle_id ON fuel_efficiency(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_fuel_efficiency_driver_id ON fuel_efficiency(driver_id);
CREATE INDEX IF NOT EXISTS idx_fuel_efficiency_period ON fuel_efficiency(period_start, period_end);

-- Insert sample data if vehicles exist
INSERT INTO fuel_records (vehicle_id, fuel_amount_liters, fuel_cost, cost_per_liter, fuel_station, fuel_type, record_type, refuel_date)
SELECT 
    v.id,
    45.5,
    68.25,
    1.500,
    'Test Station',
    'Gasoline',
    'REFUEL',
    NOW() - INTERVAL '1 day'
FROM vehicles v
LIMIT 1
ON CONFLICT DO NOTHING;

SELECT 'Setup completed' as status;