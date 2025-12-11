package com.gps.tracking.dto.request;

import com.gps.tracking.entity.OptimizedRoute;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
public class OptimizedRouteRequest {
    
    @NotBlank(message = "Route name is required")
    private String name;
    
    private String description;
    
    @NotNull(message = "Vehicle ID is required")
    private UUID vehicleId;
    
    private UUID driverId;
    
    @NotNull(message = "Optimization type is required")
    private OptimizedRoute.OptimizationType optimizationType;
    
    @NotNull(message = "Route stops are required")
    private List<RouteStopRequest> stops;
    
    private LocalDateTime plannedStartTime;
    
    private BigDecimal estimatedFuelCost;
    
    private String notes;
    
    @Data
    public static class RouteStopRequest {
        @NotBlank(message = "Stop name is required")
        private String name;
        
        private String address;
        
        @NotNull(message = "Latitude is required")
        private BigDecimal latitude;
        
        @NotNull(message = "Longitude is required")
        private BigDecimal longitude;
        
        @NotNull(message = "Stop type is required")
        private String stopType; // Will be converted to enum
        
        private BigDecimal estimatedServiceTimeMinutes;
        
        private LocalDateTime plannedArrivalTime;
        
        private String notes;
    }
}