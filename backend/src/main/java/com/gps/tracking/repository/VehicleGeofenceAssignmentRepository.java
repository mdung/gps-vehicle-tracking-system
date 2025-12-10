package com.gps.tracking.repository;

import com.gps.tracking.entity.VehicleGeofenceAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface VehicleGeofenceAssignmentRepository extends JpaRepository<VehicleGeofenceAssignment, UUID> {
    
    List<VehicleGeofenceAssignment> findByVehicleIdAndIsActiveTrue(UUID vehicleId);
    
    List<VehicleGeofenceAssignment> findByGeofenceIdAndIsActiveTrue(UUID geofenceId);
    
    Optional<VehicleGeofenceAssignment> findByVehicleIdAndGeofenceIdAndIsActiveTrue(UUID vehicleId, UUID geofenceId);
    
    @Query("SELECT vga FROM VehicleGeofenceAssignment vga WHERE vga.vehicle.id = :vehicleId " +
           "AND vga.isActive = true AND vga.geofence.isActive = true")
    List<VehicleGeofenceAssignment> findActiveAssignmentsByVehicle(@Param("vehicleId") UUID vehicleId);
    
    @Query("SELECT COUNT(vga) FROM VehicleGeofenceAssignment vga WHERE vga.geofence.id = :geofenceId " +
           "AND vga.isActive = true")
    Long countActiveVehiclesByGeofence(@Param("geofenceId") UUID geofenceId);
}