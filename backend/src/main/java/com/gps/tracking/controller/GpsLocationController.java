package com.gps.tracking.controller;

import com.gps.tracking.dto.request.GpsLocationRequest;
import com.gps.tracking.dto.response.GpsLocationResponse;
import com.gps.tracking.exception.ResourceNotFoundException;
import com.gps.tracking.service.GpsLocationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/gps-locations")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class GpsLocationController {
    private final GpsLocationService locationService;

    @PostMapping
    public ResponseEntity<GpsLocationResponse> createLocation(@Valid @RequestBody GpsLocationRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(locationService.createLocation(request));
    }

    @GetMapping("/vehicle/{vehicleId}")
    public ResponseEntity<List<GpsLocationResponse>> getLocationsByVehicle(@PathVariable UUID vehicleId) {
        return ResponseEntity.ok(locationService.getLocationsByVehicle(vehicleId));
    }

    @GetMapping("/vehicle/{vehicleId}/latest")
    public ResponseEntity<GpsLocationResponse> getLatestLocation(@PathVariable UUID vehicleId) {
        try {
            return ResponseEntity.ok(locationService.getLatestLocationByVehicle(vehicleId));
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @GetMapping("/vehicle/{vehicleId}/history")
    public ResponseEntity<List<GpsLocationResponse>> getLocationHistory(
            @PathVariable UUID vehicleId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startTime,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endTime) {
        return ResponseEntity.ok(locationService.getLocationHistory(vehicleId, startTime, endTime));
    }
}



