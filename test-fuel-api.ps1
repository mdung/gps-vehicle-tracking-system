Write-Host "Testing Fuel Management API..." -ForegroundColor Green

# Test health check
Write-Host "1. Testing health check..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/fuel/health" -Method Get
    Write-Host "Health check response: $response" -ForegroundColor Green
} catch {
    Write-Host "Health check failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test get all fuel records
Write-Host "`n2. Testing get all fuel records..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/fuel/records?page=0&size=20" -Method Get
    Write-Host "Fuel records response: $($response | ConvertTo-Json -Depth 2)" -ForegroundColor Green
} catch {
    Write-Host "Fuel records failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test get all vehicles (to check if basic system is working)
Write-Host "`n3. Testing get all vehicles..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/vehicles" -Method Get
    Write-Host "Vehicles response: $($response | ConvertTo-Json -Depth 2)" -ForegroundColor Green
    
    # If vehicles exist, try to create a fuel record
    if ($response -and $response.Count -gt 0) {
        $vehicleId = $response[0].id
        Write-Host "`n4. Testing fuel record creation with vehicle ID: $vehicleId..." -ForegroundColor Yellow
        
        $fuelRecord = @{
            vehicleId = $vehicleId
            fuelAmountLiters = 45.5
            fuelCost = 68.25
            costPerLiter = 1.5
            odometerReading = 15000.0
            fuelStation = "Test Station"
            fuelType = "Gasoline"
            recordType = "REFUEL"
            notes = "Test fuel record from PowerShell"
            refuelDate = "2024-12-10T10:00:00"
        }
        
        $jsonBody = $fuelRecord | ConvertTo-Json
        $headers = @{ "Content-Type" = "application/json" }
        
        try {
            $createResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/fuel/records" -Method Post -Body $jsonBody -Headers $headers
            Write-Host "Fuel record created successfully: $($createResponse | ConvertTo-Json -Depth 2)" -ForegroundColor Green
        } catch {
            Write-Host "Fuel record creation failed: $($_.Exception.Message)" -ForegroundColor Red
            if ($_.Exception.Response) {
                $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
                $responseBody = $reader.ReadToEnd()
                Write-Host "Error details: $responseBody" -ForegroundColor Red
            }
        }
    } else {
        Write-Host "No vehicles found - cannot test fuel record creation" -ForegroundColor Yellow
    }
} catch {
    Write-Host "Vehicles failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nAPI tests completed." -ForegroundColor Green