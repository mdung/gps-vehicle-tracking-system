package com.gps.tracking.dto.request;

import com.gps.tracking.entity.FuelRecord;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class FuelRecordRequest {
    
    @NotNull(message = "Vehicle ID is required")
    private UUID vehicleId;
    
    private UUID driverId;
    
    @NotNull(message = "Fuel amount is required")
    @DecimalMin(value = "0.001", message = "Fuel amount must be greater than 0")
    @Digits(integer = 7, fraction = 3, message = "Invalid fuel amount format")
    private BigDecimal fuelAmountLiters;
    
    @NotNull(message = "Fuel cost is required")
    @DecimalMin(value = "0.01", message = "Fuel cost must be greater than 0")
    @Digits(integer = 8, fraction = 2, message = "Invalid fuel cost format")
    private BigDecimal fuelCost;
    
    @NotNull(message = "Cost per liter is required")
    @DecimalMin(value = "0.001", message = "Cost per liter must be greater than 0")
    @Digits(integer = 7, fraction = 3, message = "Invalid cost per liter format")
    private BigDecimal costPerLiter;
    
    @DecimalMin(value = "0", message = "Odometer reading must be non-negative")
    @Digits(integer = 8, fraction = 2, message = "Invalid odometer reading format")
    private BigDecimal odometerReading;
    
    @Size(max = 100, message = "Fuel station name must not exceed 100 characters")
    private String fuelStation;
    
    @Size(max = 50, message = "Fuel type must not exceed 50 characters")
    private String fuelType;
    
    @NotNull(message = "Record type is required")
    private FuelRecord.FuelRecordType recordType;
    
    @Size(max = 500, message = "Notes must not exceed 500 characters")
    private String notes;
    
    @NotNull(message = "Refuel date is required")
    private LocalDateTime refuelDate;
}