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

        GpsLocation endLocation = locationRepository.findById(endLocationId)
                .orElseThrow(() -> new ResourceNotFoundException("Location not found with id: " + endLocationId));

        route.setEndLocation(endLocation);
        route.setEndTime(LocalDateTime.now());
        route.setStatus("COMPLETED");

        // Calculate distance if start location exists
        if (route.getStartLocation() != null) {
            BigDecimal distance = calculateDistance(
                    route.getStartLocation().getLatitude().doubleValue(),
                    route.getStartLocation().getLongitude().doubleValue(),
                    endLocation.getLatitude().doubleValue(),
                    endLocation.getLongitude().doubleValue()
            );
            route.setDistanceKm(distance);
        }

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

