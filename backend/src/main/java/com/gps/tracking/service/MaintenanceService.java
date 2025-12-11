package com.gps.tracking.service;

import com.gps.tracking.entity.*;
import com.gps.tracking.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class MaintenanceService {
    
    private final MaintenanceTypeRepository maintenanceTypeRepository;
    private final MaintenanceScheduleRepository maintenanceScheduleRepository;
    private final MaintenanceRecordRepository maintenanceRecordRepository;
    private final MaintenanceReminderRepository maintenanceReminderRepository;
    private final MaintenanceCostRepository maintenanceCostRepository;
    
    // ===== MAINTENANCE TYPES =====
    
    public Page<MaintenanceType> getAllMaintenanceTypes(Pageable pageable) {
        return maintenanceTypeRepository.findByIsActiveTrueOrderByName(pageable);
    }
    
    public List<MaintenanceType> getAllActiveMaintenanceTypes() {
        return maintenanceTypeRepository.findByIsActiveTrueOrderByName();
    }
    
    public Optional<MaintenanceType> getMaintenanceTypeById(UUID id) {
        return maintenanceTypeRepository.findById(id);
    }
    
    public List<MaintenanceType> getMaintenanceTypesByCategory(MaintenanceType.MaintenanceCategory category) {
        return maintenanceTypeRepository.findByCategoryAndIsActiveTrueOrderByName(category);
    }
    
    public Page<MaintenanceType> searchMaintenanceTypes(String searchTerm, Pageable pageable) {
        return maintenanceTypeRepository.searchMaintenanceTypes(searchTerm, pageable);
    }
    
    public MaintenanceType createMaintenanceType(MaintenanceType maintenanceType) {
        log.info("Creating new maintenance type: {}", maintenanceType.getName());
        return maintenanceTypeRepository.save(maintenanceType);
    }
    
    public MaintenanceType updateMaintenanceType(UUID id, MaintenanceType maintenanceType) {
        MaintenanceType existing = maintenanceTypeRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Maintenance type not found: " + id));
        
        existing.setName(maintenanceType.getName());
        existing.setDescription(maintenanceType.getDescription());
        existing.setCategory(maintenanceType.getCategory());
        existing.setEstimatedDurationHours(maintenanceType.getEstimatedDurationHours());
        existing.setEstimatedCost(maintenanceType.getEstimatedCost());
        existing.setIsActive(maintenanceType.getIsActive());
        
        log.info("Updated maintenance type: {}", existing.getName());
        return maintenanceTypeRepository.save(existing);
    }
    
    public void deleteMaintenanceType(UUID id) {
        MaintenanceType maintenanceType = maintenanceTypeRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Maintenance type not found: " + id));
        
        maintenanceType.setIsActive(false);
        maintenanceTypeRepository.save(maintenanceType);
        log.info("Deactivated maintenance type: {}", maintenanceType.getName());
    }
    
    // ===== MAINTENANCE SCHEDULES =====
    
    public Page<MaintenanceSchedule> getAllMaintenanceSchedules(Pageable pageable) {
        return maintenanceScheduleRepository.findByIsActiveTrueOrderByNextDueDate(pageable);
    }
    
    public Page<MaintenanceSchedule> getMaintenanceSchedulesByVehicle(UUID vehicleId, Pageable pageable) {
        return maintenanceScheduleRepository.findByVehicleIdAndIsActiveTrueOrderByNextDueDate(vehicleId, pageable);
    }
    
    public List<MaintenanceSchedule> getActiveSchedulesByVehicle(UUID vehicleId) {
        return maintenanceScheduleRepository.findByVehicleIdAndIsActiveTrueOrderByNextDueDate(vehicleId);
    }
    
    public Optional<MaintenanceSchedule> getMaintenanceScheduleById(UUID id) {
        return maintenanceScheduleRepository.findById(id);
    }
    
    public List<MaintenanceSchedule> getDueSchedules(LocalDate date) {
        return maintenanceScheduleRepository.findDueSchedules(date);
    }
    
    public List<MaintenanceSchedule> getOverdueSchedules() {
        return maintenanceScheduleRepository.findOverdueSchedules();
    }
    
    public List<MaintenanceSchedule> getSchedulesDueBetween(LocalDate startDate, LocalDate endDate) {
        return maintenanceScheduleRepository.findSchedulesDueBetween(startDate, endDate);
    }
    
    public MaintenanceSchedule createMaintenanceSchedule(MaintenanceSchedule schedule) {
        log.info("Creating maintenance schedule for vehicle: {}", schedule.getVehicle().getId());
        calculateNextDueDate(schedule);
        return maintenanceScheduleRepository.save(schedule);
    }
    
    public MaintenanceSchedule updateMaintenanceSchedule(UUID id, MaintenanceSchedule schedule) {
        MaintenanceSchedule existing = maintenanceScheduleRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Maintenance schedule not found: " + id));
        
        existing.setScheduleType(schedule.getScheduleType());
        existing.setMileageInterval(schedule.getMileageInterval());
        existing.setTimeIntervalDays(schedule.getTimeIntervalDays());
        existing.setLastServiceDate(schedule.getLastServiceDate());
        existing.setLastServiceMileage(schedule.getLastServiceMileage());
        existing.setNotes(schedule.getNotes());
        existing.setIsActive(schedule.getIsActive());
        
        calculateNextDueDate(existing);
        
        log.info("Updated maintenance schedule: {}", existing.getId());
        return maintenanceScheduleRepository.save(existing);
    }
    
    public void deleteMaintenanceSchedule(UUID id) {
        MaintenanceSchedule schedule = maintenanceScheduleRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Maintenance schedule not found: " + id));
        
        schedule.setIsActive(false);
        maintenanceScheduleRepository.save(schedule);
        log.info("Deactivated maintenance schedule: {}", schedule.getId());
    }
    
    private void calculateNextDueDate(MaintenanceSchedule schedule) {
        LocalDate nextDueDate = null;
        Integer nextDueMileage = null;
        
        if (schedule.getScheduleType() == MaintenanceSchedule.ScheduleType.TIME || 
            schedule.getScheduleType() == MaintenanceSchedule.ScheduleType.BOTH) {
            if (schedule.getTimeIntervalDays() != null && schedule.getLastServiceDate() != null) {
                nextDueDate = schedule.getLastServiceDate().plusDays(schedule.getTimeIntervalDays());
            }
        }
        
        if (schedule.getScheduleType() == MaintenanceSchedule.ScheduleType.MILEAGE || 
            schedule.getScheduleType() == MaintenanceSchedule.ScheduleType.BOTH) {
            if (schedule.getMileageInterval() != null && schedule.getLastServiceMileage() != null) {
                nextDueMileage = schedule.getLastServiceMileage() + schedule.getMileageInterval();
            }
        }
        
        schedule.setNextDueDate(nextDueDate);
        schedule.setNextDueMileage(nextDueMileage);
    }
    
    // ===== MAINTENANCE RECORDS =====
    
    public Page<MaintenanceRecord> getAllMaintenanceRecords(Pageable pageable) {
        return maintenanceRecordRepository.findAllByOrderByServiceDateDesc(pageable);
    }
    
    public Page<MaintenanceRecord> getMaintenanceRecordsByVehicle(UUID vehicleId, Pageable pageable) {
        return maintenanceRecordRepository.findByVehicleIdOrderByServiceDateDesc(vehicleId, pageable);
    }
    
    public List<MaintenanceRecord> getMaintenanceHistoryByVehicle(UUID vehicleId) {
        return maintenanceRecordRepository.findByVehicleIdOrderByServiceDateDesc(vehicleId);
    }
    
    public Optional<MaintenanceRecord> getMaintenanceRecordById(UUID id) {
        return maintenanceRecordRepository.findById(id);
    }
    
    public Page<MaintenanceRecord> getMaintenanceRecordsByDateRange(LocalDate startDate, LocalDate endDate, Pageable pageable) {
        return maintenanceRecordRepository.findByServiceDateBetween(startDate, endDate, pageable);
    }
    
    public Page<MaintenanceRecord> getMaintenanceRecordsByStatus(MaintenanceRecord.MaintenanceStatus status, Pageable pageable) {
        return maintenanceRecordRepository.findByStatusOrderByServiceDateDesc(status, pageable);
    }
    
    public MaintenanceRecord createMaintenanceRecord(MaintenanceRecord record) {
        log.info("Creating maintenance record for vehicle: {}", record.getVehicle().getId());
        
        // Calculate total cost
        record.calculateTotalCost();
        
        MaintenanceRecord savedRecord = maintenanceRecordRepository.save(record);
        
        // Update related schedule if exists
        if (record.getMaintenanceSchedule() != null) {
            updateScheduleAfterService(record.getMaintenanceSchedule(), record);
        }
        
        return savedRecord;
    }
    
    public MaintenanceRecord updateMaintenanceRecord(UUID id, MaintenanceRecord record) {
        MaintenanceRecord existing = maintenanceRecordRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Maintenance record not found: " + id));
        
        existing.setServiceDate(record.getServiceDate());
        existing.setServiceMileage(record.getServiceMileage());
        existing.setServiceProvider(record.getServiceProvider());
        existing.setTechnicianName(record.getTechnicianName());
        existing.setLaborCost(record.getLaborCost());
        existing.setPartsCost(record.getPartsCost());
        existing.setDurationHours(record.getDurationHours());
        existing.setStatus(record.getStatus());
        existing.setPriority(record.getPriority());
        existing.setDescription(record.getDescription());
        existing.setNotes(record.getNotes());
        existing.setWarrantyExpiryDate(record.getWarrantyExpiryDate());
        existing.setReceiptNumber(record.getReceiptNumber());
        
        existing.calculateTotalCost();
        
        log.info("Updated maintenance record: {}", existing.getId());
        return maintenanceRecordRepository.save(existing);
    }
    
    public void deleteMaintenanceRecord(UUID id) {
        maintenanceRecordRepository.deleteById(id);
        log.info("Deleted maintenance record: {}", id);
    }
    
    private void updateScheduleAfterService(MaintenanceSchedule schedule, MaintenanceRecord record) {
        schedule.setLastServiceDate(record.getServiceDate());
        schedule.setLastServiceMileage(record.getServiceMileage());
        calculateNextDueDate(schedule);
        maintenanceScheduleRepository.save(schedule);
        
        // Create new reminder if needed
        createMaintenanceReminder(schedule);
    }
    
    // ===== MAINTENANCE REMINDERS =====
    
    public Page<MaintenanceReminder> getAllMaintenanceReminders(Pageable pageable) {
        return maintenanceReminderRepository.findAllByOrderByDueDateAsc(pageable);
    }
    
    public List<MaintenanceReminder> getUnacknowledgedReminders() {
        return maintenanceReminderRepository.findByIsAcknowledgedFalseOrderByDueDateAsc();
    }
    
    public List<MaintenanceReminder> getOverdueReminders() {
        return maintenanceReminderRepository.findOverdueReminders();
    }
    
    public List<MaintenanceReminder> getUpcomingReminders(int days) {
        LocalDate endDate = LocalDate.now().plusDays(days);
        return maintenanceReminderRepository.findUpcomingReminders(endDate);
    }
    
    public List<MaintenanceReminder> getRemindersByVehicle(UUID vehicleId) {
        return maintenanceReminderRepository.findByVehicleIdOrderByDueDateAsc(vehicleId);
    }
    
    public MaintenanceReminder acknowledgeReminder(UUID reminderId, String acknowledgedBy) {
        MaintenanceReminder reminder = maintenanceReminderRepository.findById(reminderId)
            .orElseThrow(() -> new RuntimeException("Maintenance reminder not found: " + reminderId));
        
        reminder.setIsAcknowledged(true);
        reminder.setAcknowledgedBy(acknowledgedBy);
        reminder.setAcknowledgedAt(LocalDateTime.now());
        
        log.info("Acknowledged maintenance reminder: {} by {}", reminderId, acknowledgedBy);
        return maintenanceReminderRepository.save(reminder);
    }
    
    public void createMaintenanceReminder(MaintenanceSchedule schedule) {
        if (schedule.getNextDueDate() != null) {
            MaintenanceReminder reminder = new MaintenanceReminder();
            reminder.setVehicle(schedule.getVehicle());
            reminder.setMaintenanceSchedule(schedule);
            reminder.setDueDate(schedule.getNextDueDate());
            reminder.setDueMileage(schedule.getNextDueMileage());
            
            // Determine reminder type and date
            LocalDate today = LocalDate.now();
            LocalDate reminderDate = schedule.getNextDueDate().minusDays(7); // 7 days before due
            
            if (schedule.getNextDueDate().isBefore(today)) {
                reminder.setReminderType(MaintenanceReminder.ReminderType.OVERDUE);
                reminder.setPriority(MaintenanceReminder.MaintenancePriority.HIGH);
                reminder.setReminderDate(today);
                reminder.setDaysOverdue((int) java.time.temporal.ChronoUnit.DAYS.between(schedule.getNextDueDate(), today));
            } else if (schedule.getNextDueDate().isEqual(today)) {
                reminder.setReminderType(MaintenanceReminder.ReminderType.DUE_TODAY);
                reminder.setPriority(MaintenanceReminder.MaintenancePriority.HIGH);
                reminder.setReminderDate(today);
            } else {
                reminder.setReminderType(MaintenanceReminder.ReminderType.DUE_SOON);
                reminder.setPriority(MaintenanceReminder.MaintenancePriority.MEDIUM);
                reminder.setReminderDate(reminderDate.isBefore(today) ? today : reminderDate);
            }
            
            reminder.setMessage(generateReminderMessage(schedule, reminder));
            
            maintenanceReminderRepository.save(reminder);
            log.info("Created maintenance reminder for schedule: {}", schedule.getId());
        }
    }
    
    private String generateReminderMessage(MaintenanceSchedule schedule, MaintenanceReminder reminder) {
        StringBuilder message = new StringBuilder();
        message.append(schedule.getMaintenanceType().getName());
        
        if (reminder.getReminderType() == MaintenanceReminder.ReminderType.OVERDUE) {
            message.append(" is overdue");
            if (reminder.getDaysOverdue() > 0) {
                message.append(" by ").append(reminder.getDaysOverdue()).append(" days");
            }
        } else if (reminder.getReminderType() == MaintenanceReminder.ReminderType.DUE_TODAY) {
            message.append(" is due today");
        } else {
            message.append(" is due soon");
        }
        
        if (schedule.getNextDueMileage() != null) {
            message.append(" at ").append(schedule.getNextDueMileage()).append(" miles");
        }
        
        return message.toString();
    }
    
    // ===== MAINTENANCE COSTS =====
    
    public List<MaintenanceCost> getCostsByMaintenanceRecord(UUID recordId) {
        return maintenanceCostRepository.findByMaintenanceRecordIdOrderByCreatedAtAsc(recordId);
    }
    
    public MaintenanceCost createMaintenanceCost(MaintenanceCost cost) {
        cost.calculateTotalCost();
        log.info("Creating maintenance cost: {} for record: {}", 
                cost.getItemName(), cost.getMaintenanceRecord().getId());
        return maintenanceCostRepository.save(cost);
    }
    
    public MaintenanceCost updateMaintenanceCost(UUID id, MaintenanceCost cost) {
        MaintenanceCost existing = maintenanceCostRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Maintenance cost not found: " + id));
        
        existing.setCostType(cost.getCostType());
        existing.setItemName(cost.getItemName());
        existing.setQuantity(cost.getQuantity());
        existing.setUnitCost(cost.getUnitCost());
        existing.setSupplier(cost.getSupplier());
        existing.setPartNumber(cost.getPartNumber());
        existing.setWarrantyMonths(cost.getWarrantyMonths());
        existing.setNotes(cost.getNotes());
        
        existing.calculateTotalCost();
        
        log.info("Updated maintenance cost: {}", existing.getId());
        return maintenanceCostRepository.save(existing);
    }
    
    public void deleteMaintenanceCost(UUID id) {
        maintenanceCostRepository.deleteById(id);
        log.info("Deleted maintenance cost: {}", id);
    }
    
    // ===== ANALYTICS AND REPORTS =====
    
    public BigDecimal getTotalMaintenanceCostByVehicle(UUID vehicleId, LocalDate startDate, LocalDate endDate) {
        return maintenanceRecordRepository.getTotalCostByVehicleAndDateRange(vehicleId, startDate, endDate);
    }
    
    public BigDecimal getTotalMaintenanceCostByDateRange(LocalDate startDate, LocalDate endDate) {
        return maintenanceRecordRepository.getTotalCostByDateRange(startDate, endDate);
    }
    
    public Long getMaintenanceCountByVehicle(UUID vehicleId) {
        return maintenanceRecordRepository.countByVehicleId(vehicleId);
    }
    
    public Long getUnacknowledgedReminderCount() {
        return maintenanceReminderRepository.countOverdueReminders();
    }
    
    public List<String> getDistinctSuppliers() {
        return maintenanceCostRepository.findDistinctSuppliers();
    }
    
    // ===== BATCH OPERATIONS =====
    
    public void generateRemindersForAllSchedules() {
        log.info("Generating reminders for all active schedules");
        List<MaintenanceSchedule> activeSchedules = maintenanceScheduleRepository.findByIsActiveTrueOrderByNextDueDate(null).getContent();
        
        for (MaintenanceSchedule schedule : activeSchedules) {
            // Check if reminder already exists
            List<MaintenanceReminder> existingReminders = maintenanceReminderRepository.findByMaintenanceSchedule(schedule.getId());
            boolean hasUnacknowledgedReminder = existingReminders.stream()
                .anyMatch(r -> !r.getIsAcknowledged());
            
            if (!hasUnacknowledgedReminder) {
                createMaintenanceReminder(schedule);
            }
        }
        
        log.info("Completed generating reminders for all schedules");
    }
    
    public void updateOverdueReminders() {
        log.info("Updating overdue reminders");
        List<MaintenanceReminder> reminders = maintenanceReminderRepository.findByIsAcknowledgedFalseOrderByDueDateAsc();
        
        for (MaintenanceReminder reminder : reminders) {
            LocalDate today = LocalDate.now();
            if (reminder.getDueDate().isBefore(today)) {
                reminder.setReminderType(MaintenanceReminder.ReminderType.OVERDUE);
                reminder.setPriority(MaintenanceReminder.MaintenancePriority.HIGH);
                reminder.setDaysOverdue((int) java.time.temporal.ChronoUnit.DAYS.between(reminder.getDueDate(), today));
                
                if (reminder.getDaysOverdue() > 30) {
                    reminder.setReminderType(MaintenanceReminder.ReminderType.CRITICAL_OVERDUE);
                    reminder.setPriority(MaintenanceReminder.MaintenancePriority.CRITICAL);
                }
                
                maintenanceReminderRepository.save(reminder);
            }
        }
        
        log.info("Completed updating overdue reminders");
    }
}