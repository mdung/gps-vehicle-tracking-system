package com.gps.tracking.controller;

import com.gps.tracking.entity.*;
import com.gps.tracking.service.MaintenanceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/maintenance")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class MaintenanceController {
    
    private final MaintenanceService maintenanceService;
    
    // ===== MAINTENANCE TYPES =====
    
    @GetMapping("/types")
    public ResponseEntity<Page<MaintenanceType>> getAllMaintenanceTypes(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(maintenanceService.getAllMaintenanceTypes(pageable));
    }
    
    @GetMapping("/types/active")
    public ResponseEntity<List<MaintenanceType>> getAllActiveMaintenanceTypes() {
        return ResponseEntity.ok(maintenanceService.getAllActiveMaintenanceTypes());
    }
    
    @GetMapping("/types/{id}")
    public ResponseEntity<MaintenanceType> getMaintenanceTypeById(@PathVariable UUID id) {
        return maintenanceService.getMaintenanceTypeById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/types/category/{category}")
    public ResponseEntity<List<MaintenanceType>> getMaintenanceTypesByCategory(
            @PathVariable MaintenanceType.MaintenanceCategory category) {
        return ResponseEntity.ok(maintenanceService.getMaintenanceTypesByCategory(category));
    }
    
    @GetMapping("/types/search")
    public ResponseEntity<Page<MaintenanceType>> searchMaintenanceTypes(
            @RequestParam String searchTerm,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(maintenanceService.searchMaintenanceTypes(searchTerm, pageable));
    }
    
    @PostMapping("/types")
    public ResponseEntity<MaintenanceType> createMaintenanceType(@RequestBody MaintenanceType maintenanceType) {
        return ResponseEntity.ok(maintenanceService.createMaintenanceType(maintenanceType));
    }
    
    @PutMapping("/types/{id}")
    public ResponseEntity<MaintenanceType> updateMaintenanceType(
            @PathVariable UUID id, 
            @RequestBody MaintenanceType maintenanceType) {
        return ResponseEntity.ok(maintenanceService.updateMaintenanceType(id, maintenanceType));
    }
    
    @DeleteMapping("/types/{id}")
    public ResponseEntity<Void> deleteMaintenanceType(@PathVariable UUID id) {
        maintenanceService.deleteMaintenanceType(id);
        return ResponseEntity.ok().build();
    }
    
    // ===== MAINTENANCE SCHEDULES =====
    
    @GetMapping("/schedules")
    public ResponseEntity<Page<MaintenanceSchedule>> getAllMaintenanceSchedules(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(maintenanceService.getAllMaintenanceSchedules(pageable));
    }
    
    @GetMapping("/schedules/vehicle/{vehicleId}")
    public ResponseEntity<Page<MaintenanceSchedule>> getMaintenanceSchedulesByVehicle(
            @PathVariable UUID vehicleId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(maintenanceService.getMaintenanceSchedulesByVehicle(vehicleId, pageable));
    }
    
    @GetMapping("/schedules/vehicle/{vehicleId}/active")
    public ResponseEntity<List<MaintenanceSchedule>> getActiveSchedulesByVehicle(@PathVariable UUID vehicleId) {
        return ResponseEntity.ok(maintenanceService.getActiveSchedulesByVehicle(vehicleId));
    }
    
    @GetMapping("/schedules/{id}")
    public ResponseEntity<MaintenanceSchedule> getMaintenanceScheduleById(@PathVariable UUID id) {
        return maintenanceService.getMaintenanceScheduleById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/schedules/due")
    public ResponseEntity<List<MaintenanceSchedule>> getDueSchedules(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(maintenanceService.getDueSchedules(date));
    }
    
    @GetMapping("/schedules/overdue")
    public ResponseEntity<List<MaintenanceSchedule>> getOverdueSchedules() {
        return ResponseEntity.ok(maintenanceService.getOverdueSchedules());
    }
    
    @GetMapping("/schedules/due-between")
    public ResponseEntity<List<MaintenanceSchedule>> getSchedulesDueBetween(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(maintenanceService.getSchedulesDueBetween(startDate, endDate));
    }
    
    @PostMapping("/schedules")
    public ResponseEntity<MaintenanceSchedule> createMaintenanceSchedule(@RequestBody MaintenanceSchedule schedule) {
        return ResponseEntity.ok(maintenanceService.createMaintenanceSchedule(schedule));
    }
    
    @PutMapping("/schedules/{id}")
    public ResponseEntity<MaintenanceSchedule> updateMaintenanceSchedule(
            @PathVariable UUID id, 
            @RequestBody MaintenanceSchedule schedule) {
        return ResponseEntity.ok(maintenanceService.updateMaintenanceSchedule(id, schedule));
    }
    
    @DeleteMapping("/schedules/{id}")
    public ResponseEntity<Void> deleteMaintenanceSchedule(@PathVariable UUID id) {
        maintenanceService.deleteMaintenanceSchedule(id);
        return ResponseEntity.ok().build();
    }
    
    // ===== MAINTENANCE RECORDS =====
    
    @GetMapping("/records")
    public ResponseEntity<Page<MaintenanceRecord>> getAllMaintenanceRecords(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(maintenanceService.getAllMaintenanceRecords(pageable));
    }
    
    @GetMapping("/records/vehicle/{vehicleId}")
    public ResponseEntity<Page<MaintenanceRecord>> getMaintenanceRecordsByVehicle(
            @PathVariable UUID vehicleId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(maintenanceService.getMaintenanceRecordsByVehicle(vehicleId, pageable));
    }
    
    @GetMapping("/records/vehicle/{vehicleId}/history")
    public ResponseEntity<List<MaintenanceRecord>> getMaintenanceHistoryByVehicle(@PathVariable UUID vehicleId) {
        return ResponseEntity.ok(maintenanceService.getMaintenanceHistoryByVehicle(vehicleId));
    }
    
    @GetMapping("/records/{id}")
    public ResponseEntity<MaintenanceRecord> getMaintenanceRecordById(@PathVariable UUID id) {
        return maintenanceService.getMaintenanceRecordById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/records/date-range")
    public ResponseEntity<Page<MaintenanceRecord>> getMaintenanceRecordsByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(maintenanceService.getMaintenanceRecordsByDateRange(startDate, endDate, pageable));
    }
    
    @GetMapping("/records/status/{status}")
    public ResponseEntity<Page<MaintenanceRecord>> getMaintenanceRecordsByStatus(
            @PathVariable MaintenanceRecord.MaintenanceStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(maintenanceService.getMaintenanceRecordsByStatus(status, pageable));
    }
    
    @PostMapping("/records")
    public ResponseEntity<MaintenanceRecord> createMaintenanceRecord(@RequestBody MaintenanceRecord record) {
        return ResponseEntity.ok(maintenanceService.createMaintenanceRecord(record));
    }
    
    @PutMapping("/records/{id}")
    public ResponseEntity<MaintenanceRecord> updateMaintenanceRecord(
            @PathVariable UUID id, 
            @RequestBody MaintenanceRecord record) {
        return ResponseEntity.ok(maintenanceService.updateMaintenanceRecord(id, record));
    }
    
    @DeleteMapping("/records/{id}")
    public ResponseEntity<Void> deleteMaintenanceRecord(@PathVariable UUID id) {
        maintenanceService.deleteMaintenanceRecord(id);
        return ResponseEntity.ok().build();
    }
    
    // ===== MAINTENANCE REMINDERS =====
    
    @GetMapping("/reminders")
    public ResponseEntity<Page<MaintenanceReminder>> getAllMaintenanceReminders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(maintenanceService.getAllMaintenanceReminders(pageable));
    }
    
    @GetMapping("/reminders/unacknowledged")
    public ResponseEntity<List<MaintenanceReminder>> getUnacknowledgedReminders() {
        return ResponseEntity.ok(maintenanceService.getUnacknowledgedReminders());
    }
    
    @GetMapping("/reminders/overdue")
    public ResponseEntity<List<MaintenanceReminder>> getOverdueReminders() {
        return ResponseEntity.ok(maintenanceService.getOverdueReminders());
    }
    
    @GetMapping("/reminders/upcoming")
    public ResponseEntity<List<MaintenanceReminder>> getUpcomingReminders(
            @RequestParam(defaultValue = "30") int days) {
        return ResponseEntity.ok(maintenanceService.getUpcomingReminders(days));
    }
    
    @GetMapping("/reminders/vehicle/{vehicleId}")
    public ResponseEntity<List<MaintenanceReminder>> getRemindersByVehicle(@PathVariable UUID vehicleId) {
        return ResponseEntity.ok(maintenanceService.getRemindersByVehicle(vehicleId));
    }
    
    @PutMapping("/reminders/{id}/acknowledge")
    public ResponseEntity<MaintenanceReminder> acknowledgeReminder(
            @PathVariable UUID id,
            @RequestParam String acknowledgedBy) {
        return ResponseEntity.ok(maintenanceService.acknowledgeReminder(id, acknowledgedBy));
    }
    
    // ===== MAINTENANCE COSTS =====
    
    @GetMapping("/costs/record/{recordId}")
    public ResponseEntity<List<MaintenanceCost>> getCostsByMaintenanceRecord(@PathVariable UUID recordId) {
        return ResponseEntity.ok(maintenanceService.getCostsByMaintenanceRecord(recordId));
    }
    
    @PostMapping("/costs")
    public ResponseEntity<MaintenanceCost> createMaintenanceCost(@RequestBody MaintenanceCost cost) {
        return ResponseEntity.ok(maintenanceService.createMaintenanceCost(cost));
    }
    
    @PutMapping("/costs/{id}")
    public ResponseEntity<MaintenanceCost> updateMaintenanceCost(
            @PathVariable UUID id, 
            @RequestBody MaintenanceCost cost) {
        return ResponseEntity.ok(maintenanceService.updateMaintenanceCost(id, cost));
    }
    
    @DeleteMapping("/costs/{id}")
    public ResponseEntity<Void> deleteMaintenanceCost(@PathVariable UUID id) {
        maintenanceService.deleteMaintenanceCost(id);
        return ResponseEntity.ok().build();
    }
    
    // ===== ANALYTICS AND REPORTS =====
    
    @GetMapping("/analytics/cost/vehicle/{vehicleId}")
    public ResponseEntity<BigDecimal> getTotalMaintenanceCostByVehicle(
            @PathVariable UUID vehicleId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(maintenanceService.getTotalMaintenanceCostByVehicle(vehicleId, startDate, endDate));
    }
    
    @GetMapping("/analytics/cost/total")
    public ResponseEntity<BigDecimal> getTotalMaintenanceCostByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(maintenanceService.getTotalMaintenanceCostByDateRange(startDate, endDate));
    }
    
    @GetMapping("/analytics/count/vehicle/{vehicleId}")
    public ResponseEntity<Long> getMaintenanceCountByVehicle(@PathVariable UUID vehicleId) {
        return ResponseEntity.ok(maintenanceService.getMaintenanceCountByVehicle(vehicleId));
    }
    
    @GetMapping("/analytics/reminders/unacknowledged/count")
    public ResponseEntity<Long> getUnacknowledgedReminderCount() {
        return ResponseEntity.ok(maintenanceService.getUnacknowledgedReminderCount());
    }
    
    @GetMapping("/analytics/suppliers")
    public ResponseEntity<List<String>> getDistinctSuppliers() {
        return ResponseEntity.ok(maintenanceService.getDistinctSuppliers());
    }
    
    // ===== BATCH OPERATIONS =====
    
    @PostMapping("/batch/generate-reminders")
    public ResponseEntity<Void> generateRemindersForAllSchedules() {
        maintenanceService.generateRemindersForAllSchedules();
        return ResponseEntity.ok().build();
    }
    
    @PostMapping("/batch/update-overdue-reminders")
    public ResponseEntity<Void> updateOverdueReminders() {
        maintenanceService.updateOverdueReminders();
        return ResponseEntity.ok().build();
    }
}