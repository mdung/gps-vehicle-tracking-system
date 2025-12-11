package com.gps.tracking.dto.response;

import com.gps.tracking.entity.OptimizedRoute;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
public class OptimizedRouteResponse {
    
    private UUID id;
    private String name;
    private String description;
    private UUID vehicleId;
    private String vehicleLicensePlate;
    private UUID driverId;
    private String driverName;
    private OptimizedRoute.RouteStatus status;
    private OptimizedRoute.OptimizationType optimizationType;
    private String routeCoordinates;
    private BigDecimal totalDistanceKm;
    private BigDecimal estimatedDurationHours;
    private BigDecimal estimatedFuelCost;
    private BigDecimal actualDistanceKm;
    private BigDecimal actualDurationHours;
    private BigDecimal actualFuelCost;
    private BigDecimal efficiencyScore;
    private LocalDateTime plannedStartTime;
    private LocalDateTime plannedEndTime;
    private LocalDateTime actualStartTime;
    private LocalDateTime actualEndTime;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<RouteStopResponse> stops;
    private RouteAnalytics analytics;
    
    @Data
    @Builder
    public static class RouteStopResponse {
        private UUID id;
        private Integer stopOrder;
        private String name;
        private String address;
        private BigDecimal latitude;
        private BigDecimal longitude;
        private String stopType;
        private String status;
        private BigDecimal estimatedServiceTimeMinutes;
        private BigDecimal actualServiceTimeMinutes;
        private LocalDateTime plannedArrivalTime;
        private LocalDateTime plannedDepartureTime;
        private LocalDateTime actualArrivalTime;
        private LocalDateTime actualDepartureTime;
        private Boolean isCompleted;
        private String notes;
    }
    
    @Data
    @Builder
    public static class RouteAnalytics {
        private Integer totalStops;
        private Integer completedStops;
        private BigDecimal completionPercentage;
        private BigDecimal averageDeviationKm;
        private Long totalDeviations;
        private BigDecimal timeVarianceHours;
        private BigDecimal fuelEfficiencyScore;
        private String performanceRating;
    }
    
    public static OptimizedRouteResponse fromEntity(OptimizedRoute route) {
        return OptimizedRouteResponse.builder()
                .id(route.getId())
                .name(route.getName())
                .description(route.getDescription())
                .vehicleId(route.getVehicle() != null ? route.getVehicle().getId() : null)
                .vehicleLicensePlate(route.getVehicle() != null ? route.getVehicle().getLicensePlate() : null)
                .driverId(route.getDriver() != null ? route.getDriver().getId() : null)
                .driverName(route.getDriver() != null ? route.getDriver().getName() : null)
                .status(route.getStatus())
                .optimizationType(route.getOptimizationType())
                .routeCoordinates(route.getRouteCoordinates())
                .totalDistanceKm(route.getTotalDistanceKm())
                .estimatedDurationHours(route.getEstimatedDurationHours())
                .estimatedFuelCost(route.getEstimatedFuelCost())
                .actualDistanceKm(route.getActualDistanceKm())
                .actualDurationHours(route.getActualDurationHours())
                .actualFuelCost(route.getActualFuelCost())
                .efficiencyScore(route.getEfficiencyScore())
                .plannedStartTime(route.getPlannedStartTime())
                .plannedEndTime(route.getPlannedEndTime())
                .actualStartTime(route.getActualStartTime())
                .actualEndTime(route.getActualEndTime())
                .createdAt(route.getCreatedAt())
                .updatedAt(route.getUpdatedAt())
                .build();
    }
}