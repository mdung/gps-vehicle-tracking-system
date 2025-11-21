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
public class GpsLocationResponse {
    private UUID id;
    private UUID vehicleId;
    private String vehicleLicensePlate;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private BigDecimal speed;
    private BigDecimal direction;
    private LocalDateTime timestamp;
    private LocalDateTime createdAt;
}



