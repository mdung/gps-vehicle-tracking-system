package com.gps.tracking.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "speed_violations")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SpeedViolation {
    
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicle_id")
    private Vehicle vehicle;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "driver_id")
    private Driver driver;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "gps_location_id")
    private GpsLocation gpsLocation;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "speed_limit_id")
    private SpeedLimit speedLimit;
    
    @Column(name = "violation_time", nullable = false)
    private LocalDateTime violationTime;
    
    @Column(name = "recorded_speed_kmh", nullable = false, precision = 5, scale = 2)
    private BigDecimal recordedSpeedKmh;
    
    @Column(name = "speed_limit_kmh", nullable = false, precision = 5, scale = 2)
    private BigDecimal speedLimitKmh;
    
    @Column(name = "speed_over_limit_kmh", nullable = false, precision = 5, scale = 2)
    private BigDecimal speedOverLimitKmh;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "violation_severity", nullable = false)
    private ViolationSeverity violationSeverity = ViolationSeverity.MINOR;
    
    @Column(nullable = false, precision = 10, scale = 8)
    private BigDecimal latitude;
    
    @Column(nullable = false, precision = 11, scale = 8)
    private BigDecimal longitude;
    
    @Column(name = "location_description")
    private String locationDescription;
    
    @Column(name = "weather_conditions")
    private String weatherConditions;
    
    @Column(name = "road_conditions")
    private String roadConditions;
    
    @Column(name = "is_acknowledged", nullable = false)
    private Boolean isAcknowledged = false;
    
    @Column(name = "acknowledged_by")
    private String acknowledgedBy;
    
    @Column(name = "acknowledged_at")
    private LocalDateTime acknowledgedAt;
    
    @Column(name = "acknowledgment_notes", length = 1000)
    private String acknowledgmentNotes;
    
    @Column(name = "fine_amount", precision = 10, scale = 2)
    private BigDecimal fineAmount;
    
    @Column(name = "points_deducted")
    private Integer pointsDeducted = 0;
    
    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    // Transient fields for API responses
    @Transient
    private String vehicleLicensePlate;
    
    @Transient
    private String driverName;
    
    @Transient
    private String speedLimitName;
    
    public enum ViolationSeverity {
        MINOR,      // 1-15 km/h over limit
        MAJOR,      // 16-30 km/h over limit
        SEVERE,     // 31+ km/h over limit or school zone violations
        CRITICAL    // Extreme violations or repeat offenses
    }
    
    // Helper methods
    public void calculateSeverity() {
        if (speedOverLimitKmh == null) return;
        
        double overLimit = speedOverLimitKmh.doubleValue();
        
        // Special handling for school zones
        if (speedLimit != null && speedLimit.getAreaType() == SpeedLimit.AreaType.SCHOOL_ZONE) {
            if (overLimit > 10) {
                this.violationSeverity = ViolationSeverity.SEVERE;
            } else if (overLimit > 5) {
                this.violationSeverity = ViolationSeverity.MAJOR;
            } else {
                this.violationSeverity = ViolationSeverity.MINOR;
            }
        } else {
            // Standard severity calculation
            if (overLimit > 30) {
                this.violationSeverity = ViolationSeverity.SEVERE;
            } else if (overLimit > 15) {
                this.violationSeverity = ViolationSeverity.MAJOR;
            } else {
                this.violationSeverity = ViolationSeverity.MINOR;
            }
        }
    }
    
    public void calculateFineAndPoints() {
        if (violationSeverity == null) calculateSeverity();
        
        switch (violationSeverity) {
            case MINOR:
                this.fineAmount = new BigDecimal("50.00");
                this.pointsDeducted = 1;
                break;
            case MAJOR:
                this.fineAmount = new BigDecimal("150.00");
                this.pointsDeducted = 3;
                break;
            case SEVERE:
                this.fineAmount = new BigDecimal("300.00");
                this.pointsDeducted = 6;
                break;
            case CRITICAL:
                this.fineAmount = new BigDecimal("500.00");
                this.pointsDeducted = 12;
                break;
        }
    }
}