package com.gps.tracking.repository;

import com.gps.tracking.entity.GeofenceAlert;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface GeofenceAlertRepository extends JpaRepository<GeofenceAlert, UUID> {
    
    Page<GeofenceAlert> findByOrderByAlertTimeDesc(Pageable pageable);
    
    Page<GeofenceAlert> findByVehicleIdOrderByAlertTimeDesc(UUID vehicleId, Pageable pageable);
    
    Page<GeofenceAlert> findByGeofenceIdOrderByAlertTimeDesc(UUID geofenceId, Pageable pageable);
    
    List<GeofenceAlert> findByIsAcknowledgedFalseOrderByAlertTimeDesc();
    
    @Query("SELECT ga FROM GeofenceAlert ga WHERE ga.isAcknowledged = false AND ga.severity = :severity " +
           "ORDER BY ga.alertTime DESC")
    List<GeofenceAlert> findUnacknowledgedAlertsBySeverity(@Param("severity") GeofenceAlert.AlertSeverity severity);
    
    @Query("SELECT ga FROM GeofenceAlert ga WHERE ga.alertTime BETWEEN :startTime AND :endTime " +
           "ORDER BY ga.alertTime DESC")
    List<GeofenceAlert> findAlertsByTimeRange(@Param("startTime") LocalDateTime startTime,
                                            @Param("endTime") LocalDateTime endTime);
    
    @Query("SELECT COUNT(ga) FROM GeofenceAlert ga WHERE ga.isAcknowledged = false")
    Long countUnacknowledgedAlerts();
    
    @Query("SELECT COUNT(ga) FROM GeofenceAlert ga WHERE ga.vehicle.id = :vehicleId AND " +
           "ga.alertTime >= :since")
    Long countAlertsByVehicleSince(@Param("vehicleId") UUID vehicleId, 
                                  @Param("since") LocalDateTime since);
    
    @Query("SELECT ga FROM GeofenceAlert ga WHERE ga.vehicle.id = :vehicleId AND " +
           "ga.alertTime BETWEEN :startTime AND :endTime ORDER BY ga.alertTime DESC")
    List<GeofenceAlert> findVehicleAlertsByTimeRange(@Param("vehicleId") UUID vehicleId,
                                                    @Param("startTime") LocalDateTime startTime,
                                                    @Param("endTime") LocalDateTime endTime);
}