package com.gps.tracking.repository;

import com.gps.tracking.entity.SpeedReport;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface SpeedReportRepository extends JpaRepository<SpeedReport, UUID> {
    
    Page<SpeedReport> findByOrderByGeneratedAtDesc(Pageable pageable);
    
    Page<SpeedReport> findByReportTypeOrderByGeneratedAtDesc(SpeedReport.ReportType reportType, Pageable pageable);
    
    Page<SpeedReport> findByVehicleIdOrderByGeneratedAtDesc(UUID vehicleId, Pageable pageable);
    
    Page<SpeedReport> findByDriverIdOrderByGeneratedAtDesc(UUID driverId, Pageable pageable);
    
    @Query("SELECT sr FROM SpeedReport sr WHERE sr.startDate >= :startDate AND sr.endDate <= :endDate " +
           "ORDER BY sr.generatedAt DESC")
    Page<SpeedReport> findByDateRangeOverlap(
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate,
        Pageable pageable
    );
    
    @Query("SELECT sr FROM SpeedReport sr WHERE sr.vehicle.id = :vehicleId AND " +
           "sr.startDate >= :startDate AND sr.endDate <= :endDate ORDER BY sr.generatedAt DESC")
    List<SpeedReport> findByVehicleIdAndDateRange(
        @Param("vehicleId") UUID vehicleId,
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate
    );
    
    @Query("SELECT sr FROM SpeedReport sr WHERE sr.driver.id = :driverId AND " +
           "sr.startDate >= :startDate AND sr.endDate <= :endDate ORDER BY sr.generatedAt DESC")
    List<SpeedReport> findByDriverIdAndDateRange(
        @Param("driverId") UUID driverId,
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate
    );
    
    @Query("SELECT sr FROM SpeedReport sr WHERE sr.generatedAt >= :since ORDER BY sr.generatedAt DESC")
    List<SpeedReport> findRecentReports(@Param("since") LocalDateTime since);
    
    @Query("SELECT sr FROM SpeedReport sr WHERE sr.reportName ILIKE %:searchTerm% OR " +
           "sr.generatedBy ILIKE %:searchTerm% ORDER BY sr.generatedAt DESC")
    Page<SpeedReport> searchReports(@Param("searchTerm") String searchTerm, Pageable pageable);
}