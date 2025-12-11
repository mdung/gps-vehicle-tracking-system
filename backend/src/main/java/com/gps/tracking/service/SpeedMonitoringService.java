package com.gps.tracking.service;

import com.gps.tracking.entity.*;
import com.gps.tracking.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class SpeedMonitoringService {
    
    private final SpeedLimitRepository speedLimitRepository;
    private final SpeedViolationRepository speedViolationRepository;
    private final SpeedHistoryRepository speedHistoryRepository;
    private final SpeedReportRepository speedReportRepository;
    private final VehicleRepository vehicleRepository;
    private final DriverRepository driverRepository;
    private final GpsLocationRepository gpsLocationRepository;
    
    // Speed Limit Management
    public Page<SpeedLimit> getAllSpeedLimits(Pageable pageable) {
        return speedLimitRepository.findByIsActiveTrue(pageable);
    }
    
    public Optional<SpeedLimit> getSpeedLimitById(UUID id) {
        return speedLimitRepository.findById(id);
    }
    
    public SpeedLimit createSpeedLimit(SpeedLimit speedLimit) {
        speedLimit.setId(null);
        speedLimit.setCreatedAt(LocalDateTime.now());
        speedLimit.setUpdatedAt(LocalDateTime.now());
        return speedLimitRepository.save(speedLimit);
    }
    
    public SpeedLimit updateSpeedLimit(UUID id, SpeedLimit speedLimit) {
        SpeedLimit existing = speedLimitRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Speed limit not found"));
        
        existing.setName(speedLimit.getName());
        existing.setDescription(speedLimit.getDescription());
        existing.setAreaType(speedLimit.getAreaType());
        existing.setSpeedLimitKmh(speedLimit.getSpeedLimitKmh());
        existing.setLatitude(speedLimit.getLatitude());
        existing.setLongitude(speedLimit.getLongitude());
        existing.setRadiusMeters(speedLimit.getRadiusMeters());
        existing.setPolygonCoordinates(speedLimit.getPolygonCoordinates());
        existing.setRoadType(speedLimit.getRoadType());
        existing.setTimeRestrictions(speedLimit.getTimeRestrictions());
        existing.setIsActive(speedLimit.getIsActive());
        existing.setUpdatedAt(LocalDateTime.now());
        
        return speedLimitRepository.save(existing);
    }
    
    public void deleteSpeedLimit(UUID id) {
        speedLimitRepository.deleteById(id);
    }
    
    public List<SpeedLimit> findSpeedLimitsNearLocation(BigDecimal latitude, BigDecimal longitude) {
        return speedLimitRepository.findSpeedLimitsNearLocation(latitude, longitude);
    }
    
    // Speed Violation Management
    public Page<SpeedViolation> getAllViolations(Pageable pageable) {
        Page<SpeedViolation> violations = speedViolationRepository.findAll(pageable);
        violations.forEach(this::populateViolationTransientFields);
        return violations;
    }
    
    public Page<SpeedViolation> getUnacknowledgedViolations(Pageable pageable) {
        Page<SpeedViolation> violations = speedViolationRepository.findByIsAcknowledgedFalseOrderByViolationTimeDesc(pageable);
        violations.forEach(this::populateViolationTransientFields);
        return violations;
    }
    
    public Page<SpeedViolation> getViolationsByVehicle(UUID vehicleId, Pageable pageable) {
        Page<SpeedViolation> violations = speedViolationRepository.findByVehicleIdOrderByViolationTimeDesc(vehicleId, pageable);
        violations.forEach(this::populateViolationTransientFields);
        return violations;
    }
    
    public Page<SpeedViolation> getViolationsByDriver(UUID driverId, Pageable pageable) {
        Page<SpeedViolation> violations = speedViolationRepository.findByDriverIdOrderByViolationTimeDesc(driverId, pageable);
        violations.forEach(this::populateViolationTransientFields);
        return violations;
    }
    
    public Page<SpeedViolation> getViolationsBySeverity(SpeedViolation.ViolationSeverity severity, Pageable pageable) {
        Page<SpeedViolation> violations = speedViolationRepository.findByViolationSeverityOrderByViolationTimeDesc(severity, pageable);
        violations.forEach(this::populateViolationTransientFields);
        return violations;
    }
    
    public Page<SpeedViolation> getViolationsByDateRange(LocalDateTime startTime, LocalDateTime endTime, Pageable pageable) {
        Page<SpeedViolation> violations = speedViolationRepository.findByViolationTimeBetween(startTime, endTime, pageable);
        violations.forEach(this::populateViolationTransientFields);
        return violations;
    }
    
    @Transactional
    public SpeedViolation acknowledgeViolation(UUID violationId, String acknowledgedBy, String notes) {
        SpeedViolation violation = speedViolationRepository.findById(violationId)
            .orElseThrow(() -> new RuntimeException("Speed violation not found"));
        
        violation.setIsAcknowledged(true);
        violation.setAcknowledgedBy(acknowledgedBy);
        violation.setAcknowledgedAt(LocalDateTime.now());
        violation.setAcknowledgmentNotes(notes);
        
        SpeedViolation saved = speedViolationRepository.save(violation);
        populateViolationTransientFields(saved);
        return saved;
    }
    
    // Speed History Management
    public Page<SpeedHistory> getSpeedHistory(Pageable pageable) {
        Page<SpeedHistory> history = speedHistoryRepository.findAll(pageable);
        history.forEach(this::populateHistoryTransientFields);
        return history;
    }
    
    public Page<SpeedHistory> getSpeedHistoryByVehicle(UUID vehicleId, Pageable pageable) {
        Page<SpeedHistory> history = speedHistoryRepository.findByVehicleIdOrderByRecordedTimeDesc(vehicleId, pageable);
        history.forEach(this::populateHistoryTransientFields);
        return history;
    }
    
    public Page<SpeedHistory> getSpeedHistoryByDriver(UUID driverId, Pageable pageable) {
        Page<SpeedHistory> history = speedHistoryRepository.findByDriverIdOrderByRecordedTimeDesc(driverId, pageable);
        history.forEach(this::populateHistoryTransientFields);
        return history;
    }
    
    public Page<SpeedHistory> getSpeedViolationHistory(Pageable pageable) {
        Page<SpeedHistory> history = speedHistoryRepository.findByIsViolationTrueOrderByRecordedTimeDesc(pageable);
        history.forEach(this::populateHistoryTransientFields);
        return history;
    }
    
    // Speed Monitoring Logic
    @Transactional
    public void processGpsLocation(GpsLocation gpsLocation) {
        try {
            // Skip processing if speed is null or zero
            if (gpsLocation.getSpeed() == null || gpsLocation.getSpeed().compareTo(BigDecimal.ZERO) <= 0) {
                return;
            }
            
            // Find applicable speed limits for this location
            List<SpeedLimit> applicableSpeedLimits = findSpeedLimitsNearLocation(
                gpsLocation.getLatitude(), 
                gpsLocation.getLongitude()
            );
            
            // Determine the most restrictive speed limit
            SpeedLimit applicableSpeedLimit = applicableSpeedLimits.stream()
                .min((sl1, sl2) -> sl1.getSpeedLimitKmh().compareTo(sl2.getSpeedLimitKmh()))
                .orElse(null);
            
            // Create speed history record
            SpeedHistory speedHistory = new SpeedHistory();
            speedHistory.setVehicle(gpsLocation.getVehicle());
            // Note: Driver will be null since GpsLocation doesn't have driver field
            speedHistory.setDriver(null);
            speedHistory.setGpsLocation(gpsLocation);
            speedHistory.setRecordedTime(gpsLocation.getTimestamp());
            speedHistory.setSpeedKmh(gpsLocation.getSpeed());
            speedHistory.setLatitude(gpsLocation.getLatitude());
            speedHistory.setLongitude(gpsLocation.getLongitude());
            
            if (applicableSpeedLimit != null) {
                speedHistory.setApplicableSpeedLimitKmh(applicableSpeedLimit.getSpeedLimitKmh());
                speedHistory.setRoadType(applicableSpeedLimit.getRoadType());
                
                // Check for speed violation
                BigDecimal speedOverLimit = gpsLocation.getSpeed().subtract(applicableSpeedLimit.getSpeedLimitKmh());
                if (speedOverLimit.compareTo(BigDecimal.ZERO) > 0) {
                    speedHistory.setIsViolation(true);
                    
                    // Create speed violation record
                    SpeedViolation violation = createSpeedViolation(gpsLocation, applicableSpeedLimit, speedOverLimit);
                    speedHistory.setViolation(violation);
                    
                    log.warn("Speed violation detected: Vehicle {} exceeded speed limit by {} km/h", 
                        gpsLocation.getVehicle().getLicensePlate(), speedOverLimit);
                }
            }
            
            speedHistoryRepository.save(speedHistory);
            
        } catch (Exception e) {
            log.error("Error processing GPS location for speed monitoring: {}", e.getMessage(), e);
        }
    }
    
    private SpeedViolation createSpeedViolation(GpsLocation gpsLocation, SpeedLimit speedLimit, BigDecimal speedOverLimit) {
        SpeedViolation violation = new SpeedViolation();
        violation.setVehicle(gpsLocation.getVehicle());
        // Note: Driver will be null since GpsLocation doesn't have driver field
        violation.setDriver(null);
        violation.setGpsLocation(gpsLocation);
        violation.setSpeedLimit(speedLimit);
        violation.setViolationTime(gpsLocation.getTimestamp());
        violation.setRecordedSpeedKmh(gpsLocation.getSpeed());
        violation.setSpeedLimitKmh(speedLimit.getSpeedLimitKmh());
        violation.setSpeedOverLimitKmh(speedOverLimit);
        violation.setLatitude(gpsLocation.getLatitude());
        violation.setLongitude(gpsLocation.getLongitude());
        violation.setLocationDescription(speedLimit.getName());
        
        // Calculate severity and fine
        violation.calculateSeverity();
        violation.calculateFineAndPoints();
        
        return speedViolationRepository.save(violation);
    }
    
    // Report Generation
    @Transactional
    public SpeedReport generateViolationReport(UUID vehicleId, UUID driverId, LocalDate startDate, LocalDate endDate, String generatedBy) {
        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = endDate.atTime(23, 59, 59);
        
        SpeedReport report = new SpeedReport();
        report.setReportType(SpeedReport.ReportType.VIOLATION_SUMMARY);
        report.setStartDate(startDate);
        report.setEndDate(endDate);
        report.setGeneratedBy(generatedBy);
        
        if (vehicleId != null) {
            Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new RuntimeException("Vehicle not found"));
            report.setVehicle(vehicle);
            report.setReportName("Speed Report - " + vehicle.getLicensePlate());
            
            // Get violations for this vehicle
            List<SpeedViolation> violations = speedViolationRepository.findByVehicleIdAndViolationTimeBetween(
                vehicleId, startDateTime, endDateTime);
            
            populateReportStatistics(report, violations);
            
            // Get speed statistics
            BigDecimal avgSpeed = speedHistoryRepository.findAverageSpeedByVehicleAndPeriod(vehicleId, startDateTime, endDateTime);
            BigDecimal maxSpeed = speedHistoryRepository.findMaxSpeedByVehicleAndPeriod(vehicleId, startDateTime, endDateTime);
            
            report.setAverageSpeedKmh(avgSpeed);
            report.setMaxSpeedKmh(maxSpeed);
            
        } else if (driverId != null) {
            Driver driver = driverRepository.findById(driverId)
                .orElseThrow(() -> new RuntimeException("Driver not found"));
            report.setDriver(driver);
            report.setReportName("Speed Report - " + driver.getName());
            
            // Get violations for this driver
            List<SpeedViolation> violations = speedViolationRepository.findByDriverIdAndViolationTimeBetween(
                driverId, startDateTime, endDateTime);
            
            populateReportStatistics(report, violations);
            
            // Get speed statistics
            BigDecimal avgSpeed = speedHistoryRepository.findAverageSpeedByDriverAndPeriod(driverId, startDateTime, endDateTime);
            BigDecimal maxSpeed = speedHistoryRepository.findMaxSpeedByDriverAndPeriod(driverId, startDateTime, endDateTime);
            
            report.setAverageSpeedKmh(avgSpeed);
            report.setMaxSpeedKmh(maxSpeed);
        }
        
        return speedReportRepository.save(report);
    }
    
    private void populateReportStatistics(SpeedReport report, List<SpeedViolation> violations) {
        report.setTotalViolations(violations.size());
        
        int minor = 0, major = 0, severe = 0;
        BigDecimal totalFines = BigDecimal.ZERO;
        int totalPoints = 0;
        
        for (SpeedViolation violation : violations) {
            switch (violation.getViolationSeverity()) {
                case MINOR -> minor++;
                case MAJOR -> major++;
                case SEVERE -> severe++;
            }
            
            if (violation.getFineAmount() != null) {
                totalFines = totalFines.add(violation.getFineAmount());
            }
            if (violation.getPointsDeducted() != null) {
                totalPoints += violation.getPointsDeducted();
            }
        }
        
        report.setMinorViolations(minor);
        report.setMajorViolations(major);
        report.setSevereViolations(severe);
        report.setTotalFineAmount(totalFines);
        report.setTotalPointsDeducted(totalPoints);
    }
    
    // Helper methods
    private void populateViolationTransientFields(SpeedViolation violation) {
        if (violation.getVehicle() != null) {
            violation.setVehicleLicensePlate(violation.getVehicle().getLicensePlate());
        }
        if (violation.getDriver() != null) {
            violation.setDriverName(violation.getDriver().getName());
        }
        if (violation.getSpeedLimit() != null) {
            violation.setSpeedLimitName(violation.getSpeedLimit().getName());
        }
    }
    
    private void populateHistoryTransientFields(SpeedHistory history) {
        if (history.getVehicle() != null) {
            history.setVehicleLicensePlate(history.getVehicle().getLicensePlate());
        }
        if (history.getDriver() != null) {
            history.setDriverName(history.getDriver().getName());
        }
        history.setSpeedOverLimit(history.getSpeedOverLimit());
    }
    
    // Statistics and Analytics
    public Long getViolationCountByVehicle(UUID vehicleId) {
        return speedViolationRepository.countByVehicleId(vehicleId);
    }
    
    public Long getViolationCountByDriver(UUID driverId) {
        return speedViolationRepository.countByDriverId(driverId);
    }
    
    public Long getViolationCountBySeverity(SpeedViolation.ViolationSeverity severity) {
        return speedViolationRepository.countBySeverity(severity);
    }
}