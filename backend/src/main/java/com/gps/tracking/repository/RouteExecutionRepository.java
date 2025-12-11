package com.gps.tracking.repository;

import com.gps.tracking.entity.RouteExecution;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface RouteExecutionRepository extends JpaRepository<RouteExecution, UUID> {
    
    List<RouteExecution> findByOptimizedRouteIdOrderBySequenceNumberAsc(UUID optimizedRouteId);
    
    List<RouteExecution> findByOptimizedRouteIdAndTimestampBetweenOrderBySequenceNumberAsc(
            UUID optimizedRouteId, LocalDateTime startTime, LocalDateTime endTime);
    
    @Query("SELECT e FROM RouteExecution e WHERE e.optimizedRoute.id = :routeId AND e.deviationType != 'ON_ROUTE' ORDER BY e.timestamp ASC")
    List<RouteExecution> findDeviationsByRoute(@Param("routeId") UUID routeId);
    
    @Query("SELECT AVG(e.distanceFromPlannedKm) FROM RouteExecution e WHERE e.optimizedRoute.id = :routeId")
    Double getAverageDeviationByRoute(@Param("routeId") UUID routeId);
    
    @Query("SELECT MAX(e.cumulativeDistanceKm) FROM RouteExecution e WHERE e.optimizedRoute.id = :routeId")
    Double getTotalDistanceByRoute(@Param("routeId") UUID routeId);
    
    @Query("SELECT COUNT(e) FROM RouteExecution e WHERE e.optimizedRoute.id = :routeId AND e.deviationType = :deviationType")
    Long countByRouteAndDeviationType(@Param("routeId") UUID routeId, @Param("deviationType") RouteExecution.DeviationType deviationType);
}