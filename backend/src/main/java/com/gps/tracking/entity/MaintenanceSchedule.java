package com.gps.tracking.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "maintenance_schedules")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MaintenanceSchedule {
    
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicle_id", nullable = false)
    private Vehicle vehicle;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "maintenance_type_id", nullable = false)
    private MaintenanceType maintenanceType;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "schedule_type", nullable = false)
    private ScheduleType scheduleType = ScheduleType.MILEAGE;
    
    @Column(name = "mileage_interval")
    private Integer mileageInterval;
    
    @Column(name = "time_interval_days")
    private Integer timeIntervalDays;
    
    @Column(name = "last_service_date")
    private LocalDate lastServiceDate;
    
    @Column(name = "last_service_mileage")
    private Integer lastServiceMileage;
    
    @Column(name = "next_due_date")
    private LocalDate nextDueDate;
    
    @Column(name = "next_due_mileage")
    private Integer nextDueMileage;
    
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;
    
    @Column(length = 1000)
    private String notes;
    
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
    private Integer daysUntilDue;
    
    @Transient
    private Integer milesUntilDue;
    
    @Transient
    private Boolean isOverdue;
    
    public enum ScheduleType {
        MILEAGE,
        TIME,
        BOTH
    }
    
    // Helper methods
    public Integer getDaysUntilDue() {
        if (nextDueDate != null) {
            return (int) java.time.temporal.ChronoUnit.DAYS.between(LocalDate.now(), nextDueDate);
        }
        return null;
    }
    
    public Integer getMilesUntilDue() {
        // This would need current vehicle mileage to calculate
        // For now, return null - will be calculated in service layer
        return null;
    }
    
    public Boolean getIsOverdue() {
        LocalDate today = LocalDate.now();
        return nextDueDate != null && nextDueDate.isBefore(today);
    }
}