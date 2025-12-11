-- Fix Flyway migration checksum mismatch for V12
-- Run these commands in order:

-- Step 1: Remove the problematic migration entry
DELETE FROM flyway_schema_history WHERE version = '12';

-- Step 2: Drop the maintenance tables if they exist (so migration can recreate them)
DROP TABLE IF EXISTS maintenance_costs CASCADE;
DROP TABLE IF EXISTS maintenance_reminders CASCADE;
DROP TABLE IF EXISTS maintenance_records CASCADE;
DROP TABLE IF EXISTS maintenance_schedules CASCADE;
DROP TABLE IF EXISTS maintenance_types CASCADE;

-- Now restart your Spring Boot application
-- Flyway will re-run the V12 migration with the correct checksum