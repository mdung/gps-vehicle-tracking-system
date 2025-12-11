package com.gps.tracking.repository;

import com.gps.tracking.entity.OptimizedRoute;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface OptimizedRouteRepository extends JpaRepository<OptimizedRoute, UUID> {
    
    Page<OptimizedRoute> findByIsActiveTrueOrderByCreatedAtDesc(Pageable pageable);
    
    List<OptimizedRoute> findByVehicleIdAndIsActiveTrueOrderByCreatedAtDesc(UUID vehicleId);
    
    List<OptimizedRoute> findByDriverIdAndIsActiveTrueOrderByCreatedAtDesc(UUID driverId);
    
    List<OptimizedRoute> findByStatusAndIsActiveTrueOrderByCreatedAtDesc(OptimizedRoute.RouteStatus status);
    
    @Query("SELECT r FROM OptimizedRoute r WHERE r.status = :status AND r.plannedStartTime BETWEEN :startDate AND :endDate AND r.isActive = true ORDER BY r.plannedStartTime ASC")
    List<OptimizedRoute> findByStatusAndPlannedStartTimeBetween(
            @Param("status") OptimizedRoute.RouteStatus status,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );
    
    @Query("SELECT r FROM OptimizedRoute r WHERE r.vehicle.id = :vehicleId AND r.status IN :statuses AND r.isActive = true ORDER BY r.createdAt DESC")
    List<OptimizedRoute> findByVehicleIdAndStatusIn(
            @Param("vehicleId") UUID vehicleId,
            @Param("statuses") List<OptimizedRoute.RouteStatus> statuses
    );
    
    @Query("SELECT r FROM OptimizedRoute r WHERE r.optimizationType = :optimizationType AND r.isActive = true ORDER BY r.efficiencyScore DESC")
    List<OptimizedRoute> findByOptimizationTypeOrderByEfficiencyScoreDesc(
            @Param("optimizationType") OptimizedRoute.OptimizationType optimizationType
    );
    
    @Query("SELECT AVG(r.efficiencyScore) FROM OptimizedRoute r WHERE r.vehicle.id = :vehicleId AND r.status = 'COMPLETED' AND r.isActive = true")
    Optional<Double> getAverageEfficiencyScoreByVehicle(@Param("vehicleId") UUID vehicleId);
    
    @Query("SELECT AVG(r.efficiencyScore) FROM OptimizedRoute r WHERE r.driver.id = :driverId AND r.status = 'COMPLETED' AND r.isActive = true")
    Optional<Double> getAverageEfficiencyScoreByDriver(@Param("driverId") UUID driverId);
    
    @Query("SELECT COUNT(r) FROM OptimizedRoute r WHERE r.status = :status AND r.createdAt >= :fromDate AND r.isActive = true")
    Long countByStatusAndCreatedAtAfter(
            @Param("status") OptimizedRoute.RouteStatus status,
            @Param("fromDate") LocalDateTime fromDate
    );
}