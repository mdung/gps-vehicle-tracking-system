package com.gps.tracking.repository;

import com.gps.tracking.entity.FuelEfficiency;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface FuelEfficiencyRepository extends JpaRepository<FuelEfficiency, UUID> {
    
    Page<FuelEfficiency> findByVehicleIdOrderByPeriodEndDesc(UUID vehicleId, Pageable pageable);
    
    Page<FuelEfficiency> findByDriverIdOrderByPeriodEndDesc(UUID driverId, Pageable pageable);
    
    List<FuelEfficiency> findByVehicleIdAndCalculationPeriodOrderByPeriodEndDesc(
            UUID vehicleId, FuelEfficiency.CalculationPeriod period);
    
    Optional<FuelEfficiency> findByVehicleIdAndPeriodStartAndPeriodEndAndCalculationPeriod(
            UUID vehicleId, LocalDate periodStart, LocalDate periodEnd, 
            FuelEfficiency.CalculationPeriod calculationPeriod);
    
    @Query("SELECT fe FROM FuelEfficiency fe WHERE fe.periodStart >= :startDate " +
           "AND fe.periodEnd <= :endDate ORDER BY fe.fuelEfficiencyKmPerLiter ASC")
    List<FuelEfficiency> findLeastEfficientVehicles(@Param("startDate") LocalDate startDate,
                                                   @Param("endDate") LocalDate endDate);
    
    @Query("SELECT fe FROM FuelEfficiency fe WHERE fe.periodStart >= :startDate " +
           "AND fe.periodEnd <= :endDate ORDER BY fe.fuelEfficiencyKmPerLiter DESC")
    List<FuelEfficiency> findMostEfficientVehicles(@Param("startDate") LocalDate startDate,
                                                  @Param("endDate") LocalDate endDate);
    
    @Query("SELECT AVG(fe.fuelEfficiencyKmPerLiter) FROM FuelEfficiency fe " +
           "WHERE fe.calculationPeriod = :period AND fe.periodStart >= :startDate " +
           "AND fe.periodEnd <= :endDate")
    BigDecimal getAverageEfficiencyByPeriod(@Param("period") FuelEfficiency.CalculationPeriod period,
                                          @Param("startDate") LocalDate startDate,
                                          @Param("endDate") LocalDate endDate);
    
    @Query("SELECT fe FROM FuelEfficiency fe WHERE fe.calculationPeriod = :period " +
           "AND fe.periodStart >= :startDate AND fe.periodEnd <= :endDate " +
           "ORDER BY fe.costPerKm DESC")
    List<FuelEfficiency> findHighestCostPerKmVehicles(@Param("period") FuelEfficiency.CalculationPeriod period,
                                                     @Param("startDate") LocalDate startDate,
                                                     @Param("endDate") LocalDate endDate);
}