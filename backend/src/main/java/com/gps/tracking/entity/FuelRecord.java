package com.gps.tracking.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "fuel_records")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FuelRecord {
    
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicle_id", nullable = false)
    private Vehicle vehicle;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "driver_id")
    private Driver driver;
    
    @Column(name = "fuel_amount_liters", nullable = false, precision = 10, scale = 3)
    private BigDecimal fuelAmountLiters;
    
    @Column(name = "fuel_cost", nullable = false, precision = 10, scale = 2)
    private BigDecimal fuelCost;
    
    @Column(name = "cost_per_liter", nullable = false, precision = 10, scale = 3)
    private BigDecimal costPerLiter;
    
    @Column(name = "odometer_reading", precision = 10, scale = 2)
    private BigDecimal odometerReading;
    
    @Column(name = "fuel_station")
    private String fuelStation;
    
    @Column(name = "fuel_type")
    private String fuelType;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "record_type", nullable = false)
    private FuelRecordType recordType;
    
    @Column(name = "notes")
    private String notes;
    
    @Column(name = "refuel_date", nullable = false)
    private LocalDateTime refuelDate;
    
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    public enum FuelRecordType {
        REFUEL,
        CONSUMPTION_CALCULATION,
        MAINTENANCE
    }
}