# Fuel Management - Troubleshooting Guide

## Current Issues and Solutions

Based on the browser console errors, here are the main issues and how to fix them:

### 1. 500 Internal Server Error

**Symptoms:**
- Browser console shows "500 Internal Server Error" when calling `/api/fuel/records`
- Backend logs show validation errors or database connection issues

**Possible Causes & Solutions:**

#### A. Database Tables Don't Exist
The fuel management tables might not have been created yet.

**Solution:**
1. Ensure PostgreSQL is running
2. Create the database if it doesn't exist:
   ```sql
   CREATE DATABASE gps_tracking;
   ```
3. Start the backend application - Flyway will automatically run migrations
4. Check backend logs for migration success

#### B. Database Connection Issues
**Solution:**
1. Check `backend/src/main/resources/application.properties`:
   ```properties
   spring.datasource.url=jdbc:postgresql://localhost:5432/gps_tracking
   spring.datasource.username=your_username
   spring.datasource.password=your_password
   ```
2. Ensure PostgreSQL is running on the correct port
3. Test database connection manually

#### C. Missing Sample Data
**Solution:**
1. Ensure vehicles and drivers exist in the database
2. Run the sample data migration (V6__Insert_sample_data.sql)
3. The fuel endpoints require existing vehicles/drivers to work properly

### 2. CORS Errors

**Symptoms:**
- Browser console shows CORS policy errors
- Requests are blocked by CORS policy

**Solution:**
The CORS configuration should already be correct, but if issues persist:

1. Check `backend/src/main/java/com/gps/tracking/config/CorsConfig.java`
2. Ensure frontend is running on `http://localhost:3000`
3. Restart the backend after any CORS configuration changes

### 3. Frontend Module Errors

**Symptoms:**
- Browser console shows module import errors
- Components fail to load

**Solution:**
1. Ensure all dependencies are installed:
   ```bash
   cd frontend
   npm install
   ```
2. Clear npm cache if needed:
   ```bash
   npm cache clean --force
   ```
3. Restart the frontend development server

## Step-by-Step Debugging

### Step 1: Verify Backend is Running

1. **Start the backend:**
   ```bash
   cd backend
   mvn spring-boot:run
   ```

2. **Check backend health:**
   - Open browser to `http://localhost:8080/api/fuel/health`
   - Should return: "Fuel management service is running"

3. **Check Swagger UI:**
   - Open `http://localhost:8080/swagger-ui.html`
   - Look for "Fuel Management" section
   - Try the health check endpoint

### Step 2: Test API Endpoints

Use the provided test scripts:

**Windows (PowerShell):**
```powershell
.\test-fuel-api.ps1
```

**Linux/Mac:**
```bash
chmod +x test-fuel-api.sh
./test-fuel-api.sh
```

### Step 3: Check Database

1. **Connect to PostgreSQL:**
   ```bash
   psql -h localhost -U postgres -d gps_tracking
   ```

2. **Check if tables exist:**
   ```sql
   \dt
   ```
   Should show: vehicles, drivers, fuel_records, fuel_efficiency, etc.

3. **Check sample data:**
   ```sql
   SELECT COUNT(*) FROM vehicles;
   SELECT COUNT(*) FROM drivers;
   SELECT COUNT(*) FROM fuel_records;
   ```

### Step 4: Verify Frontend

1. **Start frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

2. **Check browser console:**
   - Open `http://localhost:3000`
   - Open browser developer tools (F12)
   - Look for any JavaScript errors

3. **Test navigation:**
   - Click "Fuel Management" in the top menu
   - Should load without errors

## Common Error Messages and Solutions

### "Table 'fuel_records' doesn't exist"

**Solution:**
1. Stop the backend
2. Check if Flyway migrations ran successfully
3. Manually run migrations if needed:
   ```bash
   mvn flyway:migrate
   ```
4. Restart the backend

### "Vehicle not found" or "Driver not found"

**Solution:**
1. Ensure sample data exists:
   ```sql
   INSERT INTO vehicles (id, license_plate, model, vehicle_type, status) 
   VALUES (gen_random_uuid(), 'TEST-123', 'Test Vehicle', 'CAR', 'ACTIVE');
   
   INSERT INTO drivers (id, name, license_number, status) 
   VALUES (gen_random_uuid(), 'Test Driver', 'DL-123456', 'ACTIVE');
   ```

### "CORS policy: No 'Access-Control-Allow-Origin' header"

**Solution:**
1. Ensure backend CORS configuration allows `http://localhost:3000`
2. Check if backend is running on port 8080
3. Restart backend after CORS changes

### Frontend shows "Failed to load data"

**Solution:**
1. Check if backend is running (`http://localhost:8080/api/fuel/health`)
2. Check browser network tab for failed requests
3. Verify API endpoints are responding correctly

## Manual Testing Steps

### Test Fuel Record Creation

1. **Via Swagger UI:**
   - Go to `http://localhost:8080/swagger-ui.html`
   - Find "Fuel Management" → "POST /api/fuel/records"
   - Use this sample data:
   ```json
   {
     "vehicleId": "your-vehicle-id-here",
     "fuelAmountLiters": 45.5,
     "fuelCost": 68.25,
     "costPerLiter": 1.5,
     "fuelStation": "Test Station",
     "fuelType": "Gasoline",
     "recordType": "REFUEL",
     "refuelDate": "2024-12-10T10:00:00"
   }
   ```

2. **Via Frontend:**
   - Go to `http://localhost:3000/fuel`
   - Click "Add Fuel Record"
   - Fill in the form
   - Submit

### Test Data Retrieval

1. **Get all fuel records:**
   ```bash
   curl -X GET "http://localhost:8080/api/fuel/records?page=0&size=20"
   ```

2. **Check frontend display:**
   - Go to "Fuel Records" tab
   - Should show any existing records

## Environment Verification Checklist

- [ ] PostgreSQL is running
- [ ] Database `gps_tracking` exists
- [ ] Backend starts without errors
- [ ] Backend responds to `http://localhost:8080/api/fuel/health`
- [ ] Swagger UI loads at `http://localhost:8080/swagger-ui.html`
- [ ] Frontend starts without errors
- [ ] Frontend loads at `http://localhost:3000`
- [ ] No CORS errors in browser console
- [ ] Vehicles and drivers exist in database
- [ ] Fuel management tables exist

## Getting Help

If issues persist:

1. **Check backend logs** for detailed error messages
2. **Check browser console** for frontend errors
3. **Verify database connection** and table structure
4. **Test API endpoints** individually using curl or Postman
5. **Compare with working endpoints** (like vehicles or drivers)

## Quick Fix Commands

**Reset database (if needed):**
```sql
DROP TABLE IF EXISTS fuel_efficiency CASCADE;
DROP TABLE IF EXISTS fuel_records CASCADE;
```

**Restart services:**
```bash
# Backend
cd backend && mvn spring-boot:run

# Frontend (in new terminal)
cd frontend && npm run dev
```

**Clear caches:**
```bash
# Maven
mvn clean

# NPM
npm cache clean --force
```