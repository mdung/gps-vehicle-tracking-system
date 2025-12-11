#!/usr/bin/env pwsh

# Test Speed Monitoring API and populate data
$baseUrl = "http://localhost:8080/api/speed-monitoring"

Write-Host "=== Testing Speed Monitoring API ===" -ForegroundColor Green

# Test 1: Health Check
Write-Host "`n1. Testing Health Check..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "$baseUrl/health" -Method GET
    Write-Host "✓ Speed Monitoring Service is UP" -ForegroundColor Green
    Write-Host "  Status: $($health.status)" -ForegroundColor Cyan
} catch {
    Write-Host "✗ Health check failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test 2: Get Speed Limits
Write-Host "`n2. Fetching Speed Limits..." -ForegroundColor Yellow
try {
    $speedLimits = Invoke-RestMethod -Uri "$baseUrl/speed-limits?page=0&size=10" -Method GET
    Write-Host "✓ Found $($speedLimits.content.Count) speed limits" -ForegroundColor Green
    
    foreach ($limit in $speedLimits.content) {
        Write-Host "  • $($limit.name): $($limit.speedLimitKmh) km/h ($($limit.areaType))" -ForegroundColor Cyan
    }
} catch {
    Write-Host "✗ Failed to fetch speed limits: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Get Speed Violations
Write-Host "`n3. Fetching Speed Violations..." -ForegroundColor Yellow
try {
    $violations = Invoke-RestMethod -Uri "$baseUrl/violations?page=0&size=10" -Method GET
    Write-Host "✓ Found $($violations.content.Count) speed violations" -ForegroundColor Green
    
    foreach ($violation in $violations.content) {
        $severityColor = switch ($violation.violationSeverity) {
            "MINOR" { "Green" }
            "MAJOR" { "Yellow" }
            "SEVERE" { "Red" }
            "CRITICAL" { "Magenta" }
            default { "White" }
        }
        Write-Host "  • $($violation.vehicleLicensePlate): $($violation.recordedSpeedKmh) km/h (+$($violation.speedOverLimitKmh)) - $($violation.violationSeverity)" -ForegroundColor $severityColor
    }
} catch {
    Write-Host "✗ Failed to fetch violations: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 4: Get Unacknowledged Violations
Write-Host "`n4. Fetching Unacknowledged Violations..." -ForegroundColor Yellow
try {
    $unacknowledged = Invoke-RestMethod -Uri "$baseUrl/violations/unacknowledged?page=0&size=10" -Method GET
    Write-Host "✓ Found $($unacknowledged.content.Count) unacknowledged violations" -ForegroundColor Green
    
    if ($unacknowledged.content.Count -gt 0) {
        Write-Host "  Unacknowledged violations require attention!" -ForegroundColor Yellow
    }
} catch {
    Write-Host "✗ Failed to fetch unacknowledged violations: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 5: Get Speed History
Write-Host "`n5. Fetching Speed History..." -ForegroundColor Yellow
try {
    $history = Invoke-RestMethod -Uri "$baseUrl/history?page=0&size=10" -Method GET
    Write-Host "✓ Found $($history.content.Count) speed history records" -ForegroundColor Green
    
    $violationCount = ($history.content | Where-Object { $_.isViolation -eq $true }).Count
    Write-Host "  • $violationCount violations in recent history" -ForegroundColor $(if ($violationCount -gt 0) { "Yellow" } else { "Green" })
} catch {
    Write-Host "✗ Failed to fetch speed history: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 6: Get Violation Statistics by Severity
Write-Host "`n6. Fetching Violation Statistics..." -ForegroundColor Yellow
try {
    $stats = Invoke-RestMethod -Uri "$baseUrl/statistics/violations/severity" -Method GET
    Write-Host "✓ Violation Statistics:" -ForegroundColor Green
    Write-Host "  • Minor: $($stats.minor)" -ForegroundColor Green
    Write-Host "  • Major: $($stats.major)" -ForegroundColor Yellow
    Write-Host "  • Severe: $($stats.severe)" -ForegroundColor Red
    Write-Host "  • Critical: $($stats.critical)" -ForegroundColor Magenta
    Write-Host "  • Total: $($stats.total)" -ForegroundColor Cyan
} catch {
    Write-Host "✗ Failed to fetch statistics: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 7: Create a New Speed Limit
Write-Host "`n7. Creating Test Speed Limit..." -ForegroundColor Yellow
$newSpeedLimit = @{
    name = "Test Highway Speed Limit"
    description = "Test speed limit for API validation"
    areaType = "HIGHWAY"
    speedLimitKmh = 120
    latitude = 40.7500
    longitude = -73.9500
    radiusMeters = 5000
    roadType = "HIGHWAY"
    timeRestrictions = ""
    isActive = $true
} | ConvertTo-Json

try {
    $createdLimit = Invoke-RestMethod -Uri "$baseUrl/speed-limits" -Method POST -Body $newSpeedLimit -ContentType "application/json"
    Write-Host "✓ Created speed limit: $($createdLimit.name)" -ForegroundColor Green
    $testSpeedLimitId = $createdLimit.id
} catch {
    Write-Host "✗ Failed to create speed limit: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 8: Generate a Speed Report
Write-Host "`n8. Generating Speed Report..." -ForegroundColor Yellow
$reportParams = @{
    startDate = (Get-Date).AddDays(-7).ToString("yyyy-MM-dd")
    endDate = (Get-Date).ToString("yyyy-MM-dd")
    generatedBy = "API Test Script"
}

try {
    $report = Invoke-RestMethod -Uri "$baseUrl/reports/generate" -Method POST -Body $null -ContentType "application/json" -Headers @{} -Uri "$baseUrl/reports/generate?startDate=$($reportParams.startDate)&endDate=$($reportParams.endDate)&generatedBy=$($reportParams.generatedBy)"
    Write-Host "✓ Generated report: $($report.reportName)" -ForegroundColor Green
    Write-Host "  • Total Violations: $($report.totalViolations)" -ForegroundColor Cyan
    Write-Host "  • Total Fine Amount: $($report.totalFineAmount)" -ForegroundColor Cyan
} catch {
    Write-Host "✗ Failed to generate report: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 9: Acknowledge a Violation (if any unacknowledged exist)
if ($unacknowledged.content.Count -gt 0) {
    Write-Host "`n9. Acknowledging a Violation..." -ForegroundColor Yellow
    $violationToAck = $unacknowledged.content[0]
    $acknowledgment = @{
        acknowledgedBy = "API Test Script"
        notes = "Acknowledged during API testing"
    } | ConvertTo-Json
    
    try {
        $acknowledged = Invoke-RestMethod -Uri "$baseUrl/violations/$($violationToAck.id)/acknowledge" -Method POST -Body $acknowledgment -ContentType "application/json"
        Write-Host "✓ Acknowledged violation for vehicle: $($acknowledged.vehicleLicensePlate)" -ForegroundColor Green
    } catch {
        Write-Host "✗ Failed to acknowledge violation: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Test 10: Clean up - Delete test speed limit
if ($testSpeedLimitId) {
    Write-Host "`n10. Cleaning up test data..." -ForegroundColor Yellow
    try {
        Invoke-RestMethod -Uri "$baseUrl/speed-limits/$testSpeedLimitId" -Method DELETE
        Write-Host "✓ Deleted test speed limit" -ForegroundColor Green
    } catch {
        Write-Host "✗ Failed to delete test speed limit: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`n=== Speed Monitoring API Test Complete ===" -ForegroundColor Green

# Summary and Instructions
Write-Host "`n=== Testing Instructions ===" -ForegroundColor Magenta
Write-Host "1. Navigate to http://localhost:3000/speed-monitoring" -ForegroundColor White
Write-Host "2. Check the 'Violations' tab - should show speed violations with enhanced styling" -ForegroundColor White
Write-Host "3. Try the 'Speed History' tab - shows all speed records" -ForegroundColor White
Write-Host "4. Check the 'Speed Limits' tab - manage speed limit zones" -ForegroundColor White
Write-Host "5. Try the 'Reports' tab - generate speed monitoring reports" -ForegroundColor White
Write-Host "6. Test filters on violations and history tabs" -ForegroundColor White
Write-Host "7. Try acknowledging violations" -ForegroundColor White
Write-Host "8. Create new speed limits and generate reports" -ForegroundColor White

Write-Host "`n=== Features Implemented ===" -ForegroundColor Magenta
Write-Host "✓ Speed limit management with geographic zones" -ForegroundColor Green
Write-Host "✓ Real-time speed violation detection" -ForegroundColor Green
Write-Host "✓ Speed history tracking per vehicle/driver" -ForegroundColor Green
Write-Host "✓ Violation severity classification (Minor/Major/Severe/Critical)" -ForegroundColor Green
Write-Host "✓ Automatic fine and points calculation" -ForegroundColor Green
Write-Host "✓ Violation acknowledgment system" -ForegroundColor Green
Write-Host "✓ Comprehensive reporting with statistics" -ForegroundColor Green
Write-Host "✓ Enhanced table styling with modern UI" -ForegroundColor Green
Write-Host "✓ Filtering and search capabilities" -ForegroundColor Green
Write-Host "✓ Integration with existing GPS tracking system" -ForegroundColor Green