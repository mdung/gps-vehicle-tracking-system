package com.gps.tracking.repository;

import com.gps.tracking.entity.MaintenanceReminder;
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
public interface MaintenanceReminderRepository extends JpaRepository<MaintenanceReminder, UUID> {
    
    Page<MaintenanceReminder> findAllByOrderByDueDateAsc(Pageable pageable);
    
    Page<MaintenanceReminder> findByVehicleIdOrderByDueDateAsc(UUID vehicleId, Pageable pageable);
    
    List<MaintenanceReminder> findByVehicleIdOrderByDueDateAsc(UUID vehicleId);
    
    Page<MaintenanceReminder> findByIsAcknowledgedFalseOrderByDueDateAsc(Pageable pageable);
    
    List<MaintenanceReminder> findByIsAcknowledgedFalseOrderByDueDateAsc();
    
    @Query("SELECT mr FROM MaintenanceReminder mr WHERE mr.isAcknowledged = false AND " +
           "mr.dueDate <= CURRENT_DATE ORDER BY mr.dueDate ASC")
    List<MaintenanceReminder> findOverdueReminders();
    
    @Query("SELECT mr FROM MaintenanceReminder mr WHERE mr.isAcknowledged = false AND " +
           "mr.dueDate BETWEEN CURRENT_DATE AND :endDate ORDER BY mr.dueDate ASC")
    List<MaintenanceReminder> findUpcomingReminders(@Param("endDate") LocalDate endDate);
    
    @Query("SELECT mr FROM MaintenanceReminder mr WHERE mr.vehicle.id = :vehicleId AND " +
           "mr.isAcknowledged = false ORDER BY mr.dueDate ASC")
    List<MaintenanceReminder> findUnacknowledgedByVehicle(@Param("vehicleId") UUID vehicleId);
    
    Page<MaintenanceReminder> findByReminderTypeOrderByDueDateAsc(
        MaintenanceReminder.ReminderType reminderType, 
        Pageable pageable
    );
    
    Page<MaintenanceReminder> findByPriorityOrderByDueDateAsc(
        MaintenanceReminder.MaintenancePriority priority, 
        Pageable pageable
    );
    
    @Query("SELECT COUNT(mr) FROM MaintenanceReminder mr WHERE mr.vehicle.id = :vehicleId AND " +
           "mr.isAcknowledged = false")
    Long countUnacknowledgedByVehicle(@Param("vehicleId") UUID vehicleId);
    
    @Query("SELECT COUNT(mr) FROM MaintenanceReminder mr WHERE mr.isAcknowledged = false AND " +
           "mr.dueDate <= CURRENT_DATE")
    Long countOverdueReminders();
    
    @Query("SELECT mr FROM MaintenanceReminder mr WHERE mr.maintenanceSchedule.id = :scheduleId " +
           "ORDER BY mr.dueDate DESC")
    List<MaintenanceReminder> findByMaintenanceSchedule(@Param("scheduleId") UUID scheduleId);
}