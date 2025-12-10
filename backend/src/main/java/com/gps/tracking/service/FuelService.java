package com.gps.tracking.service;

import com.gps.tracking.dto.request.FuelRecordRequest;
import com.gps.tracking.dto.response.FuelRecordResponse;
import com.gps.tracking.dto.response.FuelEfficiencyResponse;
import com.gps.tracking.dto.response.FuelReportResponse;
import com.gps.tracking.entity.*;
import com.gps.tracking.exception.ResourceNotFoundException;
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
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class FuelService {
    
    private final FuelRecordRepository fuelRecordRepository;
    private final FuelEfficiencyRepository fuelEfficiencyRepository;
    private final VehicleRepository vehicleRepository;
    private final DriverRepository driverRepository;
    private final RouteRepository routeRepository;
    
    @Transactional
    public FuelRecordResponse createFuelRecord(FuelRecordRequest request) {
        Vehicle vehicle = vehicleRepository.findById(request.getVehicleId())
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found"));
        
        Driver driver = null;
        if (request.getDriverId() != null) {
            driver = driverRepository.findById(request.getDriverId())
                    .orElseThrow(() -> new ResourceNotFoundException("Driver not found"));
        }
        
        FuelRecord fuelRecord = FuelRecord.builder()
                .vehicle(vehicle)
                .driver(driver)
                .fuelAmountLiters(request.getFuelAmountLiters())
                .fuelCost(request.getFuelCost())
                .costPerLiter(request.getCostPerLiter())
                .odometerReading(request.getOdometerReading())
                .fuelStation(request.getFuelStation())
                .fuelType(request.getFuelType())
                .recordType(request.getRecordType())
                .notes(request.getNotes())
                .refuelDate(request.getRefuelDate())
                .build();
        
        fuelRecord = fuelRecordRepository.save(fuelRecord);
        log.info("Created fuel record for vehicle: {}", vehicle.getLicensePlate());
        
        return FuelRecordResponse.fromEntity(fuelRecord);
    }
    
    public Page<FuelRecordResponse> getFuelRecordsByVehicle(UUID vehicleId, Pageable pageable) {
        return fuelRecordRepository.findByVehicleIdOrderByRefuelDateDesc(vehicleId, pageable)
                .map(FuelRecordResponse::fromEntity);
    }
    
    public Page<FuelRecordResponse> getFuelRecordsByDriver(UUID driverId, Pageable pageable) {
        return fuelRecordRepository.findByDriverIdOrderByRefuelDateDesc(driverId, pageable)
                .map(FuelRecordResponse::fromEntity);
    }
    
    public Page<FuelRecordResponse> getAllFuelRecords(Pageable pageable) {
        try {
            log.info("Attempting to fetch fuel records...");
            Page<FuelRecord> fuelRecords = fuelRecordRepository.findAll(pageable);
            log.info("Successfully fetched {} fuel records", fuelRecords.getTotalElements());
            return fuelRecords.map(FuelRecordResponse::fromEntity);
        } catch (Exception e) {
            log.error("Error fetching fuel records: {}", e.getMessage(), e);
            // Return empty page if there's an error (e.g., table doesn't exist)
            return Page.empty(pageable);
        }
    }
    
    @Transactional
    public FuelEfficiencyResponse calculateFuelEfficiency(UUID vehicleId, LocalDate startDate, LocalDate endDate) {
        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found"));
        
        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = endDate.atTime(23, 59, 59);
        
        // Get fuel records for the period
        List<FuelRecord> fuelRecords = fuelRecordRepository
                .findByVehicleIdAndRefuelDateBetweenOrderByRefuelDateDesc(vehicleId, startDateTime, endDateTime);
        
        if (fuelRecords.isEmpty()) {
            throw new ResourceNotFoundException("No fuel records found for the specified period");
        }
        
        // Calculate total fuel consumed and cost
        BigDecimal totalFuelConsumed = fuelRecords.stream()
                .map(FuelRecord::getFuelAmountLiters)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        BigDecimal totalFuelCost = fuelRecords.stream()
                .map(FuelRecord::getFuelCost)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        // Calculate total distance from routes
        BigDecimal totalDistance = routeRepository.getTotalDistanceByVehicleAndDateRange(
                vehicleId, startDateTime, endDateTime);
        
        if (totalDistance == null || totalDistance.compareTo(BigDecimal.ZERO) <= 0) {
            totalDistance = BigDecimal.ZERO;
        }
        
        // Calculate efficiency metrics
        BigDecimal fuelEfficiency = BigDecimal.ZERO;
        BigDecimal costPerKm = BigDecimal.ZERO;
        
        if (totalDistance.compareTo(BigDecimal.ZERO) > 0) {
            fuelEfficiency = totalDistance.divide(totalFuelConsumed, 3, RoundingMode.HALF_UP);
            costPerKm = totalFuelCost.divide(totalDistance, 3, RoundingMode.HALF_UP);
        }
        
        BigDecimal averageCostPerLiter = totalFuelCost.divide(totalFuelConsumed, 3, RoundingMode.HALF_UP);
        
        // Check if efficiency record already exists
        FuelEfficiency.CalculationPeriod period = determinePeriod(startDate, endDate);
        FuelEfficiency existingEfficiency = fuelEfficiencyRepository
                .findByVehicleIdAndPeriodStartAndPeriodEndAndCalculationPeriod(
                        vehicleId, startDate, endDate, period)
                .orElse(null);
        
        FuelEfficiency fuelEfficiencyEntity;
        if (existingEfficiency != null) {
            // Update existing record
            existingEfficiency.setTotalDistanceKm(totalDistance);
            existingEfficiency.setTotalFuelConsumedLiters(totalFuelConsumed);
            existingEfficiency.setFuelEfficiencyKmPerLiter(fuelEfficiency);
            existingEfficiency.setTotalFuelCost(totalFuelCost);
            existingEfficiency.setCostPerKm(costPerKm);
            existingEfficiency.setNumberOfRefuels(fuelRecords.size());
            existingEfficiency.setAverageCostPerLiter(averageCostPerLiter);
            fuelEfficiencyEntity = fuelEfficiencyRepository.save(existingEfficiency);
        } else {
            // Create new record
            fuelEfficiencyEntity = FuelEfficiency.builder()
                    .vehicle(vehicle)
                    .periodStart(startDate)
                    .periodEnd(endDate)
                    .totalDistanceKm(totalDistance)
                    .totalFuelConsumedLiters(totalFuelConsumed)
                    .fuelEfficiencyKmPerLiter(fuelEfficiency)
                    .totalFuelCost(totalFuelCost)
                    .costPerKm(costPerKm)
                    .numberOfRefuels(fuelRecords.size())
                    .averageCostPerLiter(averageCostPerLiter)
                    .calculationPeriod(period)
                    .build();
            fuelEfficiencyEntity = fuelEfficiencyRepository.save(fuelEfficiencyEntity);
        }
        
        log.info("Calculated fuel efficiency for vehicle: {} - {} km/L", 
                vehicle.getLicensePlate(), fuelEfficiency);
        
        return FuelEfficiencyResponse.fromEntity(fuelEfficiencyEntity);
    }
    
    public FuelReportResponse generateFuelReport(LocalDate startDate, LocalDate endDate) {
        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = endDate.atTime(23, 59, 59);
        
        // Get all fuel records for the period
        List<FuelRecord> allFuelRecords = fuelRecordRepository.findAllByDateRange(startDateTime, endDateTime);
        
        // Calculate summary
        FuelReportResponse.FuelSummary summary = calculateSummary(allFuelRecords, startDate, endDate);
        
        // Get vehicle stats
        List<FuelReportResponse.VehicleFuelStats> vehicleStats = calculateVehicleStats(startDate, endDate);
        
        // Get driver stats
        List<FuelReportResponse.DriverFuelStats> driverStats = calculateDriverStats(startDate, endDate);
        
        // Get efficiency data
        List<FuelEfficiencyResponse> efficiencyData = fuelEfficiencyRepository
                .findLeastEfficientVehicles(startDate, endDate)
                .stream()
                .map(FuelEfficiencyResponse::fromEntity)
                .collect(Collectors.toList());
        
        // Generate inefficiency alerts
        List<FuelReportResponse.InefficiencyAlert> alerts = generateInefficiencyAlerts(startDate, endDate);
        
        return FuelReportResponse.builder()
                .reportPeriodStart(startDate)
                .reportPeriodEnd(endDate)
                .summary(summary)
                .vehicleStats(vehicleStats)
                .driverStats(driverStats)
                .efficiencyData(efficiencyData)
                .inefficiencyAlerts(alerts)
                .build();
    }
    
    private FuelEfficiency.CalculationPeriod determinePeriod(LocalDate startDate, LocalDate endDate) {
        long daysBetween = java.time.temporal.ChronoUnit.DAYS.between(startDate, endDate);
        
        if (daysBetween <= 1) return FuelEfficiency.CalculationPeriod.DAILY;
        if (daysBetween <= 7) return FuelEfficiency.CalculationPeriod.WEEKLY;
        if (daysBetween <= 31) return FuelEfficiency.CalculationPeriod.MONTHLY;
        if (daysBetween <= 92) return FuelEfficiency.CalculationPeriod.QUARTERLY;
        return FuelEfficiency.CalculationPeriod.YEARLY;
    }
    
    private FuelReportResponse.FuelSummary calculateSummary(List<FuelRecord> fuelRecords, LocalDate startDate, LocalDate endDate) {
        if (fuelRecords.isEmpty()) {
            return FuelReportResponse.FuelSummary.builder()
                    .totalFuelConsumed(BigDecimal.ZERO)
                    .totalFuelCost(BigDecimal.ZERO)
                    .averageFuelEfficiency(BigDecimal.ZERO)
                    .averageCostPerLiter(BigDecimal.ZERO)
                    .averageCostPerKm(BigDecimal.ZERO)
                    .totalRefuels(0)
                    .activeVehicles(0)
                    .build();
        }
        
        BigDecimal totalFuelConsumed = fuelRecords.stream()
                .map(FuelRecord::getFuelAmountLiters)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        BigDecimal totalFuelCost = fuelRecords.stream()
                .map(FuelRecord::getFuelCost)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        BigDecimal averageCostPerLiter = totalFuelCost.divide(totalFuelConsumed, 3, RoundingMode.HALF_UP);
        
        // Get average efficiency from efficiency records
        BigDecimal averageEfficiency = fuelEfficiencyRepository
                .getAverageEfficiencyByPeriod(FuelEfficiency.CalculationPeriod.MONTHLY, startDate, endDate);
        
        if (averageEfficiency == null) {
            averageEfficiency = BigDecimal.ZERO;
        }
        
        long activeVehicles = fuelRecords.stream()
                .map(fr -> fr.getVehicle().getId())
                .distinct()
                .count();
        
        return FuelReportResponse.FuelSummary.builder()
                .totalFuelConsumed(totalFuelConsumed)
                .totalFuelCost(totalFuelCost)
                .averageFuelEfficiency(averageEfficiency)
                .averageCostPerLiter(averageCostPerLiter)
                .averageCostPerKm(BigDecimal.ZERO) // Will be calculated separately
                .totalRefuels(fuelRecords.size())
                .activeVehicles((int) activeVehicles)
                .build();
    }
    
    private List<FuelReportResponse.VehicleFuelStats> calculateVehicleStats(LocalDate startDate, LocalDate endDate) {
        // Implementation for vehicle statistics calculation
        return new ArrayList<>();
    }
    
    private List<FuelReportResponse.DriverFuelStats> calculateDriverStats(LocalDate startDate, LocalDate endDate) {
        // Implementation for driver statistics calculation
        return new ArrayList<>();
    }
    
    private List<FuelReportResponse.InefficiencyAlert> generateInefficiencyAlerts(LocalDate startDate, LocalDate endDate) {
        // Implementation for generating inefficiency alerts
        return new ArrayList<>();
    }
}