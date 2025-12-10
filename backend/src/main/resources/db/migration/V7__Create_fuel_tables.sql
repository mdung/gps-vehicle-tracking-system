-- Create fuel_records table
CREATE TABLE fuel_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    driver_id UUID REFERENCES drivers(id) ON DELETE SET NULL,
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
CREATE TABLE fuel_efficiency (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    driver_id UUID REFERENCES drivers(id) ON DELETE SET NULL,
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
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_vehicle_period UNIQUE (vehicle_id, period_start, period_end, calculation_period)
);

-- Create indexes for fuel_records
CREATE INDEX idx_fuel_records_vehicle_id ON fuel_records(vehicle_id);
CREATE INDEX idx_fuel_records_driver_id ON fuel_records(driver_id);
CREATE INDEX idx_fuel_records_refuel_date ON fuel_records(refuel_date);
CREATE INDEX idx_fuel_records_vehicle_date ON fuel_records(vehicle_id, refuel_date DESC);
CREATE INDEX idx_fuel_records_record_type ON fuel_records(record_type);

-- Create indexes for fuel_efficiency
CREATE INDEX idx_fuel_efficiency_vehicle_id ON fuel_efficiency(vehicle_id);
CREATE INDEX idx_fuel_efficiency_driver_id ON fuel_efficiency(driver_id);
CREATE INDEX idx_fuel_efficiency_period ON fuel_efficiency(period_start, period_end);
CREATE INDEX idx_fuel_efficiency_calculation_period ON fuel_efficiency(calculation_period);
CREATE INDEX idx_fuel_efficiency_km_per_liter ON fuel_efficiency(fuel_efficiency_km_per_liter);
CREATE INDEX idx_fuel_efficiency_cost_per_km ON fuel_efficiency(cost_per_km);

-- Create trigger to update updated_at timestamp for fuel_records
CREATE OR REPLACE FUNCTION update_fuel_records_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_fuel_records_updated_at
    BEFORE UPDATE ON fuel_records
    FOR EACH ROW
    EXECUTE FUNCTION update_fuel_records_updated_at();

-- Create trigger to update updated_at timestamp for fuel_efficiency
CREATE OR REPLACE FUNCTION update_fuel_efficiency_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_fuel_efficiency_updated_at
    BEFORE UPDATE ON fuel_efficiency
    FOR EACH ROW
    EXECUTE FUNCTION update_fuel_efficiency_updated_at();