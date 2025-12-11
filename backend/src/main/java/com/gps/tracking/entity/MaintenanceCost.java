package com.gps.tracking.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "maintenance_costs")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MaintenanceCost {
    
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "maintenance_record_id", nullable = false)
    private MaintenanceRecord maintenanceRecord;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "cost_type", nullable = false)
    private CostType costType;
    
    @Column(name = "item_name", nullable = false)
    private String itemName;
    
    @Column(precision = 8, scale = 2)
    private BigDecimal quantity = BigDecimal.ONE;
    
    @Column(name = "unit_cost", nullable = false, precision = 10, scale = 2)
    private BigDecimal unitCost;
    
    @Column(name = "total_cost", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalCost;
    
    private String supplier;
    
    @Column(name = "part_number")
    private String partNumber;
    
    @Column(name = "warranty_months")
    private Integer warrantyMonths = 0;
    
    @Column(length = 500)
    private String notes;
    
    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    public enum CostType {
        LABOR,
        PARTS,
        FLUIDS,
        CONSUMABLES,
        TOOLS,
        EQUIPMENT_RENTAL,
        TOWING,
        DIAGNOSTIC,
        DISPOSAL,
        OTHER
    }
    
    // Helper methods
    public void calculateTotalCost() {
        if (quantity != null && unitCost != null) {
            this.totalCost = quantity.multiply(unitCost);
        }
    }
}