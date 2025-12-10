package com.gps.tracking.dto.response;

import com.gps.tracking.entity.FuelEfficiency;
import lombok.Data;
import lombok.Builder;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class FuelEfficiencyResponse {
    
    private UUID id;
    private UUID vehicleId;
    private String vehicleLicensePlate;
    private String vehicleModel;
    private UUID driverId;
    private String driverName;
    private LocalDate periodStart;
    private LocalDate periodEnd;
    private BigDecimal totalDistanceKm;
    private BigDecimal totalFuelConsumedLiters;
    private BigDecimal fuelEfficiencyKmPerLiter;
    private BigDecimal totalFuelCost;
    private BigDecimal costPerKm;
    private Integer numberOfRefuels;
    private BigDecimal averageCostPerLiter;
    private FuelEfficiency.CalculationPeriod calculationPeriod;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    public static FuelEfficiencyResponse fromEntity(FuelEfficiency fuelEfficiency) {
        return FuelEfficiencyResponse.builder()
                .id(fuelEfficiency.getId())
                .vehicleId(fuelEfficiency.getVehicle().getId())
                .vehicleLicensePlate(fuelEfficiency.getVehicle().getLicensePlate())
                .vehicleModel(fuelEfficiency.getVehicle().getModel())
                .driverId(fuelEfficiency.getDriver() != null ? fuelEfficiency.getDriver().getId() : null)
                .driverName(fuelEfficiency.getDriver() != null ? fuelEfficiency.getDriver().getName() : null)
                .periodStart(fuelEfficiency.getPeriodStart())
                .periodEnd(fuelEfficiency.getPeriodEnd())
                .totalDistanceKm(fuelEfficiency.getTotalDistanceKm())
                .totalFuelConsumedLiters(fuelEfficiency.getTotalFuelConsumedLiters())
                .fuelEfficiencyKmPerLiter(fuelEfficiency.getFuelEfficiencyKmPerLiter())
                .totalFuelCost(fuelEfficiency.getTotalFuelCost())
                .costPerKm(fuelEfficiency.getCostPerKm())
                .numberOfRefuels(fuelEfficiency.getNumberOfRefuels())
                .averageCostPerLiter(fuelEfficiency.getAverageCostPerLiter())
                .calculationPeriod(fuelEfficiency.getCalculationPeriod())
                .createdAt(fuelEfficiency.getCreatedAt())
                .updatedAt(fuelEfficiency.getUpdatedAt())
                .build();
    }
}