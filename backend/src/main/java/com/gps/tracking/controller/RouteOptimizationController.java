package com.gps.tracking.controller;

import com.gps.tracking.dto.request.OptimizedRouteRequest;
import com.gps.tracking.dto.response.OptimizedRouteResponse;
import com.gps.tracking.entity.RouteExecution;
import com.gps.tracking.service.RouteOptimizationService;
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

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/route-optimization")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Tag(name = "Route Optimization", description = "Route planning, optimization, and execution tracking")
public class RouteOptimizationController {
    
    private final RouteOptimizationService routeOptimizationService;
    
    @PostMapping("/routes")
    @Operation(summary = "Create optimized route", description = "Create a new optimized route with multiple stops")
    public ResponseEntity<OptimizedRouteResponse> createRoute(@Valid @RequestBody OptimizedRouteRequest request) {
        OptimizedRouteResponse response = routeOptimizationService.createOptimizedRoute(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    
    @GetMapping("/routes")
    @Operation(summary = "Get all routes", description = "Get paginated list of all optimized routes")
    public ResponseEntity<Page<OptimizedRouteResponse>> getAllRoutes(Pageable pageable) {
        Page<OptimizedRouteResponse> routes = routeOptimizationService.getAllRoutes(pageable);
        return ResponseEntity.ok(routes);
    }
    
    @GetMapping("/routes/{id}")
    @Operation(summary = "Get route by ID", description = "Get detailed information about a specific route")
    public ResponseEntity<OptimizedRouteResponse> getRouteById(
            @Parameter(description = "Route ID") @PathVariable UUID id) {
        OptimizedRouteResponse route = routeOptimizationService.getRouteById(id);
        return ResponseEntity.ok(route);
    }
    
    @GetMapping("/vehicles/{vehicleId}/routes")
    @Operation(summary = "Get routes by vehicle", description = "Get all routes assigned to a specific vehicle")
    public ResponseEntity<List<OptimizedRouteResponse>> getRoutesByVehicle(
            @Parameter(description = "Vehicle ID") @PathVariable UUID vehicleId) {
        List<OptimizedRouteResponse> routes = routeOptimizationService.getRoutesByVehicle(vehicleId);
        return ResponseEntity.ok(routes);
    }
    
    @GetMapping("/drivers/{driverId}/routes")
    @Operation(summary = "Get routes by driver", description = "Get all routes assigned to a specific driver")
    public ResponseEntity<List<OptimizedRouteResponse>> getRoutesByDriver(
            @Parameter(description = "Driver ID") @PathVariable UUID driverId) {
        List<OptimizedRouteResponse> routes = routeOptimizationService.getRoutesByDriver(driverId);
        return ResponseEntity.ok(routes);
    }
    
    @PostMapping("/routes/{id}/start")
    @Operation(summary = "Start route execution", description = "Start executing a planned route")
    public ResponseEntity<OptimizedRouteResponse> startRoute(
            @Parameter(description = "Route ID") @PathVariable UUID id) {
        OptimizedRouteResponse response = routeOptimizationService.startRoute(id);
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/routes/{id}/complete")
    @Operation(summary = "Complete route execution", description = "Mark a route as completed and calculate final metrics")
    public ResponseEntity<OptimizedRouteResponse> completeRoute(
            @Parameter(description = "Route ID") @PathVariable UUID id) {
        OptimizedRouteResponse response = routeOptimizationService.completeRoute(id);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/routes/{id}/execution")
    @Operation(summary = "Get route execution data", description = "Get detailed execution data for route replay")
    public ResponseEntity<List<RouteExecution>> getRouteExecution(
            @Parameter(description = "Route ID") @PathVariable UUID id) {
        List<RouteExecution> execution = routeOptimizationService.getRouteExecution(id);
        return ResponseEntity.ok(execution);
    }
    
    @GetMapping("/routes/{id}/analytics")
    @Operation(summary = "Get route analytics", description = "Get performance analytics for a route")
    public ResponseEntity<OptimizedRouteResponse.RouteAnalytics> getRouteAnalytics(
            @Parameter(description = "Route ID") @PathVariable UUID id) {
        OptimizedRouteResponse.RouteAnalytics analytics = routeOptimizationService.getRouteAnalytics(id);
        return ResponseEntity.ok(analytics);
    }
    
    @GetMapping("/health")
    @Operation(summary = "Health check", description = "Check if route optimization service is working")
    public ResponseEntity<String> healthCheck() {
        return ResponseEntity.ok("Route optimization service is running");
    }
}