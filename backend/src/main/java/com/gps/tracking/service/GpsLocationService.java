package com.gps.tracking.service;

import com.gps.tracking.dto.request.GpsLocationRequest;
import com.gps.tracking.dto.response.GpsLocationResponse;
import com.gps.tracking.entity.GpsLocation;
import com.gps.tracking.entity.Route;
import com.gps.tracking.entity.Vehicle;
import com.gps.tracking.exception.ResourceNotFoundException;
import com.gps.tracking.repository.GpsLocationRepository;
import com.gps.tracking.repository.RouteRepository;
import com.gps.tracking.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GpsLocationService {
    private final GpsLocationRepository locationRepository;
    private final VehicleRepository vehicleRepository;
    private final RouteRepository routeRepository;
    private final WebSocketService webSocketService;

    @Transactional
    public GpsLocationResponse createLocation(GpsLocationRequest request) {
        Vehicle vehicle = vehicleRepository.findById(request.getVehicleId())
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with id: " + request.getVehicleId()));

        GpsLocation location = new GpsLocation();
        location.setVehicle(vehicle);
        location.setLatitude(request.getLatitude());
        location.setLongitude(request.getLongitude());
        location.setSpeed(request.getSpeed());
        location.setDirection(request.getDirection());
        location.setTimestamp(request.getTimestamp() != null ? request.getTimestamp() : LocalDateTime.now());

        GpsLocation saved = locationRepository.save(location);

        // Auto-create route if no active route exists
        routeRepository.findByVehicleIdAndStatus(request.getVehicleId(), "IN_PROGRESS")
                .orElseGet(() -> {
                    Route route = new Route();
                    route.setVehicle(vehicle);
                    route.setStartLocation(saved);
                    route.setStartTime(saved.getTimestamp());
                    route.setStatus("IN_PROGRESS");
                    return routeRepository.save(route);
                });

        GpsLocationResponse response = toResponse(saved);
        
        // Broadcast location update via WebSocket to all connected clients
        webSocketService.broadcastLocationUpdate(response);

        return response;
    }

    public List<GpsLocationResponse> getLocationsByVehicle(UUID vehicleId) {
        return locationRepository.findByVehicleIdOrderByTimestampDesc(vehicleId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public GpsLocationResponse getLatestLocationByVehicle(UUID vehicleId) {
        GpsLocation location = locationRepository.findLatestByVehicleId(vehicleId)
                .orElseThrow(() -> new ResourceNotFoundException("No location found for vehicle: " + vehicleId));
        return toResponse(location);
    }

    public List<GpsLocationResponse> getLocationHistory(UUID vehicleId, LocalDateTime startTime, LocalDateTime endTime) {
        return locationRepository.findByVehicleIdAndTimestampBetween(vehicleId, startTime, endTime).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    private GpsLocationResponse toResponse(GpsLocation location) {
        return new GpsLocationResponse(
                location.getId(),
                location.getVehicle().getId(),
                location.getVehicle().getLicensePlate(),
                location.getLatitude(),
                location.getLongitude(),
                location.getSpeed(),
                location.getDirection(),
                location.getTimestamp(),
                location.getCreatedAt()
        );
    }
}



