Write-Host "Testing Geofencing API..." -ForegroundColor Green

# Test health check
Write-Host "`n1. Testing geofencing health check..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/geofencing/health" -Method Get
    Write-Host "Health check response: $response" -ForegroundColor Green
} catch {
    Write-Host "Health check failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Make sure the backend is running and geofencing tables are created" -ForegroundColor Yellow
}

# Test get all geofences
Write-Host "`n2. Testing get all geofences..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/geofencing/geofences?page=0&size=20" -Method Get
    Write-Host "Geofences response: $($response | ConvertTo-Json -Depth 3)" -ForegroundColor Green
    Write-Host "Total geofences found: $($response.totalElements)" -ForegroundColor Cyan
} catch {
    Write-Host "Geofences request failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Error details: $responseBody" -ForegroundColor Red
    }
}

# Test get unacknowledged alerts
Write-Host "`n3. Testing get unacknowledged alerts..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/geofencing/alerts/unacknowledged" -Method Get
    Write-Host "Unacknowledged alerts: $($response | ConvertTo-Json -Depth 2)" -ForegroundColor Green
    Write-Host "Total unacknowledged alerts: $($response.Count)" -ForegroundColor Cyan
} catch {
    Write-Host "Alerts request failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Error details: $responseBody" -ForegroundColor Red
    }
}

# Test create a sample geofence
Write-Host "`n4. Testing create geofence..." -ForegroundColor Yellow
try {
    $geofence = @{
        name = "Test Geofence"
        description = "Test geofence created via PowerShell"
        type = "AUTHORIZED_AREA"
        shape = "CIRCLE"
        centerLatitude = 40.7128
        centerLongitude = -74.0060
        radiusMeters = 1000
        alertType = "ENTRY_AND_EXIT"
        bufferTimeMinutes = 0
        isActive = $true
    }
    
    $jsonBody = $geofence | ConvertTo-Json
    $headers = @{ "Content-Type" = "application/json" }
    
    $createResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/geofencing/geofences" -Method Post -Body $jsonBody -Headers $headers
    Write-Host "Geofence created successfully: $($createResponse | ConvertTo-Json -Depth 2)" -ForegroundColor Green
} catch {
    Write-Host "Geofence creation failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Error details: $responseBody" -ForegroundColor Red
    }
}

Write-Host "`nGeofencing API tests completed." -ForegroundColor Green
Write-Host "`nIf you see errors above:" -ForegroundColor Yellow
Write-Host "1. Make sure the backend is running (mvn spring-boot:run)" -ForegroundColor White
Write-Host "2. Check if database migrations ran (look for V9__Create_geofencing_tables.sql)" -ForegroundColor White
Write-Host "3. Verify PostgreSQL is running and accessible" -ForegroundColor White