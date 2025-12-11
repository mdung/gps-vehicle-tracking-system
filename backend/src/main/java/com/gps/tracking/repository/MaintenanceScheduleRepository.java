package com.gps.tracking.repository;

import com.gps.tracking.entity.MaintenanceSchedule;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface MaintenanceScheduleRepository extends JpaRepository<MaintenanceSchedule, UUID> {
    
    Page<MaintenanceSchedule> findByIsActiveTrueOrderByNextDueDate(Pageable pageable);
    
    Page<MaintenanceSchedule> findByVehicleIdAndIsActiveTrueOrderByNextDueDate(UUID vehicleId, Pageable pageable);
    
    List<MaintenanceSchedule> findByVehicleIdAndIsActiveTrueOrderByNextDueDate(UUID vehicleId);
    
    @Query("SELECT ms FROM MaintenanceSchedule ms WHERE ms.isActive = true AND " +
           "ms.nextDueDate <= :date ORDER BY ms.nextDueDate")
    List<MaintenanceSchedule> findDueSchedules(@Param("date") LocalDate date);
    
    @Query("SELECT ms FROM MaintenanceSchedule ms WHERE ms.isActive = true AND " +
           "ms.nextDueDate BETWEEN :startDate AND :endDate ORDER BY ms.nextDueDate")
    List<MaintenanceSchedule> findSchedulesDueBetween(
        @Param("startDate") LocalDate startDate, 
        @Param("endDate") LocalDate endDate
    );
    
    @Query("SELECT ms FROM MaintenanceSchedule ms WHERE ms.vehicle.id = :vehicleId AND " +
           "ms.maintenanceType.id = :maintenanceTypeId AND ms.isActive = true")
    List<MaintenanceSchedule> findByVehicleAndMaintenanceType(
        @Param("vehicleId") UUID vehicleId,
        @Param("maintenanceTypeId") UUID maintenanceTypeId
    );
    
    @Query("SELECT COUNT(ms) FROM MaintenanceSchedule ms WHERE ms.vehicle.id = :vehicleId AND ms.isActive = true")
    Long countActiveSchedulesByVehicle(@Param("vehicleId") UUID vehicleId);
    
    @Query("SELECT ms FROM MaintenanceSchedule ms WHERE ms.isActive = true AND " +
           "ms.nextDueDate < CURRENT_DATE ORDER BY ms.nextDueDate")
    List<MaintenanceSchedule> findOverdueSchedules();
}