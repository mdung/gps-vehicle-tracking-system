package com.gps.tracking.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "optimized_routes")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OptimizedRoute {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @Column(nullable = false)
    private String name;
    
    @Column(length = 500)
    private String description;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicle_id")
    private Vehicle vehicle;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "driver_id")
    private Driver driver;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RouteStatus status;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OptimizationType optimizationType;
    
    // Route coordinates as JSON string
    @Column(columnDefinition = "TEXT")
    private String routeCoordinates;
    
    // Waypoints/stops as JSON string
    @Column(columnDefinition = "TEXT")
    private String waypoints;
    
    @Column(precision = 10, scale = 2)
    private BigDecimal totalDistanceKm;
    
    @Column(precision = 8, scale = 2)
    private BigDecimal estimatedDurationHours;
    
    @Column(precision = 10, scale = 2)
    private BigDecimal estimatedFuelCost;
    
    @Column(precision = 10, scale = 2)
    private BigDecimal actualDistanceKm;
    
    @Column(precision = 8, scale = 2)
    private BigDecimal actualDurationHours;
    
    @Column(precision = 10, scale = 2)
    private BigDecimal actualFuelCost;
    
    @Column(precision = 5, scale = 2)
    private BigDecimal efficiencyScore; // 0-100
    
    private LocalDateTime plannedStartTime;
    private LocalDateTime plannedEndTime;
    private LocalDateTime actualStartTime;
    private LocalDateTime actualEndTime;
    
    @Column(nullable = false)
    private Boolean isActive = true;
    
    @CreationTimestamp
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    private LocalDateTime updatedAt;
    
    @OneToMany(mappedBy = "optimizedRoute", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<RouteStop> routeStops;
    
    @OneToMany(mappedBy = "optimizedRoute", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<RouteExecution> routeExecutions;
    
    public enum RouteStatus {
        DRAFT,
        PLANNED,
        IN_PROGRESS,
        COMPLETED,
        CANCELLED,
        PAUSED
    }
    
    public enum OptimizationType {
        SHORTEST_DISTANCE,
        FASTEST_TIME,
        FUEL_EFFICIENT,
        BALANCED,
        CUSTOM
    }
}