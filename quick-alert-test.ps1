Write-Host "=== QUICK GEOFENCE ALERT TEST ===" -ForegroundColor Green
Write-Host "This will generate a single alert for testing" -ForegroundColor Yellow
Write-Host ""

# Vehicle ABC-1234 (assigned to all geofences)
$vehicleId = "550e8400-e29b-41d4-a716-446655440001"
$vehiclePlate = "ABC-1234"

Write-Host "Testing with vehicle: $vehiclePlate" -ForegroundColor Cyan
Write-Host ""

# Function to send GPS location
function Send-GpsLocation {
    param(
        [double]$Latitude,
        [double]$Longitude,
        [string]$Description
    )
    
    $gpsData = @{
        vehicleId = $vehicleId
        latitude = $Latitude
        longitude = $Longitude
        speed = 25.0
        direction = 90.0
        timestamp = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
    }
    
    $jsonBody = $gpsData | ConvertTo-Json
    $headers = @{ "Content-Type" = "application/json" }
    
    try {
        Write-Host "📍 $Description" -ForegroundColor Yellow
        Write-Host "   Sending GPS: ($Latitude, $Longitude)" -ForegroundColor White
        $response = Invoke-RestMethod -Uri "http://localhost:8080/api/gps-locations" -Method Post -Body $jsonBody -Headers $headers
        Write-Host "   ✓ Location sent successfully" -ForegroundColor Green
        return $true
    } catch {
        Write-Host "   ✗ Failed: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Function to check alerts
function Check-Alerts {
    try {
        $alerts = Invoke-RestMethod -Uri "http://localhost:8080/api/geofencing/alerts/unacknowledged" -Method Get
        Write-Host "🚨 Current alerts: $($alerts.Count)" -ForegroundColor Cyan
        
        if ($alerts.Count -gt 0) {
            foreach ($alert in $alerts) {
                Write-Host "   Alert: $($alert.message)" -ForegroundColor Red
                Write-Host "   Vehicle: $($alert.vehicleLicensePlate)" -ForegroundColor White
                Write-Host "   Geofence: $($alert.geofenceName)" -ForegroundColor White
                Write-Host "   Type: $($alert.alertType)" -ForegroundColor White
                Write-Host "   Severity: $($alert.severity)" -ForegroundColor White
                Write-Host ""
            }
        }
        return $alerts.Count
    } catch {
        Write-Host "Failed to check alerts: $($_.Exception.Message)" -ForegroundColor Red
        return 0
    }
}

Write-Host "=== RESTRICTED ZONE ALERT TEST ===" -ForegroundColor Magenta
Write-Host "This should generate an UNAUTHORIZED_ENTRY alert" -ForegroundColor Yellow
Write-Host ""

# Step 1: Position outside restricted zone
Write-Host "Step 1: Position vehicle outside Restricted Zone" -ForegroundColor Yellow
Send-GpsLocation -Latitude 40.74700 -Longitude -73.99000 -Description "Positioning outside Restricted Zone"
Start-Sleep -Seconds 2

# Check initial alerts
Write-Host "Initial alert check:" -ForegroundColor Cyan
$initialAlerts = Check-Alerts
Start-Sleep -Seconds 1

# Step 2: Move into restricted zone (should trigger alert)
Write-Host "Step 2: Move vehicle INTO Restricted Zone (should trigger alert)" -ForegroundColor Yellow
Send-GpsLocation -Latitude 40.75050 -Longitude -73.99340 -Description "ENTERING Restricted Zone"
Start-Sleep -Seconds 3

# Check for new alerts
Write-Host "Checking for new alerts..." -ForegroundColor Cyan
$finalAlerts = Check-Alerts

if ($finalAlerts -gt $initialAlerts) {
    Write-Host ""
    Write-Host "🎉 SUCCESS! Alert generated!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Now do this:" -ForegroundColor Yellow
    Write-Host "1. Go to your web browser" -ForegroundColor White
    Write-Host "2. Navigate to Geofencing & Alerts page" -ForegroundColor White
    Write-Host "3. Click on 'Active Alerts' tab" -ForegroundColor White
    Write-Host "4. You should see the UNAUTHORIZED_ENTRY alert!" -ForegroundColor White
    Write-Host "5. Click 'Acknowledge' to clear the alert" -ForegroundColor White
} else {
    Write-Host ""
    Write-Host "⚠️ No new alerts generated" -ForegroundColor Yellow
    Write-Host "Possible reasons:" -ForegroundColor White
    Write-Host "- Vehicle might not be assigned to the Restricted Zone geofence" -ForegroundColor White
    Write-Host "- Geofence checking might not be triggered automatically" -ForegroundColor White
    Write-Host "- Check the backend logs for any errors" -ForegroundColor White
}

Write-Host ""
Write-Host "=== TEST COMPLETED ===" -ForegroundColor Green