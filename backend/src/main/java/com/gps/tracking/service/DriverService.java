package com.gps.tracking.service;

import com.gps.tracking.dto.request.DriverRequest;
import com.gps.tracking.dto.response.DriverResponse;
import com.gps.tracking.entity.Driver;
import com.gps.tracking.exception.ResourceNotFoundException;
import com.gps.tracking.repository.DriverRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DriverService {
    private final DriverRepository driverRepository;

    public List<DriverResponse> getAllDrivers() {
        return driverRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public DriverResponse getDriverById(UUID id) {
        Driver driver = driverRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Driver not found with id: " + id));
        return toResponse(driver);
    }

    @Transactional
    public DriverResponse createDriver(DriverRequest request) {
        if (driverRepository.findByLicenseNumber(request.getLicenseNumber()).isPresent()) {
            throw new IllegalArgumentException("Driver with license number already exists: " + request.getLicenseNumber());
        }
        Driver driver = new Driver();
        driver.setName(request.getName());
        driver.setLicenseNumber(request.getLicenseNumber());
        driver.setPhone(request.getPhone());
        driver.setEmail(request.getEmail());
        driver.setStatus(request.getStatus());
        return toResponse(driverRepository.save(driver));
    }

    @Transactional
    public DriverResponse updateDriver(UUID id, DriverRequest request) {
        Driver driver = driverRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Driver not found with id: " + id));
        
        if (!driver.getLicenseNumber().equals(request.getLicenseNumber())) {
            if (driverRepository.findByLicenseNumber(request.getLicenseNumber()).isPresent()) {
                throw new IllegalArgumentException("Driver with license number already exists: " + request.getLicenseNumber());
            }
        }
        
        driver.setName(request.getName());
        driver.setLicenseNumber(request.getLicenseNumber());
        driver.setPhone(request.getPhone());
        driver.setEmail(request.getEmail());
        driver.setStatus(request.getStatus());
        return toResponse(driverRepository.save(driver));
    }

    @Transactional
    public void deleteDriver(UUID id) {
        if (!driverRepository.existsById(id)) {
            throw new ResourceNotFoundException("Driver not found with id: " + id);
        }
        driverRepository.deleteById(id);
    }

    private DriverResponse toResponse(Driver driver) {
        return new DriverResponse(
                driver.getId(),
                driver.getName(),
                driver.getLicenseNumber(),
                driver.getPhone(),
                driver.getEmail(),
                driver.getStatus(),
                driver.getCreatedAt(),
                driver.getUpdatedAt()
        );
    }
}

