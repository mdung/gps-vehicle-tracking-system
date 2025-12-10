package com.gps.tracking.repository;

import com.gps.tracking.entity.FuelRecord;
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
public interface FuelRecordRepository extends JpaRepository<FuelRecord, UUID> {
    
    Page<FuelRecord> findByVehicleIdOrderByRefuelDateDesc(UUID vehicleId, Pageable pageable);
    
    Page<FuelRecord> findByDriverIdOrderByRefuelDateDesc(UUID driverId, Pageable pageable);
    
    List<FuelRecord> findByVehicleIdAndRefuelDateBetweenOrderByRefuelDateDesc(
            UUID vehicleId, LocalDateTime startDate, LocalDateTime endDate);
    
    List<FuelRecord> findByDriverIdAndRefuelDateBetweenOrderByRefuelDateDesc(
            UUID driverId, LocalDateTime startDate, LocalDateTime endDate);
    
    @Query("SELECT SUM(fr.fuelAmountLiters) FROM FuelRecord fr WHERE fr.vehicle.id = :vehicleId " +
           "AND fr.refuelDate BETWEEN :startDate AND :endDate")
    BigDecimal getTotalFuelConsumedByVehicle(@Param("vehicleId") UUID vehicleId,
                                           @Param("startDate") LocalDateTime startDate,
                                           @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT SUM(fr.fuelCost) FROM FuelRecord fr WHERE fr.vehicle.id = :vehicleId " +
           "AND fr.refuelDate BETWEEN :startDate AND :endDate")
    BigDecimal getTotalFuelCostByVehicle(@Param("vehicleId") UUID vehicleId,
                                       @Param("startDate") LocalDateTime startDate,
                                       @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT COUNT(fr) FROM FuelRecord fr WHERE fr.vehicle.id = :vehicleId " +
           "AND fr.refuelDate BETWEEN :startDate AND :endDate")
    Long getRefuelCountByVehicle(@Param("vehicleId") UUID vehicleId,
                                @Param("startDate") LocalDateTime startDate,
                                @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT AVG(fr.costPerLiter) FROM FuelRecord fr WHERE fr.vehicle.id = :vehicleId " +
           "AND fr.refuelDate BETWEEN :startDate AND :endDate")
    BigDecimal getAverageCostPerLiterByVehicle(@Param("vehicleId") UUID vehicleId,
                                             @Param("startDate") LocalDateTime startDate,
                                             @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT fr FROM FuelRecord fr WHERE fr.refuelDate BETWEEN :startDate AND :endDate " +
           "ORDER BY fr.refuelDate DESC")
    List<FuelRecord> findAllByDateRange(@Param("startDate") LocalDateTime startDate,
                                       @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT DISTINCT fr.vehicle.id, SUM(fr.fuelCost) as totalCost FROM FuelRecord fr " +
           "WHERE fr.refuelDate BETWEEN :startDate AND :endDate " +
           "GROUP BY fr.vehicle.id ORDER BY totalCost DESC")
    List<Object[]> getVehiclesFuelCostRanking(@Param("startDate") LocalDateTime startDate,
                                            @Param("endDate") LocalDateTime endDate);
}