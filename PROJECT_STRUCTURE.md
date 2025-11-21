# GPS Vehicle Tracking System - Project Structure

```
gps-vehicle-tracking-system/
├── backend/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/
│   │   │   │   └── com/
│   │   │   │       └── gps/
│   │   │   │           └── tracking/
│   │   │   │               ├── GpsTrackingApplication.java
│   │   │   │               ├── config/
│   │   │   │               │   ├── CorsConfig.java
│   │   │   │               │   └── SwaggerConfig.java
│   │   │   │               ├── controller/
│   │   │   │               │   ├── VehicleController.java
│   │   │   │               │   ├── DriverController.java
│   │   │   │               │   ├── AssignmentController.java
│   │   │   │               │   ├── GpsLocationController.java
│   │   │   │               │   └── RouteController.java
│   │   │   │               ├── dto/
│   │   │   │               │   ├── request/
│   │   │   │               │   │   ├── VehicleRequest.java
│   │   │   │               │   │   ├── DriverRequest.java
│   │   │   │               │   │   ├── AssignmentRequest.java
│   │   │   │               │   │   ├── GpsLocationRequest.java
│   │   │   │               │   │   └── RouteRequest.java
│   │   │   │               │   └── response/
│   │   │   │               │       ├── VehicleResponse.java
│   │   │   │               │       ├── DriverResponse.java
│   │   │   │               │       ├── AssignmentResponse.java
│   │   │   │               │       ├── GpsLocationResponse.java
│   │   │   │               │       └── RouteResponse.java
│   │   │   │               ├── entity/
│   │   │   │               │   ├── Vehicle.java
│   │   │   │               │   ├── Driver.java
│   │   │   │               │   ├── VehicleDriverAssignment.java
│   │   │   │               │   ├── GpsLocation.java
│   │   │   │               │   └── Route.java
│   │   │   │               ├── repository/
│   │   │   │               │   ├── VehicleRepository.java
│   │   │   │               │   ├── DriverRepository.java
│   │   │   │               │   ├── VehicleDriverAssignmentRepository.java
│   │   │   │               │   ├── GpsLocationRepository.java
│   │   │   │               │   └── RouteRepository.java
│   │   │   │               ├── service/
│   │   │   │               │   ├── VehicleService.java
│   │   │   │               │   ├── DriverService.java
│   │   │   │               │   ├── AssignmentService.java
│   │   │   │               │   ├── GpsLocationService.java
│   │   │   │               │   └── RouteService.java
│   │   │   │               └── exception/
│   │   │   │                   ├── GlobalExceptionHandler.java
│   │   │   │                   └── ResourceNotFoundException.java
│   │   │   ├── resources/
│   │   │   │   ├── application.properties
│   │   │   │   └── db/
│   │   │   │       └── migration/
│   │   │   │           ├── V1__Create_vehicles_table.sql
│   │   │   │           ├── V2__Create_drivers_table.sql
│   │   │   │           ├── V3__Create_vehicle_driver_assignments_table.sql
│   │   │   │           ├── V4__Create_gps_locations_table.sql
│   │   │   │           └── V5__Create_routes_table.sql
│   │   │   └── test/
│   │   │       └── java/
│   │   │           └── com/
│   │   │               └── gps/
│   │   │                   └── tracking/
│   │   ├── pom.xml
│   │   └── README.md
│   └── README.md
├── frontend/
│   ├── public/
│   │   ├── index.html
│   │   └── favicon.ico
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   │   ├── Header.tsx
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   └── LoadingSpinner.tsx
│   │   │   ├── vehicles/
│   │   │   │   ├── VehicleList.tsx
│   │   │   │   ├── VehicleForm.tsx
│   │   │   │   └── VehicleDetails.tsx
│   │   │   ├── drivers/
│   │   │   │   ├── DriverList.tsx
│   │   │   │   ├── DriverForm.tsx
│   │   │   │   └── DriverDetails.tsx
│   │   │   ├── tracking/
│   │   │   │   ├── MapView.tsx
│   │   │   │   ├── VehicleMarker.tsx
│   │   │   │   └── RouteHistory.tsx
│   │   │   └── dashboard/
│   │   │       ├── Dashboard.tsx
│   │   │       └── StatsCard.tsx
│   │   ├── pages/
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── VehiclesPage.tsx
│   │   │   ├── DriversPage.tsx
│   │   │   ├── TrackingPage.tsx
│   │   │   └── ReportsPage.tsx
│   │   ├── services/
│   │   │   ├── api.ts
│   │   │   ├── vehicleService.ts
│   │   │   ├── driverService.ts
│   │   │   ├── assignmentService.ts
│   │   │   ├── gpsLocationService.ts
│   │   │   └── routeService.ts
│   │   ├── types/
│   │   │   ├── vehicle.ts
│   │   │   ├── driver.ts
│   │   │   ├── assignment.ts
│   │   │   ├── gpsLocation.ts
│   │   │   └── route.ts
│   │   ├── utils/
│   │   │   └── constants.ts
│   │   ├── App.tsx
│   │   ├── index.tsx
│   │   └── index.css
│   ├── package.json
│   ├── tsconfig.json
│   └── README.md
├── .gitignore
├── README.md
└── docker-compose.yml (optional)
```



