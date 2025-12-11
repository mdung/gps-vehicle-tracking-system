package com.gps.tracking.repository;

import com.gps.tracking.entity.SpeedViolation;
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
public interface SpeedViolationRepository extends JpaRepository<SpeedViolation, UUID> {
    
    Page<SpeedViolation> findByIsAcknowledgedFalseOrderByViolationTimeDesc(Pageable pageable);
    
    Page<SpeedViolation> findByVehicleIdOrderByViolationTimeDesc(UUID vehicleId, Pageable pageable);
    
    Page<SpeedViolation> findByDriverIdOrderByViolationTimeDesc(UUID driverId, Pageable pageable);
    
    Page<SpeedViolation> findByViolationSeverityOrderByViolationTimeDesc(
        SpeedViolation.ViolationSeverity severity, Pageable pageable
    );
    
    @Query("SELECT sv FROM SpeedViolation sv WHERE sv.violationTime BETWEEN :startTime AND :endTime " +
           "ORDER BY sv.violationTime DESC")
    Page<SpeedViolation> findByViolationTimeBetween(
        @Param("startTime") LocalDateTime startTime,
        @Param("endTime") LocalDateTime endTime,
        Pageable pageable
    );
    
    @Query("SELECT sv FROM SpeedViolation sv WHERE sv.vehicle.id = :vehicleId AND " +
           "sv.violationTime BETWEEN :startTime AND :endTime ORDER BY sv.violationTime DESC")
    List<SpeedViolation> findByVehicleIdAndViolationTimeBetween(
        @Param("vehicleId") UUID vehicleId,
        @Param("startTime") LocalDateTime startTime,
        @Param("endTime") LocalDateTime endTime
    );
    
    @Query("SELECT sv FROM SpeedViolation sv WHERE sv.driver.id = :driverId AND " +
           "sv.violationTime BETWEEN :startTime AND :endTime ORDER BY sv.violationTime DESC")
    List<SpeedViolation> findByDriverIdAndViolationTimeBetween(
        @Param("driverId") UUID driverId,
        @Param("startTime") LocalDateTime startTime,
        @Param("endTime") LocalDateTime endTime
    );
    
    @Query("SELECT COUNT(sv) FROM SpeedViolation sv WHERE sv.vehicle.id = :vehicleId")
    Long countByVehicleId(@Param("vehicleId") UUID vehicleId);
    
    @Query("SELECT COUNT(sv) FROM SpeedViolation sv WHERE sv.driver.id = :driverId")
    Long countByDriverId(@Param("driverId") UUID driverId);
    
    @Query("SELECT COUNT(sv) FROM SpeedViolation sv WHERE sv.violationSeverity = :severity")
    Long countBySeverity(@Param("severity") SpeedViolation.ViolationSeverity severity);
    
    @Query("SELECT sv FROM SpeedViolation sv WHERE sv.vehicle.id = :vehicleId AND " +
           "sv.violationTime >= :since ORDER BY sv.violationTime DESC")
    List<SpeedViolation> findRecentViolationsByVehicle(
        @Param("vehicleId") UUID vehicleId,
        @Param("since") LocalDateTime since
    );
    
    @Query("SELECT sv FROM SpeedViolation sv WHERE sv.driver.id = :driverId AND " +
           "sv.violationTime >= :since ORDER BY sv.violationTime DESC")
    List<SpeedViolation> findRecentViolationsByDriver(
        @Param("driverId") UUID driverId,
        @Param("since") LocalDateTime since
    );
}