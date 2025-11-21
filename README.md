# GPS Vehicle Tracking System

A comprehensive vehicle tracking and management system that enables real-time GPS tracking, driver-vehicle assignment, route management, and reporting capabilities.

## Project Description

The GPS Vehicle Tracking System is a full-stack application designed to help businesses manage their vehicle fleet efficiently. The system provides real-time location tracking, driver management, route history, and comprehensive reporting features. It allows fleet managers to monitor vehicle locations, assign drivers to vehicles, track routes, and generate reports for better decision-making.

## Features

- **Vehicle Management**: Complete CRUD operations for vehicle registration and management
- **Driver Management**: Driver information management with license tracking
- **Real-time GPS Tracking**: Live location updates with speed and direction
- **Route Management**: Track and visualize routes with distance calculation
- **Driver-Vehicle Assignment**: Assign drivers to vehicles with assignment history
- **Dashboard**: Real-time overview with map visualization
- **Reports**: Route history, distance traveled, and activity reports

## Technology Stack

### Backend
- **Spring Boot 3.x**: Java framework for building REST APIs
- **PostgreSQL 15+**: Relational database
- **Flyway**: Database migration tool
- **Java 17+**: Programming language

### Frontend
- **React.js 18+**: UI library
- **TypeScript**: Type-safe JavaScript
- **Leaflet/Google Maps**: Map visualization

## Project Structure

```
gps-vehicle-tracking-system/
├── backend/          # Spring Boot application
├── frontend/         # React application
└── README.md         # This file
```

## Getting Started

### Prerequisites
- Java 17 or higher
- Maven 3.6+
- Node.js 18+ and npm/yarn
- PostgreSQL 15+
- Git

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Configure database in `src/main/resources/application.properties`:
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/gps_tracking
spring.datasource.username=your_username
spring.datasource.password=your_password
```

3. Run the application:
```bash
mvn spring-boot:run
```

The API will be available at `http://localhost:8080`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Configure API endpoint in `src/services/api.ts`:
```typescript
const API_BASE_URL = 'http://localhost:8080/api';
```

4. Start the development server:
```bash
npm start
```

The application will be available at `http://localhost:3000`

## API Documentation

Once the backend is running, Swagger UI is available at:
`http://localhost:8080/swagger-ui.html`

## Database Migrations

Database migrations are handled automatically by Flyway on application startup. Migration scripts are located in:
`backend/src/main/resources/db/migration/`

## License

This project is open source and available for use.

## Author

Created for GPS vehicle tracking and fleet management.

