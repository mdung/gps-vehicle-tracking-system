package com.gps.tracking.repository;

import com.gps.tracking.entity.Route;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RouteRepository extends JpaRepository<Route, UUID> {
    List<Route> findByVehicleIdOrderByStartTimeDesc(UUID vehicleId);
    Optional<Route> findByVehicleIdAndStatus(UUID vehicleId, String status);
    List<Route> findByStatus(String status);
    
    @Query("SELECT COALESCE(SUM(r.distanceKm), 0) FROM Route r WHERE r.vehicle.id = :vehicleId " +
           "AND r.startTime >= :startDate AND r.endTime <= :endDate AND r.status = 'COMPLETED'")
    BigDecimal getTotalDistanceByVehicleAndDateRange(@Param("vehicleId") UUID vehicleId,
                                                   @Param("startDate") LocalDateTime startDate,
                                                   @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT r FROM Route r WHERE r.vehicle.id = :vehicleId " +
           "AND r.startTime >= :startDate AND r.endTime <= :endDate " +
           "ORDER BY r.startTime DESC")
    List<Route> findByVehicleIdAndDateRange(@Param("vehicleId") UUID vehicleId,
                                          @Param("startDate") LocalDateTime startDate,
                                          @Param("endDate") LocalDateTime endDate);
}



