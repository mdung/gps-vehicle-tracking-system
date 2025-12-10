package com.gps.tracking.dto.request;

import com.gps.tracking.entity.Geofence;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class GeofenceRequest {
    
    @NotBlank(message = "Geofence name is required")
    @Size(max = 100, message = "Name must not exceed 100 characters")
    private String name;
    
    @Size(max = 500, message = "Description must not exceed 500 characters")
    private String description;
    
    @NotNull(message = "Geofence type is required")
    private Geofence.GeofenceType type;
    
    @NotNull(message = "Geofence shape is required")
    private Geofence.GeofenceShape shape;
    
    // For circular geofences
    @DecimalMin(value = "-90.0", message = "Latitude must be between -90 and 90")
    @DecimalMax(value = "90.0", message = "Latitude must be between -90 and 90")
    @Digits(integer = 2, fraction = 8, message = "Invalid latitude format")
    private BigDecimal centerLatitude;
    
    @DecimalMin(value = "-180.0", message = "Longitude must be between -180 and 180")
    @DecimalMax(value = "180.0", message = "Longitude must be between -180 and 180")
    @Digits(integer = 3, fraction = 8, message = "Invalid longitude format")
    private BigDecimal centerLongitude;
    
    @Min(value = 10, message = "Radius must be at least 10 meters")
    @Max(value = 100000, message = "Radius must not exceed 100km")
    private Integer radiusMeters;
    
    // For polygon geofences
    private String polygonCoordinates;
    
    @NotNull(message = "Alert type is required")
    private Geofence.AlertType alertType;
    
    @Min(value = 0, message = "Buffer time must be non-negative")
    @Max(value = 1440, message = "Buffer time must not exceed 24 hours")
    private Integer bufferTimeMinutes = 0;
    
    private Boolean isActive = true;
}