Write-Host "=== TESTING ROUTE OPTIMIZATION API ===" -ForegroundColor Green
Write-Host "This will test the route optimization endpoints and create sample data" -ForegroundColor Yellow
Write-Host ""

# Test health check
Write-Host "1. Testing route optimization health check..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/route-optimization/health" -Method Get
    Write-Host "Health check response: $response" -ForegroundColor Green
} catch {
    Write-Host "Health check failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Make sure the backend is running and route optimization tables are created" -ForegroundColor Yellow
}

# Test get all routes
Write-Host "`n2. Testing get all routes..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/route-optimization/routes?page=0&size=20" -Method Get
    Write-Host "Routes response: $($response | ConvertTo-Json -Depth 2)" -ForegroundColor Green
    Write-Host "Total routes found: $($response.totalElements)" -ForegroundColor Cyan
} catch {
    Write-Host "Routes request failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test create a new optimized route
Write-Host "`n3. Testing create optimized route..." -ForegroundColor Yellow
try {
    $newRoute = @{
        name = "Test Delivery Route"
        description = "Automated test route for deliveries"
        vehicleId = "550e8400-e29b-41d4-a716-446655440001"  # ABC-1234
        driverId = "550e8400-e29b-41d4-a716-446655440001"   # John Smith
        optimizationType = "BALANCED"
        plannedStartTime = (Get-Date).AddHours(2).ToString("yyyy-MM-ddTHH:mm:ss")
        estimatedFuelCost = 35.50
        stops = @(
            @{
                name = "Depot Start"
                address = "123 Main St, New York, NY"
                latitude = 40.7128
                longitude = -74.0060
                stopType = "DEPOT"
                estimatedServiceTimeMinutes = 0
                notes = "Starting point"
            },
            @{
                name = "Customer Alpha"
                address = "456 Business Ave, New York, NY"
                latitude = 40.7589
                longitude = -73.9857
                stopType = "DELIVERY"
                estimatedServiceTimeMinutes = 20
                notes = "Priority delivery"
            },
            @{
                name = "Customer Beta"
                address = "789 Commerce St, New York, NY"
                latitude = 40.8176
                longitude = -73.9442
                stopType = "DELIVERY"
                estimatedServiceTimeMinutes = 15
                notes = "Standard delivery"
            },
            @{
                name = "Fuel Station"
                address = "321 Gas Station Rd, New York, NY"
                latitude = 40.7831
                longitude = -73.9712
                stopType = "FUEL_STATION"
                estimatedServiceTimeMinutes = 10
                notes = "Refuel stop"
            }
        )
        notes = "Test route created via API"
    }
    
    $jsonBody = $newRoute | ConvertTo-Json -Depth 3
    $headers = @{ "Content-Type" = "application/json" }
    
    $createResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/route-optimization/routes" -Method Post -Body $jsonBody -Headers $headers
    Write-Host "Route created successfully!" -ForegroundColor Green
    Write-Host "Route ID: $($createResponse.id)" -ForegroundColor Cyan
    Write-Host "Total Distance: $($createResponse.totalDistanceKm) km" -ForegroundColor Cyan
    Write-Host "Estimated Duration: $($createResponse.estimatedDurationHours) hours" -ForegroundColor Cyan
    Write-Host "Number of Stops: $($createResponse.stops.Count)" -ForegroundColor Cyan
    
    $routeId = $createResponse.id
    
    # Test start route
    Write-Host "`n4. Testing start route..." -ForegroundColor Yellow
    try {
        $startResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/route-optimization/routes/$routeId/start" -Method Post
        Write-Host "Route started successfully!" -ForegroundColor Green
        Write-Host "Status: $($startResponse.status)" -ForegroundColor Cyan
        Write-Host "Actual Start Time: $($startResponse.actualStartTime)" -ForegroundColor Cyan
        
        # Wait a moment then complete the route
        Start-Sleep -Seconds 2
        
        Write-Host "`n5. Testing complete route..." -ForegroundColor Yellow
        $completeResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/route-optimization/routes/$routeId/complete" -Method Post
        Write-Host "Route completed successfully!" -ForegroundColor Green
        Write-Host "Status: $($completeResponse.status)" -ForegroundColor Cyan
        Write-Host "Efficiency Score: $($completeResponse.efficiencyScore)%" -ForegroundColor Cyan
        
    } catch {
        Write-Host "Route execution test failed: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    # Test get route analytics
    Write-Host "`n6. Testing route analytics..." -ForegroundColor Yellow
    try {
        $analyticsResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/route-optimization/routes/$routeId/analytics" -Method Get
        Write-Host "Analytics retrieved successfully!" -ForegroundColor Green
        Write-Host "Total Stops: $($analyticsResponse.totalStops)" -ForegroundColor Cyan
        Write-Host "Completed Stops: $($analyticsResponse.completedStops)" -ForegroundColor Cyan
        Write-Host "Completion Percentage: $($analyticsResponse.completionPercentage)%" -ForegroundColor Cyan
        Write-Host "Performance Rating: $($analyticsResponse.performanceRating)" -ForegroundColor Cyan
    } catch {
        Write-Host "Analytics test failed: $($_.Exception.Message)" -ForegroundColor Red
    }
    
} catch {
    Write-Host "Route creation failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Error details: $responseBody" -ForegroundColor Red
    }
}

# Test get routes by vehicle
Write-Host "`n7. Testing get routes by vehicle..." -ForegroundColor Yellow
try {
    $vehicleRoutes = Invoke-RestMethod -Uri "http://localhost:8080/api/route-optimization/vehicles/550e8400-e29b-41d4-a716-446655440001/routes" -Method Get
    Write-Host "Vehicle routes retrieved: $($vehicleRoutes.Count) routes" -ForegroundColor Green
} catch {
    Write-Host "Vehicle routes test failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== ROUTE OPTIMIZATION TESTS COMPLETED ===" -ForegroundColor Green
Write-Host ""
Write-Host "Summary of what was tested:" -ForegroundColor Yellow
Write-Host "✓ Health check endpoint" -ForegroundColor White
Write-Host "✓ Get all routes (paginated)" -ForegroundColor White
Write-Host "✓ Create optimized route with multiple stops" -ForegroundColor White
Write-Host "✓ Start route execution" -ForegroundColor White
Write-Host "✓ Complete route execution" -ForegroundColor White
Write-Host "✓ Get route analytics" -ForegroundColor White
Write-Host "✓ Get routes by vehicle" -ForegroundColor White
Write-Host ""
Write-Host "Now you can:" -ForegroundColor Yellow
Write-Host "1. Go to the Route Optimization page in your web interface" -ForegroundColor White
Write-Host "2. View the created routes and their analytics" -ForegroundColor White
Write-Host "3. Create new routes with different optimization types" -ForegroundColor White
Write-Host "4. Test route replay functionality" -ForegroundColor White