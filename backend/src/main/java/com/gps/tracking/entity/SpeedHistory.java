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
@Table(name = "speed_history")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SpeedHistory {
    
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
    
    @Column(name = "recorded_time", nullable = false)
    private LocalDateTime recordedTime;
    
    @Column(name = "speed_kmh", nullable = false, precision = 5, scale = 2)
    private BigDecimal speedKmh;
    
    @Column(nullable = false, precision = 10, scale = 8)
    private BigDecimal latitude;
    
    @Column(nullable = false, precision = 11, scale = 8)
    private BigDecimal longitude;
    
    @Column(name = "applicable_speed_limit_kmh", precision = 5, scale = 2)
    private BigDecimal applicableSpeedLimitKmh;
    
    @Column(name = "is_violation", nullable = false)
    private Boolean isViolation = false;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "violation_id")
    private SpeedViolation violation;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "road_type")
    private SpeedLimit.RoadType roadType;
    
    @Column(name = "weather_conditions")
    private String weatherConditions;
    
    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    // Transient fields for API responses
    @Transient
    private String vehicleLicensePlate;
    
    @Transient
    private String driverName;
    
    @Transient
    private BigDecimal speedOverLimit;
    
    // Helper methods
    public BigDecimal getSpeedOverLimit() {
        if (applicableSpeedLimitKmh != null && speedKmh != null) {
            BigDecimal overLimit = speedKmh.subtract(applicableSpeedLimitKmh);
            return overLimit.compareTo(BigDecimal.ZERO) > 0 ? overLimit : BigDecimal.ZERO;
        }
        return BigDecimal.ZERO;
    }
    
    public boolean isSpeedViolation() {
        return getSpeedOverLimit().compareTo(BigDecimal.ZERO) > 0;
    }
}