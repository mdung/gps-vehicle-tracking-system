package com.gps.tracking.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VehicleResponse {
    private UUID id;
    private String licensePlate;
    private String model;
    private String vehicleType;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}



