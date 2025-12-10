package com.gps.tracking.dto.response;

import lombok.Data;
import lombok.Builder;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Data
@Builder
public class FuelReportResponse {
    
    private LocalDate reportPeriodStart;
    private LocalDate reportPeriodEnd;
    private FuelSummary summary;
    private List<VehicleFuelStats> vehicleStats;
    private List<DriverFuelStats> driverStats;
    private List<FuelEfficiencyResponse> efficiencyData;
    private List<InefficiencyAlert> inefficiencyAlerts;
    
    @Data
    @Builder
    public static class FuelSummary {
        private BigDecimal totalFuelConsumed;
        private BigDecimal totalFuelCost;
        private BigDecimal averageFuelEfficiency;
        private BigDecimal averageCostPerLiter;
        private BigDecimal averageCostPerKm;
        private Integer totalRefuels;
        private Integer activeVehicles;
    }
    
    @Data
    @Builder
    public static class VehicleFuelStats {
        private UUID vehicleId;
        private String licensePlate;
        private String model;
        private BigDecimal totalFuelConsumed;
        private BigDecimal totalFuelCost;
        private BigDecimal fuelEfficiency;
        private BigDecimal costPerKm;
        private Integer refuelCount;
        private BigDecimal totalDistance;
    }
    
    @Data
    @Builder
    public static class DriverFuelStats {
        private UUID driverId;
        private String name;
        private BigDecimal totalFuelConsumed;
        private BigDecimal totalFuelCost;
        private BigDecimal averageFuelEfficiency;
        private BigDecimal costPerKm;
        private Integer refuelCount;
        private BigDecimal totalDistance;
    }
    
    @Data
    @Builder
    public static class InefficiencyAlert {
        private UUID vehicleId;
        private String licensePlate;
        private UUID driverId;
        private String driverName;
        private String alertType;
        private String description;
        private BigDecimal currentValue;
        private BigDecimal benchmarkValue;
        private String severity;
    }
}