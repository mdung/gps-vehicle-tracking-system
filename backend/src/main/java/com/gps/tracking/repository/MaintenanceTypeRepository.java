package com.gps.tracking.repository;

import com.gps.tracking.entity.MaintenanceType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface MaintenanceTypeRepository extends JpaRepository<MaintenanceType, UUID> {
    
    Page<MaintenanceType> findByIsActiveTrueOrderByName(Pageable pageable);
    
    List<MaintenanceType> findByIsActiveTrueOrderByName();
    
    List<MaintenanceType> findByCategoryAndIsActiveTrueOrderByName(MaintenanceType.MaintenanceCategory category);
    
    @Query("SELECT mt FROM MaintenanceType mt WHERE mt.isActive = true AND " +
           "(mt.name ILIKE %:searchTerm% OR mt.description ILIKE %:searchTerm%) ORDER BY mt.name")
    Page<MaintenanceType> searchMaintenanceTypes(@Param("searchTerm") String searchTerm, Pageable pageable);
    
    @Query("SELECT DISTINCT mt.category FROM MaintenanceType mt WHERE mt.isActive = true ORDER BY mt.category")
    List<MaintenanceType.MaintenanceCategory> findDistinctCategories();
}