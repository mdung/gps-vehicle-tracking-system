package com.gps.tracking.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "geofences")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Geofence {
    
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;
    
    @Column(name = "name", nullable = false)
    private String name;
    
    @Column(name = "description")
    private String description;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false)
    private GeofenceType type;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "shape", nullable = false)
    private GeofenceShape shape;
    
    // For circular geofences
    @Column(name = "center_latitude", precision = 10, scale = 8)
    private BigDecimal centerLatitude;
    
    @Column(name = "center_longitude", precision = 11, scale = 8)
    private BigDecimal centerLongitude;
    
    @Column(name = "radius_meters")
    private Integer radiusMeters;
    
    // For polygon geofences (stored as JSON)
    @Column(name = "polygon_coordinates", columnDefinition = "TEXT")
    private String polygonCoordinates;
    
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "alert_type", nullable = false)
    private AlertType alertType;
    
    @Column(name = "buffer_time_minutes")
    private Integer bufferTimeMinutes = 0;
    
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    public enum GeofenceType {
        AUTHORIZED_AREA,
        RESTRICTED_AREA,
        CUSTOMER_LOCATION,
        DEPOT,
        SERVICE_AREA,
        ROUTE_CHECKPOINT
    }
    
    public enum GeofenceShape {
        CIRCLE,
        POLYGON
    }
    
    public enum AlertType {
        ENTRY_ONLY,
        EXIT_ONLY,
        ENTRY_AND_EXIT,
        UNAUTHORIZED_ENTRY,
        ROUTE_DEVIATION
    }
}