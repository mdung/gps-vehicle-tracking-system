package com.gps.tracking.repository;

import com.gps.tracking.entity.MaintenanceRecord;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface MaintenanceRecordRepository extends JpaRepository<MaintenanceRecord, UUID> {
    
    Page<MaintenanceRecord> findAllByOrderByServiceDateDesc(Pageable pageable);
    
    Page<MaintenanceRecord> findByVehicleIdOrderByServiceDateDesc(UUID vehicleId, Pageable pageable);
    
    List<MaintenanceRecord> findByVehicleIdOrderByServiceDateDesc(UUID vehicleId);
    
    Page<MaintenanceRecord> findByMaintenanceTypeIdOrderByServiceDateDesc(UUID maintenanceTypeId, Pageable pageable);
    
    Page<MaintenanceRecord> findByStatusOrderByServiceDateDesc(MaintenanceRecord.MaintenanceStatus status, Pageable pageable);
    
    @Query("SELECT mr FROM MaintenanceRecord mr WHERE mr.serviceDate BETWEEN :startDate AND :endDate " +
           "ORDER BY mr.serviceDate DESC")
    Page<MaintenanceRecord> findByServiceDateBetween(
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate,
        Pageable pageable
    );
    
    @Query("SELECT mr FROM MaintenanceRecord mr WHERE mr.vehicle.id = :vehicleId AND " +
           "mr.serviceDate BETWEEN :startDate AND :endDate ORDER BY mr.serviceDate DESC")
    List<MaintenanceRecord> findByVehicleIdAndServiceDateBetween(
        @Param("vehicleId") UUID vehicleId,
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate
    );
    
    @Query("SELECT SUM(mr.totalCost) FROM MaintenanceRecord mr WHERE mr.vehicle.id = :vehicleId AND " +
           "mr.serviceDate BETWEEN :startDate AND :endDate")
    BigDecimal getTotalCostByVehicleAndDateRange(
        @Param("vehicleId") UUID vehicleId,
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate
    );
    
    @Query("SELECT SUM(mr.totalCost) FROM MaintenanceRecord mr WHERE " +
           "mr.serviceDate BETWEEN :startDate AND :endDate")
    BigDecimal getTotalCostByDateRange(
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate
    );
    
    @Query("SELECT COUNT(mr) FROM MaintenanceRecord mr WHERE mr.vehicle.id = :vehicleId")
    Long countByVehicleId(@Param("vehicleId") UUID vehicleId);
    
    @Query("SELECT mr FROM MaintenanceRecord mr WHERE mr.vehicle.id = :vehicleId AND " +
           "mr.maintenanceType.id = :maintenanceTypeId ORDER BY mr.serviceDate DESC")
    List<MaintenanceRecord> findByVehicleAndMaintenanceType(
        @Param("vehicleId") UUID vehicleId,
        @Param("maintenanceTypeId") UUID maintenanceTypeId
    );
    
    @Query("SELECT mr FROM MaintenanceRecord mr WHERE mr.serviceProvider ILIKE %:provider% " +
           "ORDER BY mr.serviceDate DESC")
    Page<MaintenanceRecord> findByServiceProvider(@Param("provider") String provider, Pageable pageable);
}