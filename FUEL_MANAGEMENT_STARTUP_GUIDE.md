# Fuel Management - Startup Guide

## Prerequisites
- Java 17 or higher
- Node.js 16 or higher
- PostgreSQL database running
- Maven for backend build

## Backend Startup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Configure database connection:**
   Update `src/main/resources/application.properties` with your database settings:
   ```properties
   spring.datasource.url=jdbc:postgresql://localhost:5432/gps_tracking
   spring.datasource.username=your_username
   spring.datasource.password=your_password
   ```

3. **Run database migrations:**
   The application will automatically run Flyway migrations on startup, including the new fuel management tables.

4. **Start the backend server:**
   ```bash
   mvn spring-boot:run
   ```
   
   The backend will start on `http://localhost:8080`

5. **Verify backend is running:**
   - Check console for "Started GpsTrackingApplication"
   - Visit `http://localhost:8080/swagger-ui.html` to see API documentation
   - New fuel management endpoints should be visible under "Fuel Management" section

## Frontend Startup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies (if not already done):**
   ```bash
   npm install
   ```

3. **Start the frontend development server:**
   ```bash
   npm run dev
   ```
   
   The frontend will start on `http://localhost:3000`

4. **Access the application:**
   - Open browser to `http://localhost:3000`
   - Navigate to "Fuel Management" in the top menu
   - You should see the fuel management interface with three tabs

## Testing the Implementation

### 1. Test Backend API (Optional)
You can test the backend API directly using curl or Postman:

```bash
# Get all fuel records
curl -X GET "http://localhost:8080/api/fuel/records?page=0&size=20"

# Create a fuel record (requires valid vehicle ID)
curl -X POST "http://localhost:8080/api/fuel/records" \
  -H "Content-Type: application/json" \
  -d '{
    "vehicleId": "your-vehicle-id",
    "fuelAmountLiters": 45.5,
    "fuelCost": 68.25,
    "costPerLiter": 1.5,
    "fuelStation": "Shell Station",
    "fuelType": "Gasoline",
    "recordType": "REFUEL",
    "refuelDate": "2024-12-10T10:00:00"
  }'
```

### 2. Test Frontend Interface

1. **Navigate to Fuel Management:**
   - Click "Fuel Management" in the top navigation
   - You should see three tabs: "Fuel Records", "Efficiency Analysis", "Reports"

2. **Add a Fuel Record:**
   - Click "Add Fuel Record" button
   - Fill in the form with test data
   - Submit the form
   - The record should appear in the table

3. **View Records:**
   - The "Fuel Records" tab shows all fuel records in a table
   - Data includes date, vehicle, driver, amount, cost, etc.

4. **Generate Reports:**
   - Switch to "Reports" tab
   - Select date range
   - Click "Generate Report"
   - Summary statistics should appear

## Troubleshooting

### Backend Issues

1. **Database Connection Error:**
   - Verify PostgreSQL is running
   - Check database credentials in `application.properties`
   - Ensure database `gps_tracking` exists

2. **Migration Errors:**
   - Check if previous migrations ran successfully
   - Verify database user has CREATE/ALTER permissions
   - Check Flyway migration logs in console

3. **Compilation Errors:**
   - Ensure Java 17 is being used
   - Run `mvn clean compile` to check for issues
   - Check for missing dependencies

### Frontend Issues

1. **API Connection Error:**
   - Verify backend is running on port 8080
   - Check browser console for CORS errors
   - Ensure API base URL is correct in `src/services/api.ts`

2. **Module Import Errors:**
   - Run `npm install` to ensure all dependencies are installed
   - Check for TypeScript compilation errors
   - Verify all import paths are correct

3. **UI Not Loading:**
   - Check browser console for JavaScript errors
   - Verify all required components are properly imported
   - Check CSS is loading correctly

### Common Issues

1. **Empty Data:**
   - If no vehicles/drivers appear in dropdowns, ensure sample data exists
   - Run the sample data migration (V6__Insert_sample_data.sql)
   - Check that vehicles and drivers tables have data

2. **CORS Errors:**
   - Backend includes CORS configuration
   - If issues persist, check `CorsConfig.java`
   - Ensure frontend URL is allowed

3. **Port Conflicts:**
   - Backend default: 8080
   - Frontend default: 3000
   - Change ports if conflicts occur

## Sample Data

The system includes sample fuel data that will be inserted automatically:
- Sample fuel records for existing vehicles
- Sample efficiency calculations
- Test data for different fuel types and stations

## Next Steps

Once the basic system is running:
1. Add more vehicles and drivers through their respective pages
2. Create fuel records for different vehicles
3. Test efficiency calculations
4. Generate reports for different date ranges
5. Explore the API documentation at `/swagger-ui.html`

## API Documentation

With the backend running, visit `http://localhost:8080/swagger-ui.html` to see:
- All available fuel management endpoints
- Request/response schemas
- Interactive API testing interface
- Parameter descriptions and examples