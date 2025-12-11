package com.gps.tracking.repository;

import com.gps.tracking.entity.RouteStop;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface RouteStopRepository extends JpaRepository<RouteStop, UUID> {
    
    List<RouteStop> findByOptimizedRouteIdOrderByStopOrder(UUID optimizedRouteId);
    
    List<RouteStop> findByOptimizedRouteIdAndStatusOrderByStopOrder(UUID optimizedRouteId, RouteStop.StopStatus status);
    
    @Query("SELECT s FROM RouteStop s WHERE s.optimizedRoute.id = :routeId AND s.isCompleted = false ORDER BY s.stopOrder ASC")
    List<RouteStop> findPendingStopsByRoute(@Param("routeId") UUID routeId);
    
    @Query("SELECT s FROM RouteStop s WHERE s.optimizedRoute.id = :routeId AND s.stopOrder = (SELECT MIN(s2.stopOrder) FROM RouteStop s2 WHERE s2.optimizedRoute.id = :routeId AND s2.isCompleted = false)")
    RouteStop findNextStopByRoute(@Param("routeId") UUID routeId);
    
    @Query("SELECT COUNT(s) FROM RouteStop s WHERE s.optimizedRoute.id = :routeId AND s.isCompleted = true")
    Long countCompletedStopsByRoute(@Param("routeId") UUID routeId);
    
    @Query("SELECT COUNT(s) FROM RouteStop s WHERE s.optimizedRoute.id = :routeId")
    Long countTotalStopsByRoute(@Param("routeId") UUID routeId);
}