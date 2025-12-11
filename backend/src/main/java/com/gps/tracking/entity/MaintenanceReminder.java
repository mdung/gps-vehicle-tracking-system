package com.gps.tracking.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "maintenance_reminders")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MaintenanceReminder {
    
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicle_id", nullable = false)
    private Vehicle vehicle;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "maintenance_schedule_id", nullable = false)
    private MaintenanceSchedule maintenanceSchedule;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "reminder_type", nullable = false)
    private ReminderType reminderType = ReminderType.DUE_SOON;
    
    @Column(name = "reminder_date", nullable = false)
    private LocalDate reminderDate;
    
    @Column(name = "due_date", nullable = false)
    private LocalDate dueDate;
    
    @Column(name = "due_mileage")
    private Integer dueMileage;
    
    @Column(name = "current_mileage")
    private Integer currentMileage;
    
    @Column(name = "days_overdue")
    private Integer daysOverdue = 0;
    
    @Column(name = "mileage_overdue")
    private Integer mileageOverdue = 0;
    
    @Column(name = "is_acknowledged", nullable = false)
    private Boolean isAcknowledged = false;
    
    @Column(name = "acknowledged_by")
    private String acknowledgedBy;
    
    @Column(name = "acknowledged_at")
    private LocalDateTime acknowledgedAt;
    
    @Column(length = 500)
    private String message;
    
    @Enumerated(EnumType.STRING)
    private MaintenancePriority priority = MaintenancePriority.MEDIUM;
    
    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    // Transient fields for API responses
    @Transient
    private String vehicleLicensePlate;
    
    @Transient
    private String maintenanceTypeName;
    
    @Transient
    private String urgencyLevel;
    
    public enum ReminderType {
        DUE_SOON,
        DUE_TODAY,
        OVERDUE,
        CRITICAL_OVERDUE
    }
    
    public enum MaintenancePriority {
        LOW,
        MEDIUM,
        HIGH,
        CRITICAL,
        EMERGENCY
    }
    
    // Helper methods
    public String getUrgencyLevel() {
        if (daysOverdue != null && daysOverdue > 0) {
            if (daysOverdue > 30) return "CRITICAL";
            if (daysOverdue > 7) return "HIGH";
            return "MEDIUM";
        }
        
        if (dueDate != null) {
            long daysUntilDue = java.time.temporal.ChronoUnit.DAYS.between(LocalDate.now(), dueDate);
            if (daysUntilDue <= 0) return "OVERDUE";
            if (daysUntilDue <= 3) return "HIGH";
            if (daysUntilDue <= 7) return "MEDIUM";
        }
        
        return "LOW";
    }
}