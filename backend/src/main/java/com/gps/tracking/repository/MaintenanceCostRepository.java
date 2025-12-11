package com.gps.tracking.repository;

import com.gps.tracking.entity.MaintenanceCost;
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
public interface MaintenanceCostRepository extends JpaRepository<MaintenanceCost, UUID> {
    
    List<MaintenanceCost> findByMaintenanceRecordIdOrderByCreatedAtAsc(UUID maintenanceRecordId);
    
    Page<MaintenanceCost> findByMaintenanceRecordIdOrderByCreatedAtAsc(UUID maintenanceRecordId, Pageable pageable);
    
    Page<MaintenanceCost> findByCostTypeOrderByCreatedAtDesc(MaintenanceCost.CostType costType, Pageable pageable);
    
    @Query("SELECT mc FROM MaintenanceCost mc WHERE mc.maintenanceRecord.vehicle.id = :vehicleId " +
           "ORDER BY mc.createdAt DESC")
    Page<MaintenanceCost> findByVehicleId(@Param("vehicleId") UUID vehicleId, Pageable pageable);
    
    @Query("SELECT mc FROM MaintenanceCost mc WHERE mc.maintenanceRecord.serviceDate BETWEEN :startDate AND :endDate " +
           "ORDER BY mc.createdAt DESC")
    Page<MaintenanceCost> findByServiceDateBetween(
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate,
        Pageable pageable
    );
    
    @Query("SELECT SUM(mc.totalCost) FROM MaintenanceCost mc WHERE mc.maintenanceRecord.id = :recordId")
    BigDecimal getTotalCostByMaintenanceRecord(@Param("recordId") UUID recordId);
    
    @Query("SELECT SUM(mc.totalCost) FROM MaintenanceCost mc WHERE mc.maintenanceRecord.vehicle.id = :vehicleId AND " +
           "mc.maintenanceRecord.serviceDate BETWEEN :startDate AND :endDate")
    BigDecimal getTotalCostByVehicleAndDateRange(
        @Param("vehicleId") UUID vehicleId,
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate
    );
    
    @Query("SELECT SUM(mc.totalCost) FROM MaintenanceCost mc WHERE mc.costType = :costType AND " +
           "mc.maintenanceRecord.serviceDate BETWEEN :startDate AND :endDate")
    BigDecimal getTotalCostByCostTypeAndDateRange(
        @Param("costType") MaintenanceCost.CostType costType,
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate
    );
    
    @Query("SELECT mc.costType, SUM(mc.totalCost) FROM MaintenanceCost mc WHERE " +
           "mc.maintenanceRecord.serviceDate BETWEEN :startDate AND :endDate GROUP BY mc.costType")
    List<Object[]> getCostSummaryByTypeAndDateRange(
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate
    );
    
    @Query("SELECT mc FROM MaintenanceCost mc WHERE mc.supplier ILIKE %:supplier% " +
           "ORDER BY mc.createdAt DESC")
    Page<MaintenanceCost> findBySupplier(@Param("supplier") String supplier, Pageable pageable);
    
    @Query("SELECT DISTINCT mc.supplier FROM MaintenanceCost mc WHERE mc.supplier IS NOT NULL " +
           "ORDER BY mc.supplier")
    List<String> findDistinctSuppliers();
    
    @Query("SELECT mc FROM MaintenanceCost mc WHERE mc.itemName ILIKE %:itemName% " +
           "ORDER BY mc.createdAt DESC")
    Page<MaintenanceCost> findByItemName(@Param("itemName") String itemName, Pageable pageable);
}