# Maintenance Management System

## Overview

The Maintenance Management System is a comprehensive solution for tracking vehicle maintenance schedules, records, reminders, and costs. It provides automated scheduling, cost tracking, and reminder notifications to ensure vehicles are properly maintained.

## Features

### ✅ Completed Features

#### Backend (Java/Spring Boot)
- **Complete Database Schema** with 5 tables:
  - `maintenance_types` - Defines maintenance service types
  - `maintenance_schedules` - Vehicle-specific maintenance schedules
  - `maintenance_records` - Historical maintenance records
  - `maintenance_reminders` - Automated reminder system
  - `maintenance_costs` - Detailed cost breakdown

- **Full REST API** with 40+ endpoints covering:
  - CRUD operations for all entities
  - Advanced search and filtering
  - Analytics and reporting
  - Batch operations

- **Business Logic Features**:
  - Automated reminder generation
  - Overdue maintenance tracking
  - Cost analytics by vehicle/date range
  - Flexible scheduling (mileage/time-based)
  - Priority-based reminder system

#### Frontend (React/TypeScript)
- **Complete UI Implementation**:
  - Dashboard with key metrics and alerts
  - Maintenance schedules management
  - Maintenance records tracking
  - Reminder system with acknowledgments
  - Maintenance types configuration

- **Modal-based Forms** for:
  - Creating/editing maintenance schedules
  - Creating/editing maintenance records
  - Creating/editing maintenance types

- **Responsive Design** with:
  - Mobile-friendly interface
  - Tabbed navigation
  - Real-time data updates
  - Error handling and loading states

## System Architecture

### Database Tables

1. **maintenance_types**
   - Defines different types of maintenance (Oil Change, Brake Inspection, etc.)
   - Includes category, estimated cost, and duration

2. **maintenance_schedules**
   - Vehicle-specific maintenance schedules
   - Supports mileage-based, time-based, or both scheduling types
   - Tracks next due dates and intervals

3. **maintenance_records**
   - Historical records of completed maintenance
   - Includes costs, service provider, technician details
   - Links to schedules for automatic updates

4. **maintenance_reminders**
   - Automated reminder system
   - Priority-based notifications (LOW, MEDIUM, HIGH, CRITICAL)
   - Tracks overdue items and acknowledgments

5. **maintenance_costs**
   - Detailed cost breakdown for each maintenance record
   - Supports different cost types (LABOR, PARTS, FLUIDS, etc.)
   - Tracks suppliers and warranty information

### API Endpoints

#### Maintenance Types
- `GET /api/maintenance/types` - List all maintenance types
- `POST /api/maintenance/types` - Create new maintenance type
- `PUT /api/maintenance/types/{id}` - Update maintenance type
- `DELETE /api/maintenance/types/{id}` - Delete maintenance type

#### Maintenance Schedules
- `GET /api/maintenance/schedules` - List all schedules
- `GET /api/maintenance/schedules/vehicle/{vehicleId}` - Get schedules by vehicle
- `GET /api/maintenance/schedules/overdue` - Get overdue schedules
- `POST /api/maintenance/schedules` - Create new schedule
- `PUT /api/maintenance/schedules/{id}` - Update schedule

#### Maintenance Records
- `GET /api/maintenance/records` - List all records
- `GET /api/maintenance/records/vehicle/{vehicleId}` - Get records by vehicle
- `POST /api/maintenance/records` - Create new record
- `PUT /api/maintenance/records/{id}` - Update record

#### Maintenance Reminders
- `GET /api/maintenance/reminders/unacknowledged` - Get unacknowledged reminders
- `GET /api/maintenance/reminders/overdue` - Get overdue reminders
- `PUT /api/maintenance/reminders/{id}/acknowledge` - Acknowledge reminder

#### Analytics
- `GET /api/maintenance/analytics/cost/vehicle/{vehicleId}` - Get cost by vehicle
- `GET /api/maintenance/analytics/cost/total` - Get total cost by date range
- `GET /api/maintenance/analytics/reminders/unacknowledged/count` - Get reminder count

## Usage Guide

### Accessing the System
1. Navigate to `/maintenance` in the web application
2. The system opens to the Dashboard tab showing key metrics

### Dashboard Features
- **Key Metrics**: Total costs, maintenance count, overdue items, upcoming maintenance
- **Overdue Maintenance**: Critical items requiring immediate attention
- **Upcoming Maintenance**: Items due within 30 days
- **Recent Maintenance**: Latest completed maintenance records

### Managing Maintenance Types
1. Go to the "Types" tab
2. Click "Create Type" to add new maintenance types
3. Configure category, estimated cost, and duration
4. Edit existing types by clicking "Edit"

### Setting Up Maintenance Schedules
1. Go to the "Schedules" tab
2. Click "Create Schedule" to set up new maintenance schedules
3. Choose schedule type:
   - **Mileage-based**: Maintenance due every X miles
   - **Time-based**: Maintenance due every X days
   - **Both**: Whichever comes first
4. Set intervals and last service information

### Recording Maintenance
1. Go to the "Records" tab
2. Click "Add Record" to log completed maintenance
3. Fill in service details, costs, and notes
4. System automatically updates related schedules

### Managing Reminders
1. Go to the "Reminders" tab
2. View all active reminders with priority levels
3. Acknowledge reminders when maintenance is scheduled
4. System automatically generates new reminders based on schedules

## Sample Data

The system comes pre-loaded with sample data including:
- 8 common maintenance types (Oil Change, Tire Rotation, Brake Inspection, etc.)
- Sample schedules for different maintenance intervals
- Historical maintenance records with cost breakdowns
- Active reminders demonstrating the notification system

## Technical Implementation

### Backend Technologies
- **Java 17** with Spring Boot 3.x
- **PostgreSQL** database with Flyway migrations
- **JPA/Hibernate** for data persistence
- **REST API** with comprehensive error handling
- **Lombok** for reduced boilerplate code

### Frontend Technologies
- **React 18** with TypeScript
- **CSS3** with responsive design
- **Axios** for API communication
- **React Router** for navigation
- **Modal-based forms** for data entry

### Key Design Patterns
- **Repository Pattern** for data access
- **Service Layer** for business logic
- **DTO Pattern** for API communication
- **Component-based UI** architecture
- **Error Boundary** for fault tolerance

## Future Enhancements

Potential improvements could include:
- **Email/SMS notifications** for overdue maintenance
- **Integration with vehicle telematics** for automatic mileage updates
- **Maintenance history reports** and analytics
- **Vendor management** and service provider ratings
- **Mobile app** for field technicians
- **Inventory management** for parts and supplies
- **Predictive maintenance** using machine learning

## Testing

The system includes:
- **Sample data** for immediate testing
- **Error handling** for invalid inputs
- **Responsive design** testing on mobile devices
- **API validation** with proper error messages

## Deployment

1. **Backend**: Deploy Spring Boot application to application server
2. **Database**: Run Flyway migrations to set up schema
3. **Frontend**: Build React application and deploy to web server
4. **Configuration**: Update API endpoints in frontend configuration

## Support

For technical support or feature requests, refer to the system documentation or contact the development team.