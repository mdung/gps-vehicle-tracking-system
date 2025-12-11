# Maintenance API Test Script
# This script tests the maintenance management system API endpoints

$baseUrl = "http://localhost:8080/api/maintenance"
$headers = @{
    "Content-Type" = "application/json"
}

Write-Host "=== Testing Maintenance Management System API ===" -ForegroundColor Green
Write-Host ""

# Test 1: Get all maintenance types
Write-Host "1. Testing GET /maintenance/types" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/types" -Method GET -Headers $headers
    Write-Host "✓ Success: Found $($response.totalElements) maintenance types" -ForegroundColor Green
    
    # Display first few types
    if ($response.content.Count -gt 0) {
        Write-Host "Sample maintenance types:" -ForegroundColor Cyan
        $response.content | Select-Object -First 3 | ForEach-Object {
            Write-Host "  - $($_.name) ($($_.category)) - Estimated: $($_.estimatedCost)" -ForegroundColor White
        }
    }
} catch {
    Write-Host "✗ Failed: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 2: Get active maintenance types
Write-Host "2. Testing GET /maintenance/types/active" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/types/active" -Method GET -Headers $headers
    Write-Host "✓ Success: Found $($response.Count) active maintenance types" -ForegroundColor Green
} catch {
    Write-Host "✗ Failed: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 3: Get all maintenance schedules
Write-Host "3. Testing GET /maintenance/schedules" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/schedules" -Method GET -Headers $headers
    Write-Host "✓ Success: Found $($response.totalElements) maintenance schedules" -ForegroundColor Green
    
    # Display schedule details
    if ($response.content.Count -gt 0) {
        Write-Host "Sample schedules:" -ForegroundColor Cyan
        $response.content | Select-Object -First 2 | ForEach-Object {
            $nextDue = if ($_.nextDueDate) { $_.nextDueDate } else { "Not scheduled" }
            Write-Host "  - $($_.maintenanceType.name) - Next due: $nextDue" -ForegroundColor White
        }
    }
} catch {
    Write-Host "✗ Failed: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 4: Get overdue schedules
Write-Host "4. Testing GET /maintenance/schedules/overdue" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/schedules/overdue" -Method GET -Headers $headers
    Write-Host "✓ Success: Found $($response.Count) overdue schedules" -ForegroundColor Green
    
    if ($response.Count -gt 0) {
        Write-Host "Overdue maintenance:" -ForegroundColor Red
        $response | ForEach-Object {
            Write-Host "  - $($_.maintenanceType.name) - Due: $($_.nextDueDate)" -ForegroundColor White
        }
    } else {
        Write-Host "  No overdue maintenance found" -ForegroundColor Green
    }
} catch {
    Write-Host "✗ Failed: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 5: Get maintenance records
Write-Host "5. Testing GET /maintenance/records" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/records" -Method GET -Headers $headers
    Write-Host "✓ Success: Found $($response.totalElements) maintenance records" -ForegroundColor Green
    
    # Display recent records
    if ($response.content.Count -gt 0) {
        Write-Host "Recent maintenance records:" -ForegroundColor Cyan
        $response.content | Select-Object -First 3 | ForEach-Object {
            $cost = if ($_.totalCost) { "$($_.totalCost)" } else { "N/A" }
            Write-Host "  - $($_.serviceDate): $($_.maintenanceType.name) - Cost: $$cost" -ForegroundColor White
        }
    }
} catch {
    Write-Host "✗ Failed: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 6: Get unacknowledged reminders
Write-Host "6. Testing GET /maintenance/reminders/unacknowledged" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/reminders/unacknowledged" -Method GET -Headers $headers
    Write-Host "✓ Success: Found $($response.Count) unacknowledged reminders" -ForegroundColor Green
    
    if ($response.Count -gt 0) {
        Write-Host "Active reminders:" -ForegroundColor Yellow
        $response | ForEach-Object {
            $priority = $_.priority
            $color = switch ($priority) {
                "CRITICAL" { "Red" }
                "HIGH" { "Yellow" }
                "MEDIUM" { "Cyan" }
                default { "White" }
            }
            Write-Host "  - [$priority] $($_.maintenanceSchedule.maintenanceType.name) - Due: $($_.dueDate)" -ForegroundColor $color
        }
    } else {
        Write-Host "  No unacknowledged reminders" -ForegroundColor Green
    }
} catch {
    Write-Host "✗ Failed: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 7: Get overdue reminders
Write-Host "7. Testing GET /maintenance/reminders/overdue" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/reminders/overdue" -Method GET -Headers $headers
    Write-Host "✓ Success: Found $($response.Count) overdue reminders" -ForegroundColor Green
    
    if ($response.Count -gt 0) {
        Write-Host "Overdue reminders:" -ForegroundColor Red
        $response | ForEach-Object {
            Write-Host "  - $($_.maintenanceSchedule.maintenanceType.name) - Overdue by $($_.daysOverdue) days" -ForegroundColor White
        }
    } else {
        Write-Host "  No overdue reminders" -ForegroundColor Green
    }
} catch {
    Write-Host "✗ Failed: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 8: Get maintenance analytics
Write-Host "8. Testing GET /maintenance/analytics/reminders/unacknowledged/count" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/analytics/reminders/unacknowledged/count" -Method GET -Headers $headers
    Write-Host "✓ Success: $response unacknowledged reminders" -ForegroundColor Green
} catch {
    Write-Host "✗ Failed: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 9: Test batch operations
Write-Host "9. Testing POST /maintenance/batch/generate-reminders" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/batch/generate-reminders" -Method POST -Headers $headers
    Write-Host "✓ Success: Generated reminders for all schedules" -ForegroundColor Green
} catch {
    Write-Host "✗ Failed: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

Write-Host "=== Maintenance API Test Complete ===" -ForegroundColor Green
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "1. Open browser to http://localhost:3000/maintenance" -ForegroundColor White
Write-Host "2. Test the UI functionality" -ForegroundColor White
Write-Host "3. Create new maintenance schedules and records" -ForegroundColor White
Write-Host "4. Verify reminder system is working" -ForegroundColor White