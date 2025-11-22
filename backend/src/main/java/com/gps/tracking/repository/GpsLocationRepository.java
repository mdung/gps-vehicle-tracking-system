package com.gps.tracking.repository;

import com.gps.tracking.entity.GpsLocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface GpsLocationRepository extends JpaRepository<GpsLocation, UUID> {
    List<GpsLocation> findByVehicleIdOrderByTimestampDesc(UUID vehicleId);
    
    @Query("SELECT g FROM GpsLocation g JOIN FETCH g.vehicle WHERE g.vehicle.id = :vehicleId ORDER BY g.timestamp DESC")
    List<GpsLocation> findLatestByVehicleIdList(@Param("vehicleId") UUID vehicleId);
    
    default Optional<GpsLocation> findLatestByVehicleId(UUID vehicleId) {
        List<GpsLocation> locations = findLatestByVehicleIdList(vehicleId);
        return locations.isEmpty() ? Optional.empty() : Optional.of(locations.get(0));
    }
    
    @Query("SELECT g FROM GpsLocation g WHERE g.vehicle.id = :vehicleId AND g.timestamp BETWEEN :startTime AND :endTime ORDER BY g.timestamp ASC")
    List<GpsLocation> findByVehicleIdAndTimestampBetween(
        @Param("vehicleId") UUID vehicleId,
        @Param("startTime") LocalDateTime startTime,
        @Param("endTime") LocalDateTime endTime
    );
}



