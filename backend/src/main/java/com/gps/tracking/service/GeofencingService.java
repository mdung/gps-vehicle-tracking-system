package com.gps.tracking.service;

import com.gps.tracking.dto.request.GeofenceRequest;
import com.gps.tracking.dto.response.GeofenceResponse;
import com.gps.tracking.dto.response.GeofenceAlertResponse;
import com.gps.tracking.entity.*;
import com.gps.tracking.exception.ResourceNotFoundException;
import com.gps.tracking.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class GeofencingService {
    
    private final GeofenceRepository geofenceRepository;
    private final GeofenceAlertRepository geofenceAlertRepository;
    private final VehicleGeofenceAssignmentRepository assignmentRepository;
    private final VehicleRepository vehicleRepository;
    private final DriverRepository driverRepository;
    private final GpsLocationRepository gpsLocationRepository;
    
    @Transactional
    public GeofenceResponse createGeofence(GeofenceRequest request) {
        validateGeofenceRequest(request);
        
        Geofence geofence = Geofence.builder()
                .name(request.getName())
                .description(request.getDescription())
                .type(request.getType())
                .shape(request.getShape())
                .centerLatitude(request.getCenterLatitude())
                .centerLongitude(request.getCenterLongitude())
                .radiusMeters(request.getRadiusMeters())
                .polygonCoordinates(request.getPolygonCoordinates())
                .isActive(request.getIsActive())
                .alertType(request.getAlertType())
                .bufferTimeMinutes(request.getBufferTimeMinutes())
                .build();
        
        geofence = geofenceRepository.save(geofence);
        log.info("Created geofence: {}", geofence.getName());
        
        return GeofenceResponse.fromEntity(geofence);
    }
    
    public Page<GeofenceResponse> getAllGeofences(Pageable pageable) {
        return geofenceRepository.findByIsActiveTrueOrderByNameAsc(pageable)
                .map(geofence -> {
                    Long vehicleCount = assignmentRepository.countActiveVehiclesByGeofence(geofence.getId());
                    return GeofenceResponse.fromEntityWithCount(geofence, vehicleCount);
                });
    }
    
    public GeofenceResponse getGeofenceById(UUID id) {
        Geofence geofence = geofenceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Geofence not found"));
        
        Long vehicleCount = assignmentRepository.countActiveVehiclesByGeofence(id);
        return GeofenceResponse.fromEntityWithCount(geofence, vehicleCount);
    }
    
    @Transactional
    public GeofenceResponse updateGeofence(UUID id, GeofenceRequest request) {
        Geofence geofence = geofenceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Geofence not found"));
        
        validateGeofenceRequest(request);
        
        geofence.setName(request.getName());
        geofence.setDescription(request.getDescription());
        geofence.setType(request.getType());
        geofence.setShape(request.getShape());
        geofence.setCenterLatitude(request.getCenterLatitude());
        geofence.setCenterLongitude(request.getCenterLongitude());
        geofence.setRadiusMeters(request.getRadiusMeters());
        geofence.setPolygonCoordinates(request.getPolygonCoordinates());
        geofence.setIsActive(request.getIsActive());
        geofence.setAlertType(request.getAlertType());
        geofence.setBufferTimeMinutes(request.getBufferTimeMinutes());
        
        geofence = geofenceRepository.save(geofence);
        log.info("Updated geofence: {}", geofence.getName());
        
        return GeofenceResponse.fromEntity(geofence);
    }
    
    @Transactional
    public void deleteGeofence(UUID id) {
        Geofence geofence = geofenceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Geofence not found"));
        
        geofence.setIsActive(false);
        geofenceRepository.save(geofence);
        log.info("Deactivated geofence: {}", geofence.getName());
    }
    
    @Transactional
    public void assignVehicleToGeofence(UUID vehicleId, UUID geofenceId) {
        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found"));
        
        Geofence geofence = geofenceRepository.findById(geofenceId)
                .orElseThrow(() -> new ResourceNotFoundException("Geofence not found"));
        
        // Check if assignment already exists
        if (assignmentRepository.findByVehicleIdAndGeofenceIdAndIsActiveTrue(vehicleId, geofenceId).isPresent()) {
            throw new IllegalStateException("Vehicle is already assigned to this geofence");
        }
        
        VehicleGeofenceAssignment assignment = VehicleGeofenceAssignment.builder()
                .vehicle(vehicle)
                .geofence(geofence)
                .isActive(true)
                .build();
        
        assignmentRepository.save(assignment);
        log.info("Assigned vehicle {} to geofence {}", vehicle.getLicensePlate(), geofence.getName());
    }
    
    @Transactional
    public void unassignVehicleFromGeofence(UUID vehicleId, UUID geofenceId) {
        VehicleGeofenceAssignment assignment = assignmentRepository
                .findByVehicleIdAndGeofenceIdAndIsActiveTrue(vehicleId, geofenceId)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found"));
        
        assignment.setIsActive(false);
        assignment.setUnassignedAt(LocalDateTime.now());
        assignmentRepository.save(assignment);
        
        log.info("Unassigned vehicle {} from geofence {}", 
                assignment.getVehicle().getLicensePlate(), 
                assignment.getGeofence().getName());
    }
    
    public List<GeofenceResponse> getVehicleGeofences(UUID vehicleId) {
        List<VehicleGeofenceAssignment> assignments = assignmentRepository
                .findActiveAssignmentsByVehicle(vehicleId);
        
        return assignments.stream()
                .map(assignment -> GeofenceResponse.fromEntity(assignment.getGeofence()))
                .collect(Collectors.toList());
    }
    
    public Page<GeofenceAlertResponse> getAllAlerts(Pageable pageable) {
        return geofenceAlertRepository.findByOrderByAlertTimeDesc(pageable)
                .map(GeofenceAlertResponse::fromEntity);
    }
    
    public Page<GeofenceAlertResponse> getVehicleAlerts(UUID vehicleId, Pageable pageable) {
        return geofenceAlertRepository.findByVehicleIdOrderByAlertTimeDesc(vehicleId, pageable)
                .map(GeofenceAlertResponse::fromEntity);
    }
    
    public List<GeofenceAlertResponse> getUnacknowledgedAlerts() {
        return geofenceAlertRepository.findByIsAcknowledgedFalseOrderByAlertTimeDesc()
                .stream()
                .map(GeofenceAlertResponse::fromEntity)
                .collect(Collectors.toList());
    }
    
    @Transactional
    public void acknowledgeAlert(UUID alertId, String acknowledgedBy, String notes) {
        GeofenceAlert alert = geofenceAlertRepository.findById(alertId)
                .orElseThrow(() -> new ResourceNotFoundException("Alert not found"));
        
        alert.setIsAcknowledged(true);
        alert.setAcknowledgedBy(acknowledgedBy);
        alert.setAcknowledgedAt(LocalDateTime.now());
        alert.setNotes(notes);
        
        geofenceAlertRepository.save(alert);
        log.info("Acknowledged alert {} by {}", alertId, acknowledgedBy);
    }
    
    // Method to check if a point is inside geofences (called by GPS location service)
    public void checkGeofenceViolations(GpsLocation gpsLocation) {
        Vehicle vehicle = gpsLocation.getVehicle();
        Double latitude = gpsLocation.getLatitude().doubleValue();
        Double longitude = gpsLocation.getLongitude().doubleValue();
        
        // Get all geofences that contain this point
        List<Geofence> containingGeofences = geofenceRepository
                .findGeofencesContainingPoint(latitude, longitude);
        
        // Get vehicle's assigned geofences
        List<VehicleGeofenceAssignment> assignments = assignmentRepository
                .findActiveAssignmentsByVehicle(vehicle.getId());
        
        // Check for violations and generate alerts
        for (Geofence geofence : containingGeofences) {
            boolean isAssigned = assignments.stream()
                    .anyMatch(a -> a.getGeofence().getId().equals(geofence.getId()));
            
            if (geofence.getType() == Geofence.GeofenceType.RESTRICTED_AREA && isAssigned) {
                createAlert(geofence, vehicle, gpsLocation, GeofenceAlert.AlertEventType.UNAUTHORIZED_ENTRY,
                           GeofenceAlert.AlertSeverity.HIGH, "Vehicle entered restricted area");
            } else if (geofence.getAlertType() == Geofence.AlertType.ENTRY_ONLY || 
                      geofence.getAlertType() == Geofence.AlertType.ENTRY_AND_EXIT) {
                createAlert(geofence, vehicle, gpsLocation, GeofenceAlert.AlertEventType.ENTRY,
                           GeofenceAlert.AlertSeverity.MEDIUM, "Vehicle entered geofence");
            }
        }
    }
    
    private void createAlert(Geofence geofence, Vehicle vehicle, GpsLocation gpsLocation,
                           GeofenceAlert.AlertEventType alertType, GeofenceAlert.AlertSeverity severity,
                           String message) {
        
        // Get current driver assignment
        Driver driver = getCurrentDriver(vehicle.getId());
        
        GeofenceAlert alert = GeofenceAlert.builder()
                .geofence(geofence)
                .vehicle(vehicle)
                .driver(driver)
                .gpsLocation(gpsLocation)
                .alertType(alertType)
                .severity(severity)
                .message(message)
                .latitude(gpsLocation.getLatitude())
                .longitude(gpsLocation.getLongitude())
                .speed(gpsLocation.getSpeed())
                .isAcknowledged(false)
                .alertTime(gpsLocation.getTimestamp())
                .build();
        
        geofenceAlertRepository.save(alert);
        log.warn("Geofence alert created: {} for vehicle {} in geofence {}", 
                alertType, vehicle.getLicensePlate(), geofence.getName());
    }
    
    private Driver getCurrentDriver(UUID vehicleId) {
        // This would get the current driver assignment
        // For now, return null - implement based on your driver assignment logic
        return null;
    }
    
    private void validateGeofenceRequest(GeofenceRequest request) {
        if (request.getShape() == Geofence.GeofenceShape.CIRCLE) {
            if (request.getCenterLatitude() == null || request.getCenterLongitude() == null || 
                request.getRadiusMeters() == null) {
                throw new IllegalArgumentException("Circular geofence requires center coordinates and radius");
            }
        } else if (request.getShape() == Geofence.GeofenceShape.POLYGON) {
            if (request.getPolygonCoordinates() == null || request.getPolygonCoordinates().trim().isEmpty()) {
                throw new IllegalArgumentException("Polygon geofence requires coordinate data");
            }
        }
    }
}