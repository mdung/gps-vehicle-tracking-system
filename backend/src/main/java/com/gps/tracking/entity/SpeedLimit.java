package com.gps.tracking.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "speed_limits")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SpeedLimit {
    
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;
    
    @Column(nullable = false)
    private String name;
    
    private String description;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "area_type", nullable = false)
    private AreaType areaType = AreaType.GENERAL;
    
    @Column(name = "speed_limit_kmh", nullable = false, precision = 5, scale = 2)
    private BigDecimal speedLimitKmh;
    
    @Column(precision = 10, scale = 8)
    private BigDecimal latitude;
    
    @Column(precision = 11, scale = 8)
    private BigDecimal longitude;
    
    @Column(name = "radius_meters", precision = 8, scale = 2)
    private BigDecimal radiusMeters;
    
    @Column(name = "polygon_coordinates", columnDefinition = "TEXT")
    private String polygonCoordinates;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "road_type")
    private RoadType roadType = RoadType.CITY_STREET;
    
    @Column(name = "time_restrictions")
    private String timeRestrictions;
    
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;
    
    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    public enum AreaType {
        GENERAL,
        BUSINESS_DISTRICT,
        RESIDENTIAL,
        SCHOOL_ZONE,
        HIGHWAY,
        CONSTRUCTION_ZONE,
        HOSPITAL_ZONE,
        INDUSTRIAL
    }
    
    public enum RoadType {
        CITY_STREET,
        HIGHWAY,
        RESIDENTIAL,
        SCHOOL_ZONE,
        CONSTRUCTION_ZONE,
        PARKING_LOT,
        PRIVATE_ROAD
    }
}