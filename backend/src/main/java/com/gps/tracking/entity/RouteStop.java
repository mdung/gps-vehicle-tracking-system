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
@Table(name = "route_stops")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RouteStop {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "optimized_route_id", nullable = false)
    private OptimizedRoute optimizedRoute;
    
    @Column(nullable = false)
    private Integer stopOrder;
    
    @Column(nullable = false)
    private String name;
    
    @Column(length = 500)
    private String address;
    
    @Column(nullable = false, precision = 10, scale = 8)
    private BigDecimal latitude;
    
    @Column(nullable = false, precision = 11, scale = 8)
    private BigDecimal longitude;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StopType stopType;
    
    @Column(precision = 8, scale = 2)
    private BigDecimal estimatedServiceTimeMinutes;
    
    @Column(precision = 8, scale = 2)
    private BigDecimal actualServiceTimeMinutes;
    
    private LocalDateTime plannedArrivalTime;
    private LocalDateTime plannedDepartureTime;
    private LocalDateTime actualArrivalTime;
    private LocalDateTime actualDepartureTime;
    
    @Enumerated(EnumType.STRING)
    private StopStatus status;
    
    @Column(length = 1000)
    private String notes;
    
    @Column(nullable = false)
    private Boolean isCompleted = false;
    
    @CreationTimestamp
    private LocalDateTime createdAt;
    
    public enum StopType {
        PICKUP,
        DELIVERY,
        SERVICE,
        WAYPOINT,
        DEPOT,
        CUSTOMER,
        FUEL_STATION,
        REST_STOP
    }
    
    public enum StopStatus {
        PENDING,
        IN_PROGRESS,
        COMPLETED,
        SKIPPED,
        DELAYED
    }
}