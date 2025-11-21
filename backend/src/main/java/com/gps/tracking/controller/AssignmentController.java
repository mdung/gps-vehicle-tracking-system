package com.gps.tracking.controller;

import com.gps.tracking.dto.request.AssignmentRequest;
import com.gps.tracking.dto.response.AssignmentResponse;
import com.gps.tracking.service.AssignmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/assignments")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AssignmentController {
    private final AssignmentService assignmentService;

    @PostMapping
    public ResponseEntity<AssignmentResponse> assignDriverToVehicle(@Valid @RequestBody AssignmentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(assignmentService.assignDriverToVehicle(request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> unassignDriverFromVehicle(@PathVariable UUID id) {
        assignmentService.unassignDriverFromVehicle(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/vehicle/{vehicleId}")
    public ResponseEntity<AssignmentResponse> getCurrentAssignmentByVehicle(@PathVariable UUID vehicleId) {
        return ResponseEntity.ok(assignmentService.getCurrentAssignmentByVehicle(vehicleId));
    }

    @GetMapping("/driver/{driverId}")
    public ResponseEntity<AssignmentResponse> getCurrentAssignmentByDriver(@PathVariable UUID driverId) {
        return ResponseEntity.ok(assignmentService.getCurrentAssignmentByDriver(driverId));
    }
}



