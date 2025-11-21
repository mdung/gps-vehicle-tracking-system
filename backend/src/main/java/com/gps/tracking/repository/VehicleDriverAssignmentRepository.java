package com.gps.tracking.repository;

import com.gps.tracking.entity.VehicleDriverAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface VehicleDriverAssignmentRepository extends JpaRepository<VehicleDriverAssignment, UUID> {
    Optional<VehicleDriverAssignment> findByVehicleIdAndIsActiveTrue(UUID vehicleId);
    Optional<VehicleDriverAssignment> findByDriverIdAndIsActiveTrue(UUID driverId);
    List<VehicleDriverAssignment> findByVehicleId(UUID vehicleId);
    List<VehicleDriverAssignment> findByDriverId(UUID driverId);
}

