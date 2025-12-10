-- Insert sample fuel records
INSERT INTO fuel_records (
    id, vehicle_id, driver_id, fuel_amount_liters, fuel_cost, cost_per_liter,
    odometer_reading, fuel_station, fuel_type, record_type, notes, refuel_date
) VALUES 
-- Sample data for existing vehicles (assuming they exist from V6)
(
    gen_random_uuid(),
    (SELECT id FROM vehicles LIMIT 1),
    (SELECT id FROM drivers LIMIT 1),
    45.50,
    68.25,
    1.500,
    15000.0,
    'Shell Station',
    'Gasoline',
    'REFUEL',
    'Regular refuel at Shell station',
    NOW() - INTERVAL '7 days'
),
(
    gen_random_uuid(),
    (SELECT id FROM vehicles LIMIT 1),
    (SELECT id FROM drivers LIMIT 1),
    42.30,
    65.15,
    1.540,
    15350.0,
    'BP Station',
    'Gasoline',
    'REFUEL',
    'Refuel during long trip',
    NOW() - INTERVAL '3 days'
),
(
    gen_random_uuid(),
    (SELECT id FROM vehicles OFFSET 1 LIMIT 1),
    (SELECT id FROM drivers OFFSET 1 LIMIT 1),
    38.75,
    58.12,
    1.500,
    8500.0,
    'Exxon',
    'Diesel',
    'REFUEL',
    'Diesel refuel for truck',
    NOW() - INTERVAL '5 days'
);

-- Insert sample fuel efficiency records
INSERT INTO fuel_efficiency (
    id, vehicle_id, driver_id, period_start, period_end,
    total_distance_km, total_fuel_consumed_liters, fuel_efficiency_km_per_liter,
    total_fuel_cost, cost_per_km, number_of_refuels, average_cost_per_liter,
    calculation_period
) VALUES 
(
    gen_random_uuid(),
    (SELECT id FROM vehicles LIMIT 1),
    (SELECT id FROM drivers LIMIT 1),
    CURRENT_DATE - INTERVAL '7 days',
    CURRENT_DATE,
    450.0,
    87.80,
    5.125,
    133.40,
    0.296,
    2,
    1.520,
    'WEEKLY'
),
(
    gen_random_uuid(),
    (SELECT id FROM vehicles OFFSET 1 LIMIT 1),
    (SELECT id FROM drivers OFFSET 1 LIMIT 1),
    CURRENT_DATE - INTERVAL '7 days',
    CURRENT_DATE,
    320.0,
    38.75,
    8.258,
    58.12,
    0.182,
    1,
    1.500,
    'WEEKLY'
);