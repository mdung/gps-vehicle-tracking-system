package com.gps.tracking.repository;

import com.gps.tracking.entity.SpeedLimit;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Repository
public interface SpeedLimitRepository extends JpaRepository<SpeedLimit, UUID> {
    
    Page<SpeedLimit> findByIsActiveTrue(Pageable pageable);
    
    List<SpeedLimit> findByAreaTypeAndIsActiveTrue(SpeedLimit.AreaType areaType);
    
    List<SpeedLimit> findByRoadTypeAndIsActiveTrue(SpeedLimit.RoadType roadType);
    
    @Query("SELECT sl FROM SpeedLimit sl WHERE sl.isActive = true AND " +
           "SQRT(POWER(69.1 * (sl.latitude - :latitude), 2) + " +
           "POWER(69.1 * (:longitude - sl.longitude) * COS(sl.latitude / 57.3), 2)) * 1609.34 <= sl.radiusMeters")
    List<SpeedLimit> findSpeedLimitsNearLocation(
        @Param("latitude") BigDecimal latitude, 
        @Param("longitude") BigDecimal longitude
    );
    
    @Query("SELECT sl FROM SpeedLimit sl WHERE sl.isActive = true AND " +
           "sl.latitude BETWEEN :minLat AND :maxLat AND " +
           "sl.longitude BETWEEN :minLng AND :maxLng")
    List<SpeedLimit> findSpeedLimitsInBounds(
        @Param("minLat") BigDecimal minLat,
        @Param("maxLat") BigDecimal maxLat,
        @Param("minLng") BigDecimal minLng,
        @Param("maxLng") BigDecimal maxLng
    );
    
    @Query("SELECT sl FROM SpeedLimit sl WHERE sl.name ILIKE %:searchTerm% OR sl.description ILIKE %:searchTerm%")
    Page<SpeedLimit> searchSpeedLimits(@Param("searchTerm") String searchTerm, Pageable pageable);
}