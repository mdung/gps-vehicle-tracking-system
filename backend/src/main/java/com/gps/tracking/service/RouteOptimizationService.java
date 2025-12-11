package com.gps.tracking.service;

import com.gps.tracking.dto.request.OptimizedRouteRequest;
import com.gps.tracking.dto.response.OptimizedRouteResponse;
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
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class RouteOptimizationService {
    
    private final OptimizedRouteRepository optimizedRouteRepository;
    private final RouteStopRepository routeStopRepository;
    private final RouteExecutionRepository routeExecutionRepository;
    private final VehicleRepository vehicleRepository;
    private final DriverRepository driverRepository;
    private final GpsLocationRepository gpsLocationRepository;
    
    @Transactional
    public OptimizedRouteResponse createOptimizedRoute(OptimizedRouteRequest request) {
        log.info("Creating optimized route: {}", request.getName());
        
        Vehicle vehicle = vehicleRepository.findById(request.getVehicleId())
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found"));
        
        Driver driver = null;
        if (request.getDriverId() != null) {
            driver = driverRepository.findById(request.getDriverId())
                    .orElseThrow(() -> new ResourceNotFoundException("Driver not found"));
        }
        
        // Optimize the route based on the selected optimization type
        List<OptimizedRouteRequest.RouteStopRequest> optimizedStops = optimizeStops(request.getStops(), request.getOptimizationType());
        
        // Calculate route metrics
        RouteMetrics metrics = calculateRouteMetrics(optimizedStops);
        
        OptimizedRoute route = OptimizedRoute.builder()
                .name(request.getName())
                .description(request.getDescription())
                .vehicle(vehicle)
                .driver(driver)
                .status(OptimizedRoute.RouteStatus.PLANNED)
                .optimizationType(request.getOptimizationType())
                .routeCoordinates(generateRouteCoordinates(optimizedStops))
                .waypoints(generateWaypoints(optimizedStops))
                .totalDistanceKm(metrics.getTotalDistance())
                .estimatedDurationHours(metrics.getEstimatedDuration())
                .estimatedFuelCost(request.getEstimatedFuelCost() != null ? request.getEstimatedFuelCost() : metrics.getEstimatedFuelCost())
                .plannedStartTime(request.getPlannedStartTime() != null ? request.getPlannedStartTime() : LocalDateTime.now())
                .plannedEndTime(request.getPlannedStartTime() != null ? 
                    request.getPlannedStartTime().plusHours(metrics.getEstimatedDuration().longValue()) : 
                    LocalDateTime.now().plusHours(metrics.getEstimatedDuration().longValue()))
                .isActive(true)
                .build();
        
        route = optimizedRouteRepository.save(route);
        
        // Create route stops
        createRouteStops(route, optimizedStops);
        
        log.info("Created optimized route with {} stops", optimizedStops.size());
        return buildRouteResponse(route);
    }
    
    public Page<OptimizedRouteResponse> getAllRoutes(Pageable pageable) {
        return optimizedRouteRepository.findByIsActiveTrueOrderByCreatedAtDesc(pageable)
                .map(this::buildRouteResponse);
    }
    
    public OptimizedRouteResponse getRouteById(UUID id) {
        OptimizedRoute route = optimizedRouteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Route not found"));
        return buildRouteResponse(route);
    }
    
    public List<OptimizedRouteResponse> getRoutesByVehicle(UUID vehicleId) {
        return optimizedRouteRepository.findByVehicleIdAndIsActiveTrueOrderByCreatedAtDesc(vehicleId)
                .stream()
                .map(this::buildRouteResponse)
                .collect(Collectors.toList());
    }
    
    public List<OptimizedRouteResponse> getRoutesByDriver(UUID driverId) {
        return optimizedRouteRepository.findByDriverIdAndIsActiveTrueOrderByCreatedAtDesc(driverId)
                .stream()
                .map(this::buildRouteResponse)
                .collect(Collectors.toList());
    }
    
    @Transactional
    public OptimizedRouteResponse startRoute(UUID routeId) {
        OptimizedRoute route = optimizedRouteRepository.findById(routeId)
                .orElseThrow(() -> new ResourceNotFoundException("Route not found"));
        
        route.setStatus(OptimizedRoute.RouteStatus.IN_PROGRESS);
        route.setActualStartTime(LocalDateTime.now());
        route = optimizedRouteRepository.save(route);
        
        log.info("Started route execution: {}", route.getName());
        return buildRouteResponse(route);
    }
    
    @Transactional
    public OptimizedRouteResponse completeRoute(UUID routeId) {
        OptimizedRoute route = optimizedRouteRepository.findById(routeId)
                .orElseThrow(() -> new ResourceNotFoundException("Route not found"));
        
        route.setStatus(OptimizedRoute.RouteStatus.COMPLETED);
        route.setActualEndTime(LocalDateTime.now());
        
        // Calculate actual metrics and efficiency score
        calculateActualMetrics(route);
        
        route = optimizedRouteRepository.save(route);
        
        log.info("Completed route execution: {}", route.getName());
        return buildRouteResponse(route);
    }
    
    public List<RouteExecution> getRouteExecution(UUID routeId) {
        return routeExecutionRepository.findByOptimizedRouteIdOrderBySequenceNumberAsc(routeId);
    }
    
    public OptimizedRouteResponse.RouteAnalytics getRouteAnalytics(UUID routeId) {
        OptimizedRoute route = optimizedRouteRepository.findById(routeId)
                .orElseThrow(() -> new ResourceNotFoundException("Route not found"));
        
        Long totalStops = routeStopRepository.countTotalStopsByRoute(routeId);
        Long completedStops = routeStopRepository.countCompletedStopsByRoute(routeId);
        Double averageDeviation = routeExecutionRepository.getAverageDeviationByRoute(routeId);
        Long totalDeviations = routeExecutionRepository.countByRouteAndDeviationType(routeId, RouteExecution.DeviationType.MAJOR_DEVIATION);
        
        BigDecimal completionPercentage = totalStops > 0 ? 
            BigDecimal.valueOf(completedStops * 100.0 / totalStops).setScale(2, RoundingMode.HALF_UP) : 
            BigDecimal.ZERO;
        
        BigDecimal timeVariance = calculateTimeVariance(route);
        String performanceRating = calculatePerformanceRating(route.getEfficiencyScore());
        
        return OptimizedRouteResponse.RouteAnalytics.builder()
                .totalStops(totalStops.intValue())
                .completedStops(completedStops.intValue())
                .completionPercentage(completionPercentage)
                .averageDeviationKm(averageDeviation != null ? BigDecimal.valueOf(averageDeviation).setScale(3, RoundingMode.HALF_UP) : BigDecimal.ZERO)
                .totalDeviations(totalDeviations)
                .timeVarianceHours(timeVariance)
                .fuelEfficiencyScore(route.getEfficiencyScore())
                .performanceRating(performanceRating)
                .build();
    }
    
    @Transactional
    public void recordRouteExecution(UUID routeId, GpsLocation gpsLocation) {
        OptimizedRoute route = optimizedRouteRepository.findById(routeId)
                .orElseThrow(() -> new ResourceNotFoundException("Route not found"));
        
        if (route.getStatus() != OptimizedRoute.RouteStatus.IN_PROGRESS) {
            return; // Only record execution for active routes
        }
        
        // Calculate deviation from planned route
        BigDecimal deviation = calculateDeviationFromPlannedRoute(route, gpsLocation);
        RouteExecution.DeviationType deviationType = determineDeviationType(deviation);
        
        // Get sequence number
        Integer sequenceNumber = getNextSequenceNumber(routeId);
        
        RouteExecution execution = RouteExecution.builder()
                .optimizedRoute(route)
                .gpsLocation(gpsLocation)
                .sequenceNumber(sequenceNumber)
                .latitude(gpsLocation.getLatitude())
                .longitude(gpsLocation.getLongitude())
                .speed(gpsLocation.getSpeed())
                .direction(gpsLocation.getDirection())
                .distanceFromPlannedKm(deviation)
                .cumulativeDistanceKm(calculateCumulativeDistance(routeId, gpsLocation))
                .timestamp(gpsLocation.getTimestamp())
                .deviationType(deviationType)
                .build();
        
        routeExecutionRepository.save(execution);
    }
    
    // Private helper methods
    
    private List<OptimizedRouteRequest.RouteStopRequest> optimizeStops(
            List<OptimizedRouteRequest.RouteStopRequest> stops, 
            OptimizedRoute.OptimizationType optimizationType) {
        
        switch (optimizationType) {
            case SHORTEST_DISTANCE:
                return optimizeForShortestDistance(stops);
            case FASTEST_TIME:
                return optimizeForFastestTime(stops);
            case FUEL_EFFICIENT:
                return optimizeForFuelEfficiency(stops);
            case BALANCED:
                return optimizeBalanced(stops);
            default:
                return stops; // Return original order for CUSTOM
        }
    }
    
    private List<OptimizedRouteRequest.RouteStopRequest> optimizeForShortestDistance(List<OptimizedRouteRequest.RouteStopRequest> stops) {
        // Implement Traveling Salesman Problem (TSP) algorithm
        // For simplicity, using nearest neighbor algorithm
        if (stops.size() <= 2) return stops;
        
        List<OptimizedRouteRequest.RouteStopRequest> optimized = new ArrayList<>();
        List<OptimizedRouteRequest.RouteStopRequest> remaining = new ArrayList<>(stops);
        
        // Start with first stop
        OptimizedRouteRequest.RouteStopRequest current = remaining.remove(0);
        optimized.add(current);
        
        while (!remaining.isEmpty()) {
            OptimizedRouteRequest.RouteStopRequest nearest = findNearestStop(current, remaining);
            remaining.remove(nearest);
            optimized.add(nearest);
            current = nearest;
        }
        
        return optimized;
    }
    
    private OptimizedRouteRequest.RouteStopRequest findNearestStop(
            OptimizedRouteRequest.RouteStopRequest current, 
            List<OptimizedRouteRequest.RouteStopRequest> candidates) {
        
        return candidates.stream()
                .min((a, b) -> Double.compare(
                    calculateDistance(current.getLatitude(), current.getLongitude(), a.getLatitude(), a.getLongitude()),
                    calculateDistance(current.getLatitude(), current.getLongitude(), b.getLatitude(), b.getLongitude())
                ))
                .orElse(candidates.get(0));
    }
    
    private double calculateDistance(BigDecimal lat1, BigDecimal lon1, BigDecimal lat2, BigDecimal lon2) {
        // Haversine formula for calculating distance between two points
        double R = 6371; // Earth's radius in kilometers
        double dLat = Math.toRadians(lat2.doubleValue() - lat1.doubleValue());
        double dLon = Math.toRadians(lon2.doubleValue() - lon1.doubleValue());
        double a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(Math.toRadians(lat1.doubleValue())) * Math.cos(Math.toRadians(lat2.doubleValue())) *
                Math.sin(dLon/2) * Math.sin(dLon/2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    }
    
    private List<OptimizedRouteRequest.RouteStopRequest> optimizeForFastestTime(List<OptimizedRouteRequest.RouteStopRequest> stops) {
        // For now, use same as shortest distance (in real implementation, consider traffic data)
        return optimizeForShortestDistance(stops);
    }
    
    private List<OptimizedRouteRequest.RouteStopRequest> optimizeForFuelEfficiency(List<OptimizedRouteRequest.RouteStopRequest> stops) {
        // Consider elevation, traffic patterns, and fuel consumption
        return optimizeForShortestDistance(stops);
    }
    
    private List<OptimizedRouteRequest.RouteStopRequest> optimizeBalanced(List<OptimizedRouteRequest.RouteStopRequest> stops) {
        // Balance between distance, time, and fuel efficiency
        return optimizeForShortestDistance(stops);
    }
    
    private RouteMetrics calculateRouteMetrics(List<OptimizedRouteRequest.RouteStopRequest> stops) {
        BigDecimal totalDistance = BigDecimal.ZERO;
        BigDecimal totalDuration = BigDecimal.ZERO;
        
        for (int i = 0; i < stops.size() - 1; i++) {
            OptimizedRouteRequest.RouteStopRequest current = stops.get(i);
            OptimizedRouteRequest.RouteStopRequest next = stops.get(i + 1);
            
            double distance = calculateDistance(
                current.getLatitude(), current.getLongitude(),
                next.getLatitude(), next.getLongitude()
            );
            
            totalDistance = totalDistance.add(BigDecimal.valueOf(distance));
            
            // Estimate duration (assuming average speed of 50 km/h)
            BigDecimal segmentDuration = BigDecimal.valueOf(distance / 50.0);
            totalDuration = totalDuration.add(segmentDuration);
            
            // Add service time
            if (next.getEstimatedServiceTimeMinutes() != null) {
                totalDuration = totalDuration.add(next.getEstimatedServiceTimeMinutes().divide(BigDecimal.valueOf(60), 2, RoundingMode.HALF_UP));
            }
        }
        
        // Estimate fuel cost (assuming 8L/100km and $1.5/L)
        BigDecimal fuelConsumption = totalDistance.multiply(BigDecimal.valueOf(0.08));
        BigDecimal estimatedFuelCost = fuelConsumption.multiply(BigDecimal.valueOf(1.5));
        
        return new RouteMetrics(totalDistance, totalDuration, estimatedFuelCost);
    }
    
    private String generateRouteCoordinates(List<OptimizedRouteRequest.RouteStopRequest> stops) {
        // Generate JSON string of coordinates for the route
        StringBuilder coordinates = new StringBuilder("[");
        for (int i = 0; i < stops.size(); i++) {
            OptimizedRouteRequest.RouteStopRequest stop = stops.get(i);
            coordinates.append("[").append(stop.getLongitude()).append(",").append(stop.getLatitude()).append("]");
            if (i < stops.size() - 1) {
                coordinates.append(",");
            }
        }
        coordinates.append("]");
        return coordinates.toString();
    }
    
    private String generateWaypoints(List<OptimizedRouteRequest.RouteStopRequest> stops) {
        // Generate JSON string of waypoints
        return stops.stream()
                .map(stop -> String.format("{\"name\":\"%s\",\"lat\":%s,\"lng\":%s,\"type\":\"%s\"}", 
                    stop.getName(), stop.getLatitude(), stop.getLongitude(), stop.getStopType()))
                .collect(Collectors.joining(",", "[", "]"));
    }
    
    private void createRouteStops(OptimizedRoute route, List<OptimizedRouteRequest.RouteStopRequest> stopRequests) {
        for (int i = 0; i < stopRequests.size(); i++) {
            OptimizedRouteRequest.RouteStopRequest stopRequest = stopRequests.get(i);
            
            RouteStop stop = RouteStop.builder()
                    .optimizedRoute(route)
                    .stopOrder(i + 1)
                    .name(stopRequest.getName())
                    .address(stopRequest.getAddress())
                    .latitude(stopRequest.getLatitude())
                    .longitude(stopRequest.getLongitude())
                    .stopType(RouteStop.StopType.valueOf(stopRequest.getStopType().toUpperCase()))
                    .estimatedServiceTimeMinutes(stopRequest.getEstimatedServiceTimeMinutes())
                    .plannedArrivalTime(stopRequest.getPlannedArrivalTime())
                    .status(RouteStop.StopStatus.PENDING)
                    .notes(stopRequest.getNotes())
                    .isCompleted(false)
                    .build();
            
            routeStopRepository.save(stop);
        }
    }
    
    private OptimizedRouteResponse buildRouteResponse(OptimizedRoute route) {
        List<RouteStop> stops = routeStopRepository.findByOptimizedRouteIdOrderByStopOrder(route.getId());
        
        List<OptimizedRouteResponse.RouteStopResponse> stopResponses = stops.stream()
                .map(stop -> OptimizedRouteResponse.RouteStopResponse.builder()
                        .id(stop.getId())
                        .stopOrder(stop.getStopOrder())
                        .name(stop.getName())
                        .address(stop.getAddress())
                        .latitude(stop.getLatitude())
                        .longitude(stop.getLongitude())
                        .stopType(stop.getStopType().toString())
                        .status(stop.getStatus() != null ? stop.getStatus().toString() : null)
                        .estimatedServiceTimeMinutes(stop.getEstimatedServiceTimeMinutes())
                        .actualServiceTimeMinutes(stop.getActualServiceTimeMinutes())
                        .plannedArrivalTime(stop.getPlannedArrivalTime())
                        .plannedDepartureTime(stop.getPlannedDepartureTime())
                        .actualArrivalTime(stop.getActualArrivalTime())
                        .actualDepartureTime(stop.getActualDepartureTime())
                        .isCompleted(stop.getIsCompleted())
                        .notes(stop.getNotes())
                        .build())
                .collect(Collectors.toList());
        
        OptimizedRouteResponse response = OptimizedRouteResponse.fromEntity(route);
        response.setStops(stopResponses);
        
        // Add analytics if route is completed or in progress
        if (route.getStatus() == OptimizedRoute.RouteStatus.COMPLETED || 
            route.getStatus() == OptimizedRoute.RouteStatus.IN_PROGRESS) {
            response.setAnalytics(getRouteAnalytics(route.getId()));
        }
        
        return response;
    }
    
    private void calculateActualMetrics(OptimizedRoute route) {
        // Calculate actual distance from route executions
        Double actualDistance = routeExecutionRepository.getTotalDistanceByRoute(route.getId());
        if (actualDistance != null) {
            route.setActualDistanceKm(BigDecimal.valueOf(actualDistance).setScale(2, RoundingMode.HALF_UP));
        }
        
        // Calculate actual duration
        if (route.getActualStartTime() != null && route.getActualEndTime() != null) {
            long durationMinutes = java.time.Duration.between(route.getActualStartTime(), route.getActualEndTime()).toMinutes();
            route.setActualDurationHours(BigDecimal.valueOf(durationMinutes / 60.0).setScale(2, RoundingMode.HALF_UP));
        }
        
        // Calculate efficiency score
        BigDecimal efficiencyScore = calculateEfficiencyScore(route);
        route.setEfficiencyScore(efficiencyScore);
    }
    
    private BigDecimal calculateEfficiencyScore(OptimizedRoute route) {
        BigDecimal score = BigDecimal.valueOf(100); // Start with perfect score
        
        // Deduct points for distance variance
        if (route.getTotalDistanceKm() != null && route.getActualDistanceKm() != null) {
            BigDecimal distanceVariance = route.getActualDistanceKm().subtract(route.getTotalDistanceKm())
                    .divide(route.getTotalDistanceKm(), 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100));
            score = score.subtract(distanceVariance.abs().multiply(BigDecimal.valueOf(0.5)));
        }
        
        // Deduct points for time variance
        if (route.getEstimatedDurationHours() != null && route.getActualDurationHours() != null) {
            BigDecimal timeVariance = route.getActualDurationHours().subtract(route.getEstimatedDurationHours())
                    .divide(route.getEstimatedDurationHours(), 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100));
            score = score.subtract(timeVariance.abs().multiply(BigDecimal.valueOf(0.3)));
        }
        
        // Ensure score is between 0 and 100
        if (score.compareTo(BigDecimal.ZERO) < 0) score = BigDecimal.ZERO;
        if (score.compareTo(BigDecimal.valueOf(100)) > 0) score = BigDecimal.valueOf(100);
        
        return score.setScale(2, RoundingMode.HALF_UP);
    }
    
    private BigDecimal calculateDeviationFromPlannedRoute(OptimizedRoute route, GpsLocation gpsLocation) {
        // Simplified calculation - in real implementation, use route geometry
        return BigDecimal.valueOf(0.1); // Placeholder
    }
    
    private RouteExecution.DeviationType determineDeviationType(BigDecimal deviation) {
        if (deviation.compareTo(BigDecimal.valueOf(0.05)) <= 0) {
            return RouteExecution.DeviationType.ON_ROUTE;
        } else if (deviation.compareTo(BigDecimal.valueOf(0.2)) <= 0) {
            return RouteExecution.DeviationType.MINOR_DEVIATION;
        } else {
            return RouteExecution.DeviationType.MAJOR_DEVIATION;
        }
    }
    
    private Integer getNextSequenceNumber(UUID routeId) {
        List<RouteExecution> executions = routeExecutionRepository.findByOptimizedRouteIdOrderBySequenceNumberAsc(routeId);
        return executions.isEmpty() ? 1 : executions.get(executions.size() - 1).getSequenceNumber() + 1;
    }
    
    private BigDecimal calculateCumulativeDistance(UUID routeId, GpsLocation currentLocation) {
        // Calculate cumulative distance from start of route
        return BigDecimal.valueOf(10.5); // Placeholder
    }
    
    private BigDecimal calculateTimeVariance(OptimizedRoute route) {
        if (route.getEstimatedDurationHours() != null && route.getActualDurationHours() != null) {
            return route.getActualDurationHours().subtract(route.getEstimatedDurationHours());
        }
        return BigDecimal.ZERO;
    }
    
    private String calculatePerformanceRating(BigDecimal efficiencyScore) {
        if (efficiencyScore == null) return "N/A";
        
        if (efficiencyScore.compareTo(BigDecimal.valueOf(90)) >= 0) return "Excellent";
        if (efficiencyScore.compareTo(BigDecimal.valueOf(80)) >= 0) return "Good";
        if (efficiencyScore.compareTo(BigDecimal.valueOf(70)) >= 0) return "Average";
        if (efficiencyScore.compareTo(BigDecimal.valueOf(60)) >= 0) return "Below Average";
        return "Poor";
    }
    
    // Helper class for route metrics
    private static class RouteMetrics {
        private final BigDecimal totalDistance;
        private final BigDecimal estimatedDuration;
        private final BigDecimal estimatedFuelCost;
        
        public RouteMetrics(BigDecimal totalDistance, BigDecimal estimatedDuration, BigDecimal estimatedFuelCost) {
            this.totalDistance = totalDistance;
            this.estimatedDuration = estimatedDuration;
            this.estimatedFuelCost = estimatedFuelCost;
        }
        
        public BigDecimal getTotalDistance() { return totalDistance; }
        public BigDecimal getEstimatedDuration() { return estimatedDuration; }
        public BigDecimal getEstimatedFuelCost() { return estimatedFuelCost; }
    }
}