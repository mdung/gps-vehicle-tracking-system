package com.gps.tracking.service;

import com.gps.tracking.dto.request.AssignmentRequest;
import com.gps.tracking.dto.response.AssignmentResponse;
import com.gps.tracking.entity.Driver;
import com.gps.tracking.entity.Vehicle;
import com.gps.tracking.entity.VehicleDriverAssignment;
import com.gps.tracking.exception.ResourceNotFoundException;
import com.gps.tracking.repository.DriverRepository;
import com.gps.tracking.repository.VehicleDriverAssignmentRepository;
import com.gps.tracking.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AssignmentService {
    private final VehicleDriverAssignmentRepository assignmentRepository;
    private final VehicleRepository vehicleRepository;
    private final DriverRepository driverRepository;

    @Transactional
    public AssignmentResponse assignDriverToVehicle(AssignmentRequest request) {
        Vehicle vehicle = vehicleRepository.findById(request.getVehicleId())
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with id: " + request.getVehicleId()));
        
        Driver driver = driverRepository.findById(request.getDriverId())
                .orElseThrow(() -> new ResourceNotFoundException("Driver not found with id: " + request.getDriverId()));

        // Unassign current active assignment for vehicle
        assignmentRepository.findByVehicleIdAndIsActiveTrue(request.getVehicleId())
                .ifPresent(assignment -> {
                    assignment.setIsActive(false);
                    assignment.setUnassignedAt(LocalDateTime.now());
                    assignmentRepository.save(assignment);
                });

        // Unassign current active assignment for driver
        assignmentRepository.findByDriverIdAndIsActiveTrue(request.getDriverId())
                .ifPresent(assignment -> {
                    assignment.setIsActive(false);
                    assignment.setUnassignedAt(LocalDateTime.now());
                    assignmentRepository.save(assignment);
                });

        VehicleDriverAssignment assignment = new VehicleDriverAssignment();
        assignment.setVehicle(vehicle);
        assignment.setDriver(driver);
        assignment.setAssignedAt(LocalDateTime.now());
        assignment.setIsActive(true);

        return toResponse(assignmentRepository.save(assignment));
    }

    @Transactional
    public void unassignDriverFromVehicle(UUID assignmentId) {
        VehicleDriverAssignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found with id: " + assignmentId));
        
        assignment.setIsActive(false);
        assignment.setUnassignedAt(LocalDateTime.now());
        assignmentRepository.save(assignment);
    }

    public AssignmentResponse getCurrentAssignmentByVehicle(UUID vehicleId) {
        VehicleDriverAssignment assignment = assignmentRepository.findByVehicleIdAndIsActiveTrue(vehicleId)
                .orElseThrow(() -> new ResourceNotFoundException("No active assignment found for vehicle: " + vehicleId));
        return toResponse(assignment);
    }

    public AssignmentResponse getCurrentAssignmentByDriver(UUID driverId) {
        VehicleDriverAssignment assignment = assignmentRepository.findByDriverIdAndIsActiveTrue(driverId)
                .orElseThrow(() -> new ResourceNotFoundException("No active assignment found for driver: " + driverId));
        return toResponse(assignment);
    }

    private AssignmentResponse toResponse(VehicleDriverAssignment assignment) {
        return new AssignmentResponse(
                assignment.getId(),
                assignment.getVehicle().getId(),
                assignment.getVehicle().getLicensePlate(),
                assignment.getDriver().getId(),
                assignment.getDriver().getName(),
                assignment.getAssignedAt(),
                assignment.getUnassignedAt(),
                assignment.getIsActive()
        );
    }
}

