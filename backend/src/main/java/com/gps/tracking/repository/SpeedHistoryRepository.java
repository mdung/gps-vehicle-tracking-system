package com.gps.tracking.repository;

import com.gps.tracking.entity.SpeedHistory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface SpeedHistoryRepository extends JpaRepository<SpeedHistory, UUID> {
    
    Page<SpeedHistory> findByVehicleIdOrderByRecordedTimeDesc(UUID vehicleId, Pageable pageable);
    
    Page<SpeedHistory> findByDriverIdOrderByRecordedTimeDesc(UUID driverId, Pageable pageable);
    
    Page<SpeedHistory> findByIsViolationTrueOrderByRecordedTimeDesc(Pageable pageable);
    
    @Query("SELECT sh FROM SpeedHistory sh WHERE sh.recordedTime BETWEEN :startTime AND :endTime " +
           "ORDER BY sh.recordedTime DESC")
    Page<SpeedHistory> findByRecordedTimeBetween(
        @Param("startTime") LocalDateTime startTime,
        @Param("endTime") LocalDateTime endTime,
        Pageable pageable
    );
    
    @Query("SELECT sh FROM SpeedHistory sh WHERE sh.vehicle.id = :vehicleId AND " +
           "sh.recordedTime BETWEEN :startTime AND :endTime ORDER BY sh.recordedTime DESC")
    List<SpeedHistory> findByVehicleIdAndRecordedTimeBetween(
        @Param("vehicleId") UUID vehicleId,
        @Param("startTime") LocalDateTime startTime,
        @Param("endTime") LocalDateTime endTime
    );
    
    @Query("SELECT sh FROM SpeedHistory sh WHERE sh.driver.id = :driverId AND " +
           "sh.recordedTime BETWEEN :startTime AND :endTime ORDER BY sh.recordedTime DESC")
    List<SpeedHistory> findByDriverIdAndRecordedTimeBetween(
        @Param("driverId") UUID driverId,
        @Param("startTime") LocalDateTime startTime,
        @Param("endTime") LocalDateTime endTime
    );
    
    @Query("SELECT AVG(sh.speedKmh) FROM SpeedHistory sh WHERE sh.vehicle.id = :vehicleId AND " +
           "sh.recordedTime BETWEEN :startTime AND :endTime")
    BigDecimal findAverageSpeedByVehicleAndPeriod(
        @Param("vehicleId") UUID vehicleId,
        @Param("startTime") LocalDateTime startTime,
        @Param("endTime") LocalDateTime endTime
    );
    
    @Query("SELECT MAX(sh.speedKmh) FROM SpeedHistory sh WHERE sh.vehicle.id = :vehicleId AND " +
           "sh.recordedTime BETWEEN :startTime AND :endTime")
    BigDecimal findMaxSpeedByVehicleAndPeriod(
        @Param("vehicleId") UUID vehicleId,
        @Param("startTime") LocalDateTime startTime,
        @Param("endTime") LocalDateTime endTime
    );
    
    @Query("SELECT AVG(sh.speedKmh) FROM SpeedHistory sh WHERE sh.driver.id = :driverId AND " +
           "sh.recordedTime BETWEEN :startTime AND :endTime")
    BigDecimal findAverageSpeedByDriverAndPeriod(
        @Param("driverId") UUID driverId,
        @Param("startTime") LocalDateTime startTime,
        @Param("endTime") LocalDateTime endTime
    );
    
    @Query("SELECT MAX(sh.speedKmh) FROM SpeedHistory sh WHERE sh.driver.id = :driverId AND " +
           "sh.recordedTime BETWEEN :startTime AND :endTime")
    BigDecimal findMaxSpeedByDriverAndPeriod(
        @Param("driverId") UUID driverId,
        @Param("startTime") LocalDateTime startTime,
        @Param("endTime") LocalDateTime endTime
    );
    
    @Query("SELECT COUNT(sh) FROM SpeedHistory sh WHERE sh.vehicle.id = :vehicleId AND " +
           "sh.isViolation = true AND sh.recordedTime BETWEEN :startTime AND :endTime")
    Long countViolationsByVehicleAndPeriod(
        @Param("vehicleId") UUID vehicleId,
        @Param("startTime") LocalDateTime startTime,
        @Param("endTime") LocalDateTime endTime
    );
    
    @Query("SELECT COUNT(sh) FROM SpeedHistory sh WHERE sh.driver.id = :driverId AND " +
           "sh.isViolation = true AND sh.recordedTime BETWEEN :startTime AND :endTime")
    Long countViolationsByDriverAndPeriod(
        @Param("driverId") UUID driverId,
        @Param("startTime") LocalDateTime startTime,
        @Param("endTime") LocalDateTime endTime
    );
}