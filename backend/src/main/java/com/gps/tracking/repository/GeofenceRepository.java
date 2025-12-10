package com.gps.tracking.repository;

import com.gps.tracking.entity.Geofence;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface GeofenceRepository extends JpaRepository<Geofence, UUID> {
    
    List<Geofence> findByIsActiveTrue();
    
    Page<Geofence> findByIsActiveTrueOrderByNameAsc(Pageable pageable);
    
    List<Geofence> findByTypeAndIsActiveTrue(Geofence.GeofenceType type);
    
    @Query("SELECT g FROM Geofence g WHERE g.isActive = true AND g.name LIKE %:name%")
    List<Geofence> findByNameContainingAndIsActiveTrue(@Param("name") String name);
    
    @Query("SELECT COUNT(g) FROM Geofence g WHERE g.isActive = true")
    Long countActiveGeofences();
    
    @Query("SELECT g FROM Geofence g WHERE g.isActive = true AND " +
           "g.shape = 'CIRCLE' AND " +
           "(6371000 * acos(cos(radians(:latitude)) * cos(radians(g.centerLatitude)) * " +
           "cos(radians(g.centerLongitude) - radians(:longitude)) + " +
           "sin(radians(:latitude)) * sin(radians(g.centerLatitude)))) <= g.radiusMeters")
    List<Geofence> findGeofencesContainingPoint(@Param("latitude") Double latitude, 
                                               @Param("longitude") Double longitude);
}