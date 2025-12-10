package com.gps.tracking.dto.response;

import com.gps.tracking.entity.GeofenceAlert;
import lombok.Data;
import lombok.Builder;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class GeofenceAlertResponse {
    
    private UUID id;
    private UUID geofenceId;
    private String geofenceName;
    private UUID vehicleId;
    private String vehicleLicensePlate;
    private UUID driverId;
    private String driverName;
    private GeofenceAlert.AlertEventType alertType;
    private GeofenceAlert.AlertSeverity severity;
    private String message;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private BigDecimal speed;
    private Boolean isAcknowledged;
    private String acknowledgedBy;
    private LocalDateTime acknowledgedAt;
    private String notes;
    private LocalDateTime alertTime;
    private LocalDateTime createdAt;
    
    public static GeofenceAlertResponse fromEntity(GeofenceAlert alert) {
        return GeofenceAlertResponse.builder()
                .id(alert.getId())
                .geofenceId(alert.getGeofence().getId())
                .geofenceName(alert.getGeofence().getName())
                .vehicleId(alert.getVehicle().getId())
                .vehicleLicensePlate(alert.getVehicle().getLicensePlate())
                .driverId(alert.getDriver() != null ? alert.getDriver().getId() : null)
                .driverName(alert.getDriver() != null ? alert.getDriver().getName() : null)
                .alertType(alert.getAlertType())
                .severity(alert.getSeverity())
                .message(alert.getMessage())
                .latitude(alert.getLatitude())
                .longitude(alert.getLongitude())
                .speed(alert.getSpeed())
                .isAcknowledged(alert.getIsAcknowledged())
                .acknowledgedBy(alert.getAcknowledgedBy())
                .acknowledgedAt(alert.getAcknowledgedAt())
                .notes(alert.getNotes())
                .alertTime(alert.getAlertTime())
                .createdAt(alert.getCreatedAt())
                .build();
    }
}