package com.gps.tracking.controller;

import com.gps.tracking.dto.request.GeofenceRequest;
import com.gps.tracking.dto.response.GeofenceResponse;
import com.gps.tracking.dto.response.GeofenceAlertResponse;
import com.gps.tracking.service.GeofencingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.CrossOrigin;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/geofencing")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Tag(name = "Geofencing & Alerts", description = "Geofence management and alert system")
public class GeofencingController {
    
    private final GeofencingService geofencingService;
    
    @PostMapping("/geofences")
    @Operation(summary = "Create geofence", description = "Create a new geofence with virtual boundaries")
    public ResponseEntity<GeofenceResponse> createGeofence(@Valid @RequestBody GeofenceRequest request) {
        GeofenceResponse response = geofencingService.createGeofence(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    
    @GetMapping("/geofences")
    @Operation(summary = "Get all geofences", description = "Get paginated list of all active geofences")
    public ResponseEntity<Page<GeofenceResponse>> getAllGeofences(Pageable pageable) {
        Page<GeofenceResponse> geofences = geofencingService.getAllGeofences(pageable);
        return ResponseEntity.ok(geofences);
    }
    
    @GetMapping("/geofences/{id}")
    @Operation(summary = "Get geofence by ID", description = "Get detailed information about a specific geofence")
    public ResponseEntity<GeofenceResponse> getGeofenceById(
            @Parameter(description = "Geofence ID") @PathVariable UUID id) {
        GeofenceResponse geofence = geofencingService.getGeofenceById(id);
        return ResponseEntity.ok(geofence);
    }
    
    @PutMapping("/geofences/{id}")
    @Operation(summary = "Update geofence", description = "Update an existing geofence")
    public ResponseEntity<GeofenceResponse> updateGeofence(
            @Parameter(description = "Geofence ID") @PathVariable UUID id,
            @Valid @RequestBody GeofenceRequest request) {
        GeofenceResponse response = geofencingService.updateGeofence(id, request);
        return ResponseEntity.ok(response);
    }
    
    @DeleteMapping("/geofences/{id}")
    @Operation(summary = "Delete geofence", description = "Deactivate a geofence")
    public ResponseEntity<Void> deleteGeofence(
            @Parameter(description = "Geofence ID") @PathVariable UUID id) {
        geofencingService.deleteGeofence(id);
        return ResponseEntity.noContent().build();
    }
    
    @PostMapping("/geofences/{geofenceId}/vehicles/{vehicleId}")
    @Operation(summary = "Assign vehicle to geofence", description = "Assign a vehicle to monitor a specific geofence")
    public ResponseEntity<Void> assignVehicleToGeofence(
            @Parameter(description = "Geofence ID") @PathVariable UUID geofenceId,
            @Parameter(description = "Vehicle ID") @PathVariable UUID vehicleId) {
        geofencingService.assignVehicleToGeofence(vehicleId, geofenceId);
        return ResponseEntity.ok().build();
    }
    
    @DeleteMapping("/geofences/{geofenceId}/vehicles/{vehicleId}")
    @Operation(summary = "Unassign vehicle from geofence", description = "Remove vehicle assignment from a geofence")
    public ResponseEntity<Void> unassignVehicleFromGeofence(
            @Parameter(description = "Geofence ID") @PathVariable UUID geofenceId,
            @Parameter(description = "Vehicle ID") @PathVariable UUID vehicleId) {
        geofencingService.unassignVehicleFromGeofence(vehicleId, geofenceId);
        return ResponseEntity.noContent().build();
    }
    
    @GetMapping("/vehicles/{vehicleId}/geofences")
    @Operation(summary = "Get vehicle geofences", description = "Get all geofences assigned to a specific vehicle")
    public ResponseEntity<List<GeofenceResponse>> getVehicleGeofences(
            @Parameter(description = "Vehicle ID") @PathVariable UUID vehicleId) {
        List<GeofenceResponse> geofences = geofencingService.getVehicleGeofences(vehicleId);
        return ResponseEntity.ok(geofences);
    }
    
    @GetMapping("/alerts")
    @Operation(summary = "Get all alerts", description = "Get paginated list of all geofence alerts")
    public ResponseEntity<Page<GeofenceAlertResponse>> getAllAlerts(Pageable pageable) {
        Page<GeofenceAlertResponse> alerts = geofencingService.getAllAlerts(pageable);
        return ResponseEntity.ok(alerts);
    }
    
    @GetMapping("/alerts/unacknowledged")
    @Operation(summary = "Get unacknowledged alerts", description = "Get all alerts that haven't been acknowledged")
    public ResponseEntity<List<GeofenceAlertResponse>> getUnacknowledgedAlerts() {
        List<GeofenceAlertResponse> alerts = geofencingService.getUnacknowledgedAlerts();
        return ResponseEntity.ok(alerts);
    }
    
    @GetMapping("/vehicles/{vehicleId}/alerts")
    @Operation(summary = "Get vehicle alerts", description = "Get all alerts for a specific vehicle")
    public ResponseEntity<Page<GeofenceAlertResponse>> getVehicleAlerts(
            @Parameter(description = "Vehicle ID") @PathVariable UUID vehicleId,
            Pageable pageable) {
        Page<GeofenceAlertResponse> alerts = geofencingService.getVehicleAlerts(vehicleId, pageable);
        return ResponseEntity.ok(alerts);
    }
    
    @PostMapping("/alerts/{alertId}/acknowledge")
    @Operation(summary = "Acknowledge alert", description = "Mark an alert as acknowledged")
    public ResponseEntity<Void> acknowledgeAlert(
            @Parameter(description = "Alert ID") @PathVariable UUID alertId,
            @RequestParam String acknowledgedBy,
            @RequestParam(required = false) String notes) {
        geofencingService.acknowledgeAlert(alertId, acknowledgedBy, notes);
        return ResponseEntity.ok().build();
    }
    
    @GetMapping("/health")
    @Operation(summary = "Health check", description = "Check if geofencing service is working")
    public ResponseEntity<String> healthCheck() {
        return ResponseEntity.ok("Geofencing service is running");
    }
}