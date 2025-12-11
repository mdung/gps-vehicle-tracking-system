package com.gps.tracking.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "maintenance_types")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MaintenanceType {
    
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;
    
    @Column(nullable = false)
    private String name;
    
    private String description;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MaintenanceCategory category;
    
    @Column(name = "estimated_duration_hours", precision = 5, scale = 2)
    private BigDecimal estimatedDurationHours;
    
    @Column(name = "estimated_cost", precision = 10, scale = 2)
    private BigDecimal estimatedCost;
    
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;
    
    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    public enum MaintenanceCategory {
        ENGINE,
        TRANSMISSION,
        BRAKES,
        TIRES,
        ELECTRICAL,
        COOLING,
        FUEL_SYSTEM,
        EXHAUST,
        SUSPENSION,
        STEERING,
        HVAC,
        BODY,
        INTERIOR,
        INSPECTION,
        PREVENTIVE,
        EMERGENCY
    }
}