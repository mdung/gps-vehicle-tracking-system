# PowerShell script để test WebSocket
# Usage: .\test-websocket.ps1 <VEHICLE_ID>

param(
    [Parameter(Mandatory=$true)]
    [string]$VehicleId
)

Write-Host "Testing WebSocket with Vehicle ID: $VehicleId" -ForegroundColor Green
Write-Host "Make sure you have Dashboard or Tracking page open!" -ForegroundColor Yellow
Write-Host ""

# Test locations around Ho Chi Minh City
$locations = @(
    @{Lat=10.762622; Lng=106.660172; Speed=60; Direction=90},
    @{Lat=10.772622; Lng=106.670172; Speed=65; Direction=95},
    @{Lat=10.782622; Lng=106.680172; Speed=70; Direction=100},
    @{Lat=10.792622; Lng=106.690172; Speed=75; Direction=105},
    @{Lat=10.802622; Lng=106.700172; Speed=80; Direction=110}
)

$count = 1
foreach ($loc in $locations) {
    Write-Host "[$count/$($locations.Count)] Creating location: Lat=$($loc.Lat), Lng=$($loc.Lng), Speed=$($loc.Speed), Direction=$($loc.Direction)" -ForegroundColor Cyan
    
    $body = @{
        vehicleId = $VehicleId
        latitude = $loc.Lat
        longitude = $loc.Lng
        speed = $loc.Speed
        direction = $loc.Direction
    } | ConvertTo-Json
    
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:8080/api/gps-locations" `
            -Method Post `
            -ContentType "application/json" `
            -Body $body
        
        Write-Host "✅ Location created! Check your browser - marker should update automatically!" -ForegroundColor Green
    } catch {
        Write-Host "❌ Error: $_" -ForegroundColor Red
    }
    
    Write-Host ""
    Start-Sleep -Seconds 3
    $count++
}

Write-Host "✅ Test completed! All locations should appear on the map in real-time!" -ForegroundColor Green

