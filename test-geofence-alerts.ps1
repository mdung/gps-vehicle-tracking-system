Write-Host "=== GEOFENCE ALERT GENERATION TEST ===" -ForegroundColor Green
Write-Host "This script will generate GPS locations to trigger geofence alerts" -ForegroundColor Yellow
Write-Host ""

# Vehicle and Geofence IDs (from your existing data)
$vehicles = @(
    @{ id = "550e8400-e29b-41d4-a716-446655440001"; plate = "ABC-1234" },
    @{ id = "550e8400-e29b-41d4-a716-446655440002"; plate = "XYZ-5678" },
    @{ id = "550e8400-e29b-41d4-a716-446655440003"; plate = "DEF-9012" }
)

# Geofence coordinates (from your existing geofences)
$geofences = @(
    @{ 
        name = "Customer Site A"
        lat = 40.75890000
        lng = -73.98510000
        radius = 200
        type = "CUSTOMER_LOCATION"
        alertType = "ENTRY_AND_EXIT"
    },
    @{ 
        name = "Main Depot"
        lat = 40.71280000
        lng = -74.00600000
        radius = 500
        type = "DEPOT"
        alertType = "ENTRY_AND_EXIT"
    },
    @{ 
        name = "Restricted Zone"
        lat = 40.75050000
        lng = -73.99340000
        radius = 300
        type = "RESTRICTED_AREA"
        alertType = "UNAUTHORIZED_ENTRY"
    },
    @{ 
        name = "Service Area North"
        lat = 40.78310000
        lng = -73.97120000
        radius = 1000
        type = "SERVICE_AREA"
        alertType = "ENTRY_ONLY"
    }
)

Write-Host "Available Scenarios:" -ForegroundColor Cyan
Write-Host "1. Vehicle enters Customer Site A (should generate ENTRY alert)" -ForegroundColor White
Write-Host "2. Vehicle enters Restricted Zone (should generate UNAUTHORIZED_ENTRY alert)" -ForegroundColor White
Write-Host "3. Vehicle enters Main Depot (should generate ENTRY alert)" -ForegroundColor White
Write-Host "4. Vehicle enters Service Area North (should generate ENTRY_ONLY alert)" -ForegroundColor White
Write-Host ""

# Function to send GPS location
function Send-GpsLocation {
    param(
        [string]$VehicleId,
        [string]$VehiclePlate,
        [double]$Latitude,
        [double]$Longitude,
        [double]$Speed = 25.0,
        [double]$Direction = 90.0
    )
    
    $gpsData = @{
        vehicleId = $VehicleId
        latitude = $Latitude
        longitude = $Longitude
        speed = $Speed
        direction = $Direction
        timestamp = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
    }
    
    $jsonBody = $gpsData | ConvertTo-Json
    $headers = @{ "Content-Type" = "application/json" }
    
    try {
        Write-Host "Sending GPS location for vehicle $VehiclePlate to ($Latitude, $Longitude)..." -ForegroundColor Yellow
        $response = Invoke-RestMethod -Uri "http://localhost:8080/api/gps-locations" -Method Post -Body $jsonBody -Headers $headers
        Write-Host "✓ GPS location sent successfully" -ForegroundColor Green
        return $true
    } catch {
        Write-Host "✗ Failed to send GPS location: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Function to check for new alerts
function Check-Alerts {
    try {
        $alerts = Invoke-RestMethod -Uri "http://localhost:8080/api/geofencing/alerts/unacknowledged" -Method Get
        Write-Host "Current unacknowledged alerts: $($alerts.Count)" -ForegroundColor Cyan
        
        if ($alerts.Count -gt 0) {
            Write-Host "=== ALERTS GENERATED ===" -ForegroundColor Green
            foreach ($alert in $alerts) {
                Write-Host "🚨 Alert: $($alert.message)" -ForegroundColor Red
                Write-Host "   Vehicle: $($alert.vehicleLicensePlate)" -ForegroundColor White
                Write-Host "   Geofence: $($alert.geofenceName)" -ForegroundColor White
                Write-Host "   Type: $($alert.alertType)" -ForegroundColor White
                Write-Host "   Severity: $($alert.severity)" -ForegroundColor White
                Write-Host "   Time: $($alert.alertTime)" -ForegroundColor White
                Write-Host ""
            }
        }
        return $alerts
    } catch {
        Write-Host "Failed to check alerts: $($_.Exception.Message)" -ForegroundColor Red
        return @()
    }
}

Write-Host "=== SCENARIO 1: Vehicle ABC-1234 enters Customer Site A ===" -ForegroundColor Magenta
$customerSite = $geofences[0]
$vehicle1 = $vehicles[0]

# Send location outside the geofence first
Write-Host "Step 1: Positioning vehicle outside Customer Site A..." -ForegroundColor Yellow
Send-GpsLocation -VehicleId $vehicle1.id -VehiclePlate $vehicle1.plate -Latitude ($customerSite.lat - 0.005) -Longitude ($customerSite.lng - 0.005)
Start-Sleep -Seconds 2

# Send location inside the geofence (should trigger ENTRY alert)
Write-Host "Step 2: Moving vehicle INTO Customer Site A (should trigger ENTRY alert)..." -ForegroundColor Yellow
Send-GpsLocation -VehicleId $vehicle1.id -VehiclePlate $vehicle1.plate -Latitude $customerSite.lat -Longitude $customerSite.lng
Start-Sleep -Seconds 3

Write-Host "Checking for alerts..." -ForegroundColor Cyan
$alerts1 = Check-Alerts
Start-Sleep -Seconds 2

Write-Host "=== SCENARIO 2: Vehicle XYZ-5678 enters Restricted Zone ===" -ForegroundColor Magenta
$restrictedZone = $geofences[2]
$vehicle2 = $vehicles[1]

# Send location outside the restricted zone
Write-Host "Step 1: Positioning vehicle outside Restricted Zone..." -ForegroundColor Yellow
Send-GpsLocation -VehicleId $vehicle2.id -VehiclePlate $vehicle2.plate -Latitude ($restrictedZone.lat - 0.005) -Longitude ($restrictedZone.lng - 0.005)
Start-Sleep -Seconds 2

# Send location inside the restricted zone (should trigger UNAUTHORIZED_ENTRY alert)
Write-Host "Step 2: Moving vehicle INTO Restricted Zone (should trigger UNAUTHORIZED_ENTRY alert)..." -ForegroundColor Yellow
Send-GpsLocation -VehicleId $vehicle2.id -VehiclePlate $vehicle2.plate -Latitude $restrictedZone.lat -Longitude $restrictedZone.lng
Start-Sleep -Seconds 3

Write-Host "Checking for alerts..." -ForegroundColor Cyan
$alerts2 = Check-Alerts
Start-Sleep -Seconds 2

Write-Host "=== SCENARIO 3: Vehicle DEF-9012 enters Main Depot ===" -ForegroundColor Magenta
$depot = $geofences[1]
$vehicle3 = $vehicles[2]

# Send location outside the depot
Write-Host "Step 1: Positioning vehicle outside Main Depot..." -ForegroundColor Yellow
Send-GpsLocation -VehicleId $vehicle3.id -VehiclePlate $vehicle3.plate -Latitude ($depot.lat - 0.008) -Longitude ($depot.lng - 0.008)
Start-Sleep -Seconds 2

# Send location inside the depot (should trigger ENTRY alert)
Write-Host "Step 2: Moving vehicle INTO Main Depot (should trigger ENTRY alert)..." -ForegroundColor Yellow
Send-GpsLocation -VehicleId $vehicle3.id -VehiclePlate $vehicle3.plate -Latitude $depot.lat -Longitude $depot.lng
Start-Sleep -Seconds 3

Write-Host "Checking for alerts..." -ForegroundColor Cyan
$alerts3 = Check-Alerts

Write-Host "=== FINAL ALERT SUMMARY ===" -ForegroundColor Green
$finalAlerts = Check-Alerts

if ($finalAlerts.Count -gt 0) {
    Write-Host "🎉 SUCCESS! Generated $($finalAlerts.Count) geofence alerts!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Now go to your web interface and:" -ForegroundColor Yellow
    Write-Host "1. Refresh the Geofencing & Alerts page" -ForegroundColor White
    Write-Host "2. Click on 'Active Alerts' tab" -ForegroundColor White
    Write-Host "3. You should see the generated alerts" -ForegroundColor White
    Write-Host "4. You can acknowledge them by clicking 'Acknowledge' button" -ForegroundColor White
} else {
    Write-Host "⚠️  No alerts were generated. This might be because:" -ForegroundColor Yellow
    Write-Host "1. Vehicles are not assigned to geofences" -ForegroundColor White
    Write-Host "2. Geofence checking logic needs to be triggered" -ForegroundColor White
    Write-Host "3. There might be an issue with the alert generation system" -ForegroundColor White
}

Write-Host ""
Write-Host "=== TEST COMPLETED ===" -ForegroundColor Green