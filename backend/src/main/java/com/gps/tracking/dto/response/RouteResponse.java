package com.gps.tracking.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RouteResponse {
    private UUID id;
    private UUID vehicleId;
    private String vehicleLicensePlate;
    private UUID driverId;
    private String driverName;
    private UUID startLocationId;
    private UUID endLocationId;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private BigDecimal distanceKm;
    private String status;
}



