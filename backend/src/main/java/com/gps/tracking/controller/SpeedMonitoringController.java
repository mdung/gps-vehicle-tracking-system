package com.gps.tracking.controller;

import com.gps.tracking.entity.SpeedLimit;
import com.gps.tracking.entity.SpeedViolation;
import com.gps.tracking.entity.SpeedHistory;
import com.gps.tracking.entity.SpeedReport;
import com.gps.tracking.service.SpeedMonitoringService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/speed-monitoring")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class SpeedMonitoringController {
    
    private final SpeedMonitoringService speedMonitoringService;
    
    // Speed Limits Endpoints
    @GetMapping("/speed-limits")
    public ResponseEntity<Page<SpeedLimit>> getAllSpeedLimits(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<SpeedLimit> speedLimits = speedMonitoringService.getAllSpeedLimits(pageable);
        return ResponseEntity.ok(speedLimits);
    }
    
    @GetMapping("/speed-limits/{id}")
    public ResponseEntity<SpeedLimit> getSpeedLimitById(@PathVariable UUID id) {
        return speedMonitoringService.getSpeedLimitById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping("/speed-limits")
    public ResponseEntity<SpeedLimit> createSpeedLimit(@RequestBody SpeedLimit speedLimit) {
        SpeedLimit created = speedMonitoringService.createSpeedLimit(speedLimit);
        return ResponseEntity.ok(created);
    }
    
    @PutMapping("/speed-limits/{id}")
    public ResponseEntity<SpeedLimit> updateSpeedLimit(@PathVariable UUID id, @RequestBody SpeedLimit speedLimit) {
        SpeedLimit updated = speedMonitoringService.updateSpeedLimit(id, speedLimit);
        return ResponseEntity.ok(updated);
    }
    
    @DeleteMapping("/speed-limits/{id}")
    public ResponseEntity<Void> deleteSpeedLimit(@PathVariable UUID id) {
        speedMonitoringService.deleteSpeedLimit(id);
        return ResponseEntity.ok().build();
    }
    
    @GetMapping("/speed-limits/near")
    public ResponseEntity<List<SpeedLimit>> getSpeedLimitsNearLocation(
            @RequestParam BigDecimal latitude,
            @RequestParam BigDecimal longitude) {
        List<SpeedLimit> speedLimits = speedMonitoringService.findSpeedLimitsNearLocation(latitude, longitude);
        return ResponseEntity.ok(speedLimits);
    }
    
    // Speed Violations Endpoints
    @GetMapping("/violations")
    public ResponseEntity<Page<SpeedViolation>> getAllViolations(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<SpeedViolation> violations = speedMonitoringService.getAllViolations(pageable);
        return ResponseEntity.ok(violations);
    }
    
    @GetMapping("/violations/unacknowledged")
    public ResponseEntity<Page<SpeedViolation>> getUnacknowledgedViolations(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<SpeedViolation> violations = speedMonitoringService.getUnacknowledgedViolations(pageable);
        return ResponseEntity.ok(violations);
    }
    
    @GetMapping("/violations/vehicle/{vehicleId}")
    public ResponseEntity<Page<SpeedViolation>> getViolationsByVehicle(
            @PathVariable UUID vehicleId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<SpeedViolation> violations = speedMonitoringService.getViolationsByVehicle(vehicleId, pageable);
        return ResponseEntity.ok(violations);
    }
    
    @GetMapping("/violations/driver/{driverId}")
    public ResponseEntity<Page<SpeedViolation>> getViolationsByDriver(
            @PathVariable UUID driverId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<SpeedViolation> violations = speedMonitoringService.getViolationsByDriver(driverId, pageable);
        return ResponseEntity.ok(violations);
    }
    
    @GetMapping("/violations/severity/{severity}")
    public ResponseEntity<Page<SpeedViolation>> getViolationsBySeverity(
            @PathVariable SpeedViolation.ViolationSeverity severity,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<SpeedViolation> violations = speedMonitoringService.getViolationsBySeverity(severity, pageable);
        return ResponseEntity.ok(violations);
    }
    
    @GetMapping("/violations/date-range")
    public ResponseEntity<Page<SpeedViolation>> getViolationsByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startTime,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endTime,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<SpeedViolation> violations = speedMonitoringService.getViolationsByDateRange(startTime, endTime, pageable);
        return ResponseEntity.ok(violations);
    }
    
    @PostMapping("/violations/{id}/acknowledge")
    public ResponseEntity<SpeedViolation> acknowledgeViolation(
            @PathVariable UUID id,
            @RequestBody Map<String, String> request) {
        String acknowledgedBy = request.get("acknowledgedBy");
        String notes = request.get("notes");
        SpeedViolation acknowledged = speedMonitoringService.acknowledgeViolation(id, acknowledgedBy, notes);
        return ResponseEntity.ok(acknowledged);
    }
    
    // Speed History Endpoints
    @GetMapping("/history")
    public ResponseEntity<Page<SpeedHistory>> getSpeedHistory(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<SpeedHistory> history = speedMonitoringService.getSpeedHistory(pageable);
        return ResponseEntity.ok(history);
    }
    
    @GetMapping("/history/vehicle/{vehicleId}")
    public ResponseEntity<Page<SpeedHistory>> getSpeedHistoryByVehicle(
            @PathVariable UUID vehicleId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<SpeedHistory> history = speedMonitoringService.getSpeedHistoryByVehicle(vehicleId, pageable);
        return ResponseEntity.ok(history);
    }
    
    @GetMapping("/history/driver/{driverId}")
    public ResponseEntity<Page<SpeedHistory>> getSpeedHistoryByDriver(
            @PathVariable UUID driverId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<SpeedHistory> history = speedMonitoringService.getSpeedHistoryByDriver(driverId, pageable);
        return ResponseEntity.ok(history);
    }
    
    @GetMapping("/history/violations")
    public ResponseEntity<Page<SpeedHistory>> getSpeedViolationHistory(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<SpeedHistory> history = speedMonitoringService.getSpeedViolationHistory(pageable);
        return ResponseEntity.ok(history);
    }
    
    // Reports Endpoints
    @PostMapping("/reports/generate")
    public ResponseEntity<SpeedReport> generateReport(
            @RequestParam(required = false) UUID vehicleId,
            @RequestParam(required = false) UUID driverId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam String generatedBy) {
        SpeedReport report = speedMonitoringService.generateViolationReport(vehicleId, driverId, startDate, endDate, generatedBy);
        return ResponseEntity.ok(report);
    }
    
    // Statistics Endpoints
    @GetMapping("/statistics/violations/vehicle/{vehicleId}")
    public ResponseEntity<Map<String, Object>> getVehicleViolationStats(@PathVariable UUID vehicleId) {
        Long count = speedMonitoringService.getViolationCountByVehicle(vehicleId);
        return ResponseEntity.ok(Map.of("vehicleId", vehicleId, "violationCount", count));
    }
    
    @GetMapping("/statistics/violations/driver/{driverId}")
    public ResponseEntity<Map<String, Object>> getDriverViolationStats(@PathVariable UUID driverId) {
        Long count = speedMonitoringService.getViolationCountByDriver(driverId);
        return ResponseEntity.ok(Map.of("driverId", driverId, "violationCount", count));
    }
    
    @GetMapping("/statistics/violations/severity")
    public ResponseEntity<Map<String, Object>> getViolationStatsBySeverity() {
        Long minor = speedMonitoringService.getViolationCountBySeverity(SpeedViolation.ViolationSeverity.MINOR);
        Long major = speedMonitoringService.getViolationCountBySeverity(SpeedViolation.ViolationSeverity.MAJOR);
        Long severe = speedMonitoringService.getViolationCountBySeverity(SpeedViolation.ViolationSeverity.SEVERE);
        Long critical = speedMonitoringService.getViolationCountBySeverity(SpeedViolation.ViolationSeverity.CRITICAL);
        
        return ResponseEntity.ok(Map.of(
            "minor", minor,
            "major", major,
            "severe", severe,
            "critical", critical,
            "total", minor + major + severe + critical
        ));
    }
    
    // Health Check
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> healthCheck() {
        return ResponseEntity.ok(Map.of(
            "status", "UP",
            "service", "Speed Monitoring Service",
            "timestamp", LocalDateTime.now().toString()
        ));
    }
}