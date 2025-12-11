-- Fix Flyway checksum mismatch for V12__Create_maintenance_tables.sql
-- Run this SQL directly against your database

-- Option 1: Update the checksum in flyway_schema_history table
UPDATE flyway_schema_history 
SET checksum = 1101210801 
WHERE version = '12';

-- Option 2: If you prefer to repair using Flyway command (alternative)
-- Run this command in your terminal instead of the SQL above:
-- mvn flyway:repair -Dflyway.url=jdbc:postgresql://localhost:5432/gps_tracking -Dflyway.user=your_username -Dflyway.password=your_password