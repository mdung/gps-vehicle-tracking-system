package com.gps.tracking.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "speed_reports")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SpeedReport {
    
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;
    
    @Column(name = "report_name", nullable = false)
    private String reportName;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "report_type", nullable = false)
    private ReportType reportType = ReportType.VIOLATION_SUMMARY;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicle_id")
    private Vehicle vehicle;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "driver_id")
    private Driver driver;
    
    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;
    
    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;
    
    @Column(name = "total_violations")
    private Integer totalViolations = 0;
    
    @Column(name = "minor_violations")
    private Integer minorViolations = 0;
    
    @Column(name = "major_violations")
    private Integer majorViolations = 0;
    
    @Column(name = "severe_violations")
    private Integer severeViolations = 0;
    
    @Column(name = "total_distance_km", precision = 10, scale = 2)
    private BigDecimal totalDistanceKm;
    
    @Column(name = "average_speed_kmh", precision = 5, scale = 2)
    private BigDecimal averageSpeedKmh;
    
    @Column(name = "max_speed_kmh", precision = 5, scale = 2)
    private BigDecimal maxSpeedKmh;
    
    @Column(name = "total_fine_amount", precision = 10, scale = 2)
    private BigDecimal totalFineAmount;
    
    @Column(name = "total_points_deducted")
    private Integer totalPointsDeducted = 0;
    
    @Column(name = "report_data", columnDefinition = "TEXT")
    private String reportData;
    
    @Column(name = "generated_by")
    private String generatedBy;
    
    @CreationTimestamp
    @Column(name = "generated_at")
    private LocalDateTime generatedAt;
    
    // Transient fields for API responses
    @Transient
    private String vehicleLicensePlate;
    
    @Transient
    private String driverName;
    
    @Transient
    private Integer criticalViolations = 0;
    
    @Transient
    private BigDecimal complianceRate;
    
    @Transient
    private String riskLevel;
    
    public enum ReportType {
        VIOLATION_SUMMARY,
        DRIVER_BEHAVIOR,
        VEHICLE_PERFORMANCE,
        FLEET_OVERVIEW,
        COMPLIANCE_REPORT,
        INSURANCE_REPORT
    }
    
    // Helper methods
    public BigDecimal getComplianceRate() {
        if (totalViolations == null || totalViolations == 0) {
            return new BigDecimal("100.00");
        }
        
        // Assuming we track total driving time/distance
        // This is a simplified calculation
        int totalRecords = totalViolations * 10; // Estimate based on violations
        double compliance = ((double)(totalRecords - totalViolations) / totalRecords) * 100;
        return new BigDecimal(String.format("%.2f", compliance));
    }
    
    public String getRiskLevel() {
        if (totalViolations == null || totalViolations == 0) {
            return "LOW";
        }
        
        int severe = severeViolations != null ? severeViolations : 0;
        int major = majorViolations != null ? majorViolations : 0;
        
        if (severe > 2 || totalViolations > 10) {
            return "HIGH";
        } else if (major > 3 || totalViolations > 5) {
            return "MEDIUM";
        } else {
            return "LOW";
        }
    }
}