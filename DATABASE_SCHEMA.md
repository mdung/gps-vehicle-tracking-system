# Database Schema Design

## Entity Relationship Diagram

```
┌─────────────┐         ┌──────────────────────────┐         ┌─────────────┐
│  vehicles   │◄────────┤ vehicle_driver_assignments│────────►│   drivers   │
└─────────────┘         └──────────────────────────┘         └─────────────┘
      │                          │                                    │
      │                          │                                    │
      │                          │                                    │
      │                          ▼                                    │
      │                  ┌─────────────┐                              │
      │                  │   routes    │                              │
      │                  └─────────────┘                              │
      │                         │                                     │
      │                         │                                     │
      ▼                         │                                     │
┌─────────────┐                 │                                     │
│gps_locations│◄────────────────┘                                     │
└─────────────┘                                                       │
      │                                                                │
      └──────────────────────────────────────────────────────────────┘
```

## Tables Description

### 1. vehicles
Stores vehicle information.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique identifier |
| license_plate | VARCHAR(50) | UNIQUE, NOT NULL | Vehicle license plate |
| model | VARCHAR(100) | NOT NULL | Vehicle model |
| vehicle_type | VARCHAR(50) | NOT NULL | Type of vehicle (TRUCK, CAR, VAN, etc.) |
| status | VARCHAR(20) | NOT NULL, DEFAULT 'ACTIVE' | Vehicle status (ACTIVE/INACTIVE) |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Last update timestamp |

**Indexes:**
- PRIMARY KEY (id)
- UNIQUE (license_plate)
- INDEX (status)

### 2. drivers
Stores driver information.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique identifier |
| name | VARCHAR(100) | NOT NULL | Driver full name |
| license_number | VARCHAR(50) | UNIQUE, NOT NULL | Driver license number |
| phone | VARCHAR(20) | | Contact phone number |
| email | VARCHAR(100) | | Contact email |
| status | VARCHAR(20) | NOT NULL, DEFAULT 'ACTIVE' | Driver status (ACTIVE/INACTIVE) |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Last update timestamp |

**Indexes:**
- PRIMARY KEY (id)
- UNIQUE (license_number)
- INDEX (status)

### 3. vehicle_driver_assignments
Manages many-to-many relationship between vehicles and drivers with assignment history.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique identifier |
| vehicle_id | UUID | FOREIGN KEY, NOT NULL | Reference to vehicles.id |
| driver_id | UUID | FOREIGN KEY, NOT NULL | Reference to drivers.id |
| assigned_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Assignment timestamp |
| unassigned_at | TIMESTAMP | | Unassignment timestamp (NULL if active) |
| is_active | BOOLEAN | NOT NULL, DEFAULT TRUE | Current assignment status |

**Indexes:**
- PRIMARY KEY (id)
- FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
- FOREIGN KEY (driver_id) REFERENCES drivers(id) ON DELETE CASCADE
- INDEX (vehicle_id, is_active)
- INDEX (driver_id, is_active)
- UNIQUE (vehicle_id, driver_id, is_active) WHERE is_active = TRUE

### 4. gps_locations
Stores GPS location updates from vehicles.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique identifier |
| vehicle_id | UUID | FOREIGN KEY, NOT NULL | Reference to vehicles.id |
| latitude | DECIMAL(10, 8) | NOT NULL | Latitude coordinate |
| longitude | DECIMAL(11, 8) | NOT NULL | Longitude coordinate |
| speed | DECIMAL(5, 2) | | Speed in km/h |
| direction | DECIMAL(5, 2) | | Direction in degrees (0-360) |
| timestamp | TIMESTAMP | NOT NULL | GPS timestamp |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Record creation timestamp |

**Indexes:**
- PRIMARY KEY (id)
- FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
- INDEX (vehicle_id, timestamp DESC)
- INDEX (timestamp)

### 5. routes
Tracks routes taken by vehicles.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique identifier |
| vehicle_id | UUID | FOREIGN KEY, NOT NULL | Reference to vehicles.id |
| driver_id | UUID | FOREIGN KEY | Reference to drivers.id (optional) |
| start_location_id | UUID | FOREIGN KEY | Reference to gps_locations.id |
| end_location_id | UUID | FOREIGN KEY | Reference to gps_locations.id (NULL if in progress) |
| start_time | TIMESTAMP | NOT NULL | Route start time |
| end_time | TIMESTAMP | | Route end time (NULL if in progress) |
| distance_km | DECIMAL(10, 2) | | Total distance in kilometers |
| status | VARCHAR(20) | NOT NULL, DEFAULT 'IN_PROGRESS' | Route status (IN_PROGRESS/COMPLETED) |

**Indexes:**
- PRIMARY KEY (id)
- FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
- FOREIGN KEY (driver_id) REFERENCES drivers(id) ON DELETE SET NULL
- FOREIGN KEY (start_location_id) REFERENCES gps_locations(id)
- FOREIGN KEY (end_location_id) REFERENCES gps_locations(id)
- INDEX (vehicle_id, status)
- INDEX (start_time)

## Data Flow

### 1. Vehicle Registration Flow
```
User → Create Vehicle → vehicles table
```

### 2. Driver Registration Flow
```
User → Create Driver → drivers table
```

### 3. Assignment Flow
```
User → Assign Driver to Vehicle → vehicle_driver_assignments table
  → Set is_active = TRUE
  → Set assigned_at = NOW()
```

### 4. GPS Location Update Flow
```
GPS Device → POST /api/gps-locations → gps_locations table
  → Check if route exists for vehicle
  → If no active route, create new route
  → Update route with latest location
```

### 5. Route Completion Flow
```
GPS Device → End Route → routes table
  → Set end_location_id
  → Set end_time = NOW()
  → Calculate distance_km
  → Set status = 'COMPLETED'
  → Update assignment is_active if needed
```

## Business Rules

1. **Vehicle-Driver Assignment:**
   - One vehicle can have one active driver at a time
   - One driver can be assigned to one vehicle at a time
   - Historical assignments are preserved (is_active = FALSE)

2. **GPS Location:**
   - Each location update is timestamped
   - Latest location is determined by timestamp DESC
   - Locations are linked to vehicles

3. **Routes:**
   - Route starts when first GPS location is received for a vehicle
   - Route ends when explicitly ended or vehicle stops
   - Distance is calculated from GPS locations

4. **Status Management:**
   - Vehicles and drivers can be ACTIVE or INACTIVE
   - Only ACTIVE vehicles/drivers appear in active lists
   - Inactive records are preserved for history

