package com.gps.tracking.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "maintenance_records")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MaintenanceRecord {
    
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicle_id", nullable = false)
    private Vehicle vehicle;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "maintenance_type_id", nullable = false)
    private MaintenanceType maintenanceType;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "maintenance_schedule_id")
    private MaintenanceSchedule maintenanceSchedule;
    
    @Column(name = "service_date", nullable = false)
    private LocalDate serviceDate;
    
    @Column(name = "service_mileage")
    private Integer serviceMileage;
    
    @Column(name = "service_provider")
    private String serviceProvider;
    
    @Column(name = "technician_name")
    private String technicianName;
    
    @Column(name = "labor_cost", precision = 10, scale = 2)
    private BigDecimal laborCost;
    
    @Column(name = "parts_cost", precision = 10, scale = 2)
    private BigDecimal partsCost;
    
    @Column(name = "total_cost", precision = 10, scale = 2)
    private BigDecimal totalCost;
    
    @Column(name = "duration_hours", precision = 5, scale = 2)
    private BigDecimal durationHours;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MaintenanceStatus status = MaintenanceStatus.COMPLETED;
    
    @Enumerated(EnumType.STRING)
    private MaintenancePriority priority = MaintenancePriority.MEDIUM;
    
    @Column(length = 1000)
    private String description;
    
    @Column(length = 1000)
    private String notes;
    
    @Column(name = "next_service_due_date")
    private LocalDate nextServiceDueDate;
    
    @Column(name = "next_service_due_mileage")
    private Integer nextServiceDueMileage;
    
    @Column(name = "warranty_expiry_date")
    private LocalDate warrantyExpiryDate;
    
    @Column(name = "receipt_number")
    private String receiptNumber;
    
    @Column(name = "created_by")
    private String createdBy;
    
    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // Transient fields for API responses
    @Transient
    private String vehicleLicensePlate;
    
    @Transient
    private String maintenanceTypeName;
    
    @Transient
    private String maintenanceCategory;
    
    public enum MaintenanceStatus {
        SCHEDULED,
        IN_PROGRESS,
        COMPLETED,
        CANCELLED,
        POSTPONED
    }
    
    public enum MaintenancePriority {
        LOW,
        MEDIUM,
        HIGH,
        CRITICAL,
        EMERGENCY
    }
    
    // Helper methods
    public void calculateTotalCost() {
        BigDecimal labor = laborCost != null ? laborCost : BigDecimal.ZERO;
        BigDecimal parts = partsCost != null ? partsCost : BigDecimal.ZERO;
        this.totalCost = labor.add(parts);
    }
}