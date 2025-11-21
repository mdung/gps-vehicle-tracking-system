# AI Prompt for GPS Vehicle Tracking System

## Project Overview
Build a complete GPS Vehicle Tracking System with the following specifications:

### Technology Stack
- **Backend**: Spring Boot 3.x (Java 17+)
- **Database**: PostgreSQL 15+
- **Migration**: Flyway
- **Frontend**: React.js 18+ with TypeScript
- **Build Tools**: Maven (backend), npm/yarn (frontend)
- **API**: RESTful API with JSON

### Core Functionalities

#### 1. Vehicle Management
- CRUD operations for vehicles
- Vehicle information: license plate, model, type, status (active/inactive)
- Vehicle assignment to drivers
- Vehicle maintenance tracking

#### 2. Driver Management
- CRUD operations for drivers
- Driver information: name, license number, phone, email
- Driver-vehicle assignment
- Driver status tracking

#### 3. GPS Tracking
- Real-time location updates from GPS devices
- Store GPS coordinates (latitude, longitude)
- Timestamp for each location update
- Speed and direction tracking
- Historical location data storage

#### 4. Route Management
- Track routes taken by vehicles
- Route history with start/end times
- Distance calculation
- Route visualization

#### 5. Dashboard & Reports
- Real-time vehicle location map
- Vehicle status overview
- Route history reports
- Driver activity reports
- Distance traveled reports

### Database Schema Requirements

#### Tables:
1. **vehicles**
   - id (UUID, primary key)
   - license_plate (VARCHAR, unique)
   - model (VARCHAR)
   - vehicle_type (VARCHAR)
   - status (VARCHAR: ACTIVE/INACTIVE)
   - created_at (TIMESTAMP)
   - updated_at (TIMESTAMP)

2. **drivers**
   - id (UUID, primary key)
   - name (VARCHAR)
   - license_number (VARCHAR, unique)
   - phone (VARCHAR)
   - email (VARCHAR)
   - status (VARCHAR: ACTIVE/INACTIVE)
   - created_at (TIMESTAMP)
   - updated_at (TIMESTAMP)

3. **vehicle_driver_assignments**
   - id (UUID, primary key)
   - vehicle_id (UUID, foreign key)
   - driver_id (UUID, foreign key)
   - assigned_at (TIMESTAMP)
   - unassigned_at (TIMESTAMP)
   - is_active (BOOLEAN)

4. **gps_locations**
   - id (UUID, primary key)
   - vehicle_id (UUID, foreign key)
   - latitude (DECIMAL)
   - longitude (DECIMAL)
   - speed (DECIMAL, km/h)
   - direction (DECIMAL, degrees)
   - timestamp (TIMESTAMP)
   - created_at (TIMESTAMP)

5. **routes**
   - id (UUID, primary key)
   - vehicle_id (UUID, foreign key)
   - driver_id (UUID, foreign key)
   - start_location_id (UUID, foreign key to gps_locations)
   - end_location_id (UUID, foreign key to gps_locations)
   - start_time (TIMESTAMP)
   - end_time (TIMESTAMP)
   - distance_km (DECIMAL)
   - status (VARCHAR: IN_PROGRESS/COMPLETED)

### API Endpoints Required

#### Vehicle APIs
- `GET /api/vehicles` - List all vehicles
- `GET /api/vehicles/{id}` - Get vehicle by ID
- `POST /api/vehicles` - Create vehicle
- `PUT /api/vehicles/{id}` - Update vehicle
- `DELETE /api/vehicles/{id}` - Delete vehicle

#### Driver APIs
- `GET /api/drivers` - List all drivers
- `GET /api/drivers/{id}` - Get driver by ID
- `POST /api/drivers` - Create driver
- `PUT /api/drivers/{id}` - Update driver
- `DELETE /api/drivers/{id}` - Delete driver

#### Assignment APIs
- `POST /api/assignments` - Assign driver to vehicle
- `DELETE /api/assignments/{id}` - Unassign driver from vehicle
- `GET /api/assignments/vehicle/{vehicleId}` - Get current assignment for vehicle
- `GET /api/assignments/driver/{driverId}` - Get current assignment for driver

#### GPS Location APIs
- `POST /api/gps-locations` - Create GPS location update
- `GET /api/gps-locations/vehicle/{vehicleId}` - Get locations for vehicle
- `GET /api/gps-locations/vehicle/{vehicleId}/latest` - Get latest location
- `GET /api/gps-locations/vehicle/{vehicleId}/history` - Get location history with date range

#### Route APIs
- `GET /api/routes` - List all routes
- `GET /api/routes/{id}` - Get route by ID
- `POST /api/routes` - Create route
- `PUT /api/routes/{id}/end` - End route
- `GET /api/routes/vehicle/{vehicleId}` - Get routes for vehicle

### Frontend Requirements

#### Pages/Components:
1. **Dashboard**
   - Map view with real-time vehicle locations
   - Vehicle status cards
   - Quick stats (total vehicles, active routes, etc.)

2. **Vehicle Management**
   - Vehicle list table
   - Add/Edit vehicle form
   - Vehicle details view

3. **Driver Management**
   - Driver list table
   - Add/Edit driver form
   - Driver details view

4. **Tracking**
   - Real-time map with vehicle markers
   - Vehicle selection dropdown
   - Route history visualization

5. **Reports**
   - Route history table
   - Distance reports
   - Driver activity reports

### Technical Requirements
- Use Flyway for database migrations
- Implement proper error handling and validation
- Use DTOs for API requests/responses
- Implement pagination for list endpoints
- Add CORS configuration for frontend-backend communication
- Use environment variables for configuration
- Implement proper logging
- Add API documentation (Swagger/OpenAPI)

### Implementation Steps
1. Set up Spring Boot project structure
2. Configure PostgreSQL connection
3. Create Flyway migration scripts
4. Implement entity classes
5. Create repositories (JPA)
6. Implement service layer
7. Create REST controllers
8. Set up React project
9. Create API service layer in frontend
10. Implement UI components
11. Add map integration (Google Maps or Leaflet)
12. Implement real-time updates (WebSocket or polling)
13. Add error handling and validation
14. Test all functionalities
15. Add documentation



