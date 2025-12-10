package com.gps.tracking.dto.response;

import com.gps.tracking.entity.Geofence;
import lombok.Data;
import lombok.Builder;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class GeofenceResponse {
    
    private UUID id;
    private String name;
    private String description;
    private Geofence.GeofenceType type;
    private Geofence.GeofenceShape shape;
    private BigDecimal centerLatitude;
    private BigDecimal centerLongitude;
    private Integer radiusMeters;
    private String polygonCoordinates;
    private Boolean isActive;
    private Geofence.AlertType alertType;
    private Integer bufferTimeMinutes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Long assignedVehicleCount;
    
    public static GeofenceResponse fromEntity(Geofence geofence) {
        return GeofenceResponse.builder()
                .id(geofence.getId())
                .name(geofence.getName())
                .description(geofence.getDescription())
                .type(geofence.getType())
                .shape(geofence.getShape())
                .centerLatitude(geofence.getCenterLatitude())
                .centerLongitude(geofence.getCenterLongitude())
                .radiusMeters(geofence.getRadiusMeters())
                .polygonCoordinates(geofence.getPolygonCoordinates())
                .isActive(geofence.getIsActive())
                .alertType(geofence.getAlertType())
                .bufferTimeMinutes(geofence.getBufferTimeMinutes())
                .createdAt(geofence.getCreatedAt())
                .updatedAt(geofence.getUpdatedAt())
                .build();
    }
    
    public static GeofenceResponse fromEntityWithCount(Geofence geofence, Long vehicleCount) {
        GeofenceResponse response = fromEntity(geofence);
        response.setAssignedVehicleCount(vehicleCount);
        return response;
    }
}