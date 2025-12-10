package com.gps.tracking.dto.response;

import com.gps.tracking.entity.FuelRecord;
import lombok.Data;
import lombok.Builder;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class FuelRecordResponse {
    
    private UUID id;
    private UUID vehicleId;
    private String vehicleLicensePlate;
    private String vehicleModel;
    private UUID driverId;
    private String driverName;
    private BigDecimal fuelAmountLiters;
    private BigDecimal fuelCost;
    private BigDecimal costPerLiter;
    private BigDecimal odometerReading;
    private String fuelStation;
    private String fuelType;
    private FuelRecord.FuelRecordType recordType;
    private String notes;
    private LocalDateTime refuelDate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    public static FuelRecordResponse fromEntity(FuelRecord fuelRecord) {
        return FuelRecordResponse.builder()
                .id(fuelRecord.getId())
                .vehicleId(fuelRecord.getVehicle().getId())
                .vehicleLicensePlate(fuelRecord.getVehicle().getLicensePlate())
                .vehicleModel(fuelRecord.getVehicle().getModel())
                .driverId(fuelRecord.getDriver() != null ? fuelRecord.getDriver().getId() : null)
                .driverName(fuelRecord.getDriver() != null ? fuelRecord.getDriver().getName() : null)
                .fuelAmountLiters(fuelRecord.getFuelAmountLiters())
                .fuelCost(fuelRecord.getFuelCost())
                .costPerLiter(fuelRecord.getCostPerLiter())
                .odometerReading(fuelRecord.getOdometerReading())
                .fuelStation(fuelRecord.getFuelStation())
                .fuelType(fuelRecord.getFuelType())
                .recordType(fuelRecord.getRecordType())
                .notes(fuelRecord.getNotes())
                .refuelDate(fuelRecord.getRefuelDate())
                .createdAt(fuelRecord.getCreatedAt())
                .updatedAt(fuelRecord.getUpdatedAt())
                .build();
    }
}