package com.gps.tracking.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "route_executions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RouteExecution {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "optimized_route_id", nullable = false)
    private OptimizedRoute optimizedRoute;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "gps_location_id")
    private GpsLocation gpsLocation;
    
    @Column(nullable = false)
    private Integer sequenceNumber;
    
    @Column(nullable = false, precision = 10, scale = 8)
    private BigDecimal latitude;
    
    @Column(nullable = false, precision = 11, scale = 8)
    private BigDecimal longitude;
    
    @Column(precision = 5, scale = 2)
    private BigDecimal speed;
    
    @Column(precision = 5, scale = 2)
    private BigDecimal direction;
    
    @Column(precision = 8, scale = 3)
    private BigDecimal distanceFromPlannedKm;
    
    @Column(precision = 8, scale = 3)
    private BigDecimal cumulativeDistanceKm;
    
    @Column(nullable = false)
    private LocalDateTime timestamp;
    
    @Enumerated(EnumType.STRING)
    private DeviationType deviationType;
    
    @Column(length = 500)
    private String notes;
    
    @CreationTimestamp
    private LocalDateTime createdAt;
    
    public enum DeviationType {
        ON_ROUTE,
        MINOR_DEVIATION,
        MAJOR_DEVIATION,
        OFF_ROUTE,
        TRAFFIC_DETOUR,
        EMERGENCY_DETOUR
    }
}