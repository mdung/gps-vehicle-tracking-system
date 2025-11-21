package com.gps.tracking.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AssignmentResponse {
    private UUID id;
    private UUID vehicleId;
    private String vehicleLicensePlate;
    private UUID driverId;
    private String driverName;
    private LocalDateTime assignedAt;
    private LocalDateTime unassignedAt;
    private Boolean isActive;
}



