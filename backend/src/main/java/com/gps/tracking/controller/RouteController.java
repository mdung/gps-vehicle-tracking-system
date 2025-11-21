package com.gps.tracking.controller;

import com.gps.tracking.dto.response.RouteResponse;
import com.gps.tracking.service.RouteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/routes")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class RouteController {
    private final RouteService routeService;

    @GetMapping
    public ResponseEntity<List<RouteResponse>> getAllRoutes() {
        return ResponseEntity.ok(routeService.getAllRoutes());
    }

    @GetMapping("/{id}")
    public ResponseEntity<RouteResponse> getRouteById(@PathVariable UUID id) {
        return ResponseEntity.ok(routeService.getRouteById(id));
    }

    @GetMapping("/vehicle/{vehicleId}")
    public ResponseEntity<List<RouteResponse>> getRoutesByVehicle(@PathVariable UUID vehicleId) {
        return ResponseEntity.ok(routeService.getRoutesByVehicle(vehicleId));
    }

    @PutMapping("/{id}/end")
    public ResponseEntity<RouteResponse> endRoute(
            @PathVariable UUID id,
            @RequestParam UUID endLocationId) {
        return ResponseEntity.ok(routeService.endRoute(id, endLocationId));
    }
}



