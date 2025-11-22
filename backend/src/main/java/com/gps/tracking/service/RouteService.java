package com.gps.tracking.service;

import com.gps.tracking.dto.response.RouteResponse;
import com.gps.tracking.entity.GpsLocation;
import com.gps.tracking.entity.Route;
import com.gps.tracking.exception.ResourceNotFoundException;
import com.gps.tracking.repository.GpsLocationRepository;
import com.gps.tracking.repository.RouteRepository;
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
public class RouteService {
    private final RouteRepository routeRepository;
    private final GpsLocationRepository locationRepository;

    public List<RouteResponse> getAllRoutes() {
        return routeRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public RouteResponse getRouteById(UUID id) {
        Route route = routeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Route not found with id: " + id));
        return toResponse(route);
    }

    public List<RouteResponse> getRoutesByVehicle(UUID vehicleId) {
        return routeRepository.findByVehicleIdOrderByStartTimeDesc(vehicleId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public RouteResponse endRoute(UUID routeId, UUID endLocationId) {
        Route route = routeRepository.findById(routeId)
                .orElseThrow(() -> new ResourceNotFoundException("Route not found with id: " + routeId));

        // Validate end location exists
        GpsLocation endLocation = locationRepository.findById(endLocationId)
                .orElseThrow(() -> new ResourceNotFoundException("Location not found with id: " + endLocationId));

        // Validate that end location belongs to the same vehicle as the route
        if (!endLocation.getVehicle().getId().equals(route.getVehicle().getId())) {
            throw new IllegalArgumentException("End location does not belong to the route's vehicle");
        }

        route.setEndLocation(endLocation);
        LocalDateTime endTime = LocalDateTime.now();
        route.setEndTime(endTime);
        route.setStatus("COMPLETED");

        // Calculate total traveled distance using all GPS locations in the route
        BigDecimal totalDistance = calculateTotalTraveledDistance(
                route.getVehicle().getId(),
                route.getStartTime(),
                endTime
        );
        route.setDistanceKm(totalDistance);

        return toResponse(routeRepository.save(route));
    }

    public static double distance(double lat1, double lon1, double lat2, double lon2) {
        final int R = 6371; // radius of Earth in km

        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);

        double a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                   Math.cos(Math.toRadians(lat1)) *
                   Math.cos(Math.toRadians(lat2)) *
                   Math.sin(dLon/2) * Math.sin(dLon/2);

        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    }

    private BigDecimal calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        return BigDecimal.valueOf(distance(lat1, lon1, lat2, lon2));
    }

    /**
     * Calculate total traveled distance by summing distances between consecutive GPS locations
     * This gives the actual traveled distance, not just straight-line distance
     */
    private BigDecimal calculateTotalTraveledDistance(UUID vehicleId, LocalDateTime startTime, LocalDateTime endTime) {
        // Get all GPS locations for this vehicle during the route period, ordered by timestamp
        List<GpsLocation> locations = locationRepository.findByVehicleIdAndTimestampBetween(
                vehicleId,
                startTime,
                endTime
        );

        // If no locations or only one location, return 0
        if (locations.isEmpty() || locations.size() < 2) {
            return BigDecimal.ZERO;
        }

        // Locations are already ordered by timestamp ASC from the query
        // Calculate distance between each consecutive pair of locations
        BigDecimal totalDistance = BigDecimal.ZERO;
        for (int i = 0; i < locations.size() - 1; i++) {
            GpsLocation current = locations.get(i);
            GpsLocation next = locations.get(i + 1);

            double segmentDistance = distance(
                    current.getLatitude().doubleValue(),
                    current.getLongitude().doubleValue(),
                    next.getLatitude().doubleValue(),
                    next.getLongitude().doubleValue()
            );

            totalDistance = totalDistance.add(BigDecimal.valueOf(segmentDistance));
        }

        return totalDistance;
    }

    private RouteResponse toResponse(Route route) {
        return new RouteResponse(
                route.getId(),
                route.getVehicle().getId(),
                route.getVehicle().getLicensePlate(),
                route.getDriver() != null ? route.getDriver().getId() : null,
                route.getDriver() != null ? route.getDriver().getName() : null,
                route.getStartLocation() != null ? route.getStartLocation().getId() : null,
                route.getEndLocation() != null ? route.getEndLocation().getId() : null,
                route.getStartTime(),
                route.getEndTime(),
                route.getDistanceKm(),
                route.getStatus()
        );
    }
}

