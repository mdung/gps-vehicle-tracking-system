package com.gps.tracking.repository;

import com.gps.tracking.entity.Route;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RouteRepository extends JpaRepository<Route, UUID> {
    List<Route> findByVehicleIdOrderByStartTimeDesc(UUID vehicleId);
    Optional<Route> findByVehicleIdAndStatus(UUID vehicleId, String status);
    List<Route> findByStatus(String status);
}



