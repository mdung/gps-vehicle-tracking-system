#!/usr/bin/env pwsh

# Test Route Optimization API and populate data
$baseUrl = "http://localhost:8080/api"

Write-Host "=== Testing Route Optimization API ===" -ForegroundColor Green

# Test 1: Create a complete route with multiple stops
Write-Host "`n1. Creating Downtown Delivery Route..." -ForegroundColor Yellow

$route1 = @{
    name = "Downtown Delivery Route"
    description = "Optimized delivery route for downtown area with 4 stops"
    vehicleId = "11111111-1111-1111-1111-111111111111"  # ABC-1234
    driverId = "11111111-1111-1111-1111-111111111111"   # Manh Dung Nguyen
    optimizationType = "SHORTEST_DISTANCE"
    plannedStartTime = "2024-12-11T09:00:00"
    estimatedFuelCost = 25.50
    notes = "Priority deliveries for downtown customers"
    stops = @(
        @{
            name = "Main Depot"
            address = "123 Main St, Downtown"
            latitude = 40.7128
            longitude = -74.0060
            stopType = "DEPOT"
            estimatedServiceTimeMinutes = 5
            notes = "Starting point - load packages"
        },
        @{
            name = "Customer A - Office Building"
            address = "456 Business Ave, Floor 15"
            latitude = 40.7589
            longitude = -73.9857
            stopType = "DELIVERY"
            estimatedServiceTimeMinutes = 15
            notes = "Large office delivery - use service elevator"
        },
        @{
            name = "Customer B - Retail Store"
            address = "789 Commerce St"
            latitude = 40.7831
            longitude = -73.9712
            stopType = "DELIVERY"
            estimatedServiceTimeMinutes = 10
            notes = "Retail store - loading dock available"
        },
        @{
            name = "Customer C - Restaurant"
            address = "321 Food Court Plaza"
            latitude = 40.8176
            longitude = -73.9442
            stopType = "DELIVERY"
            estimatedServiceTimeMinutes = 8
            notes = "Restaurant delivery - back entrance"
        }
    )
} | ConvertTo-Json -Depth 10

try {
    $response1 = Invoke-RestMethod -Uri "$baseUrl/route-optimization/routes" -Method POST -Body $route1 -ContentType "application/json"
    Write-Host "✓ Created route: $($response1.name)" -ForegroundColor Green
    $routeId1 = $response1.id
} catch {
    Write-Host "✗ Failed to create route 1: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Create a service route
Write-Host "`n2. Creating Service Route..." -ForegroundColor Yellow

$route2 = @{
    name = "Morning Service Route"
    description = "Equipment maintenance and service calls"
    vehicleId = "22222222-2222-2222-2222-222222222222"  # DEF-5678
    driverId = "22222222-2222-2222-2222-222222222222"   # Another driver
    optimizationType = "FUEL_EFFICIENT"
    plannedStartTime = "2024-12-11T08:00:00"
    estimatedFuelCost = 35.75
    notes = "Scheduled maintenance visits"
    stops = @(
        @{
            name = "Service Depot"
            address = "555 Industrial Blvd"
            latitude = 40.7128
            longitude = -74.0060
            stopType = "DEPOT"
            estimatedServiceTimeMinutes = 10
            notes = "Load tools and equipment"
        },
        @{
            name = "Factory A - Maintenance"
            address = "100 Manufacturing Dr"
            latitude = 40.7400
            longitude = -73.9800
            stopType = "SERVICE"
            estimatedServiceTimeMinutes = 45
            notes = "Scheduled equipment maintenance"
        },
        @{
            name = "Office Complex - HVAC Service"
            address = "200 Corporate Plaza"
            latitude = 40.7650
            longitude = -73.9600
            stopType = "SERVICE"
            estimatedServiceTimeMinutes = 30
            notes = "HVAC system inspection"
        }
    )
} | ConvertTo-Json -Depth 10

try {
    $response2 = Invoke-RestMethod -Uri "$baseUrl/route-optimization/routes" -Method POST -Body $route2 -ContentType "application/json"
    Write-Host "✓ Created route: $($response2.name)" -ForegroundColor Green
    $routeId2 = $response2.id
} catch {
    Write-Host "✗ Failed to create route 2: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Create a multi-stop pickup route
Write-Host "`n3. Creating Pickup Route..." -ForegroundColor Yellow

$route3 = @{
    name = "Supply Pickup Route"
    description = "Collect supplies from multiple vendors"
    vehicleId = "11111111-1111-1111-1111-111111111111"  # ABC-1234
    optimizationType = "BALANCED"
    plannedStartTime = "2024-12-11T14:00:00"
    estimatedFuelCost = 18.25
    notes = "Weekly supply collection run"
    stops = @(
        @{
            name = "Warehouse Start"
            address = "777 Storage Way"
            latitude = 40.7128
            longitude = -74.0060
            stopType = "DEPOT"
            estimatedServiceTimeMinutes = 5
            notes = "Empty truck - ready for pickups"
        },
        @{
            name = "Vendor A - Electronics"
            address = "888 Tech Park"
            latitude = 40.7300
            longitude = -73.9900
            stopType = "PICKUP"
            estimatedServiceTimeMinutes = 20
            notes = "Electronics and components"
        },
        @{
            name = "Vendor B - Office Supplies"
            address = "999 Supply Center"
            latitude = 40.7500
            longitude = -73.9700
            stopType = "PICKUP"
            estimatedServiceTimeMinutes = 15
            notes = "Paper, stationery, office equipment"
        },
        @{
            name = "Fuel Station Stop"
            address = "Shell Station - Route 9"
            latitude = 40.7700
            longitude = -73.9500
            stopType = "FUEL_STATION"
            estimatedServiceTimeMinutes = 10
            notes = "Refuel before return"
        }
    )
} | ConvertTo-Json -Depth 10

try {
    $response3 = Invoke-RestMethod -Uri "$baseUrl/route-optimization/routes" -Method POST -Body $route3 -ContentType "application/json"
    Write-Host "✓ Created route: $($response3.name)" -ForegroundColor Green
    $routeId3 = $response3.id
} catch {
    Write-Host "✗ Failed to create route 3: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 4: Start one of the routes to test status changes
if ($routeId1) {
    Write-Host "`n4. Starting Downtown Delivery Route..." -ForegroundColor Yellow
    try {
        $startResponse = Invoke-RestMethod -Uri "$baseUrl/route-optimization/routes/$routeId1/start" -Method POST
        Write-Host "✓ Route started successfully" -ForegroundColor Green
    } catch {
        Write-Host "✗ Failed to start route: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Test 5: Complete one route to test analytics
if ($routeId2) {
    Write-Host "`n5. Starting and completing Service Route..." -ForegroundColor Yellow
    try {
        # Start the route first
        Invoke-RestMethod -Uri "$baseUrl/route-optimization/routes/$routeId2/start" -Method POST
        Write-Host "✓ Service route started" -ForegroundColor Green
        
        # Complete the route
        $completeResponse = Invoke-RestMethod -Uri "$baseUrl/route-optimization/routes/$routeId2/complete" -Method POST
        Write-Host "✓ Service route completed" -ForegroundColor Green
    } catch {
        Write-Host "✗ Failed to complete route: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Test 6: Get all routes to verify
Write-Host "`n6. Fetching all routes..." -ForegroundColor Yellow
try {
    $allRoutes = Invoke-RestMethod -Uri "$baseUrl/route-optimization/routes?page=0&size=10" -Method GET
    Write-Host "✓ Found $($allRoutes.content.Count) routes total" -ForegroundColor Green
    
    Write-Host "`nRoute Summary:" -ForegroundColor Cyan
    foreach ($route in $allRoutes.content) {
        $statusColor = switch ($route.status) {
            "PLANNED" { "Yellow" }
            "IN_PROGRESS" { "Blue" }
            "COMPLETED" { "Green" }
            default { "White" }
        }
        Write-Host "  • $($route.name) - Status: $($route.status) - Stops: $($route.stops.Count)" -ForegroundColor $statusColor
    }
} catch {
    Write-Host "✗ Failed to fetch routes: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== Route Optimization Test Complete ===" -ForegroundColor Green
Write-Host "Now refresh your browser to see the enhanced tables with data!" -ForegroundColor Cyan

# Instructions for testing
Write-Host "`n=== Testing Instructions ===" -ForegroundColor Magenta
Write-Host "1. Refresh the Route Optimization page" -ForegroundColor White
Write-Host "2. Check the 'Routes' tab - should show 3 routes with different statuses" -ForegroundColor White
Write-Host "3. Look for enhanced table styling with status badges and action buttons" -ForegroundColor White
Write-Host "4. Try the 'Start' button on planned routes" -ForegroundColor White
Write-Host "5. Try the 'Complete' button on in-progress routes" -ForegroundColor White
Write-Host "6. Try the 'Replay' and 'Analytics' buttons on completed routes" -ForegroundColor White
Write-Host "7. Test the 'Create Route' tab with the form you're already using" -ForegroundColor White
Write-Host "8. Check the 'Analytics' tab for summary statistics" -ForegroundColor White