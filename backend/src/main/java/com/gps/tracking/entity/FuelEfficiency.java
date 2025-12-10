package com.gps.tracking.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "fuel_efficiency")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FuelEfficiency {
    
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicle_id", nullable = false)
    private Vehicle vehicle;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "driver_id")
    private Driver driver;
    
    @Column(name = "period_start", nullable = false)
    private LocalDate periodStart;
    
    @Column(name = "period_end", nullable = false)
    private LocalDate periodEnd;
    
    @Column(name = "total_distance_km", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalDistanceKm;
    
    @Column(name = "total_fuel_consumed_liters", nullable = false, precision = 10, scale = 3)
    private BigDecimal totalFuelConsumedLiters;
    
    @Column(name = "fuel_efficiency_km_per_liter", nullable = false, precision = 10, scale = 3)
    private BigDecimal fuelEfficiencyKmPerLiter;
    
    @Column(name = "total_fuel_cost", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalFuelCost;
    
    @Column(name = "cost_per_km", nullable = false, precision = 10, scale = 3)
    private BigDecimal costPerKm;
    
    @Column(name = "number_of_refuels", nullable = false)
    private Integer numberOfRefuels;
    
    @Column(name = "average_cost_per_liter", precision = 10, scale = 3)
    private BigDecimal averageCostPerLiter;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "calculation_period", nullable = false)
    private CalculationPeriod calculationPeriod;
    
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
    
    public enum CalculationPeriod {
        DAILY,
        WEEKLY,
        MONTHLY,
        QUARTERLY,
        YEARLY
    }
}