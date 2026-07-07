package com.restrobuild.staff.service;

import com.restrobuild.auth.entity.UserRole;
import com.restrobuild.auth.repository.OwnerRepository;
import com.restrobuild.exception.BusinessException;
import com.restrobuild.exception.ResourceNotFoundException;
import com.restrobuild.restaurant.entity.Restaurant;
import com.restrobuild.security.AuthenticatedUserService;
import com.restrobuild.staff.dto.CreateStaffRequest;
import com.restrobuild.staff.dto.StaffResponse;
import com.restrobuild.staff.dto.UpdateStaffRequest;
import com.restrobuild.staff.entity.Staff;
import com.restrobuild.staff.mapper.StaffMapper;
import com.restrobuild.staff.repository.StaffRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class StaffService {

    private final StaffRepository staffRepository;
    private final OwnerRepository ownerRepository;
    private final AuthenticatedUserService authenticatedUserService;
    private final PasswordEncoder passwordEncoder;
    private final StaffMapper staffMapper;

    public StaffService(
            StaffRepository staffRepository,
            OwnerRepository ownerRepository,
            AuthenticatedUserService authenticatedUserService,
            PasswordEncoder passwordEncoder,
            StaffMapper staffMapper
    ) {
        this.staffRepository = staffRepository;
        this.ownerRepository = ownerRepository;
        this.authenticatedUserService = authenticatedUserService;
        this.passwordEncoder = passwordEncoder;
        this.staffMapper = staffMapper;
    }

    @Transactional
    public StaffResponse createStaff(CreateStaffRequest request) {
        Restaurant restaurant = authenticatedUserService.getAuthenticatedOwnerRestaurant();
        String email = normalize(request.email());
        ensureEmailAvailable(email, null);

        Staff staff = new Staff(
                restaurant,
                request.name().trim(),
                email,
                passwordEncoder.encode(request.password()),
                parseStaffRole(request.role())
        );

        return staffMapper.toResponse(staffRepository.save(staff));
    }

    @Transactional(readOnly = true)
    public List<StaffResponse> getStaff() {
        Restaurant restaurant = authenticatedUserService.getAuthenticatedOwnerRestaurant();
        return staffRepository.findByRestaurantIdOrderByNameAsc(restaurant.getId())
                .stream()
                .map(staffMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public StaffResponse getStaffDetails(Long staffId) {
        Restaurant restaurant = authenticatedUserService.getAuthenticatedOwnerRestaurant();
        return staffMapper.toResponse(getRestaurantStaff(staffId, restaurant.getId()));
    }

    @Transactional
    public StaffResponse updateStaff(Long staffId, UpdateStaffRequest request) {
        Restaurant restaurant = authenticatedUserService.getAuthenticatedOwnerRestaurant();
        Staff staff = getRestaurantStaff(staffId, restaurant.getId());
        String email = normalize(request.email());
        ensureEmailAvailable(email, staffId);

        staff.update(request.name().trim(), email, parseStaffRole(request.role()));
        return staffMapper.toResponse(staff);
    }

    @Transactional
    public StaffResponse disableStaff(Long staffId) {
        Restaurant restaurant = authenticatedUserService.getAuthenticatedOwnerRestaurant();
        Staff staff = getRestaurantStaff(staffId, restaurant.getId());
        staff.disable();
        return staffMapper.toResponse(staff);
    }

    @Transactional
    public StaffResponse enableStaff(Long staffId) {
        Restaurant restaurant = authenticatedUserService.getAuthenticatedOwnerRestaurant();
        Staff staff = getRestaurantStaff(staffId, restaurant.getId());
        staff.enable();
        return staffMapper.toResponse(staff);
    }

    @Transactional
    public void deleteStaff(Long staffId) {
        Restaurant restaurant = authenticatedUserService.getAuthenticatedOwnerRestaurant();
        Staff staff = getRestaurantStaff(staffId, restaurant.getId());
        staffRepository.delete(staff);
    }

    private void ensureEmailAvailable(String email, Long currentStaffId) {
        boolean ownerExists = ownerRepository.existsByEmailIgnoreCase(email);
        boolean staffExists = currentStaffId == null
                ? staffRepository.existsByEmailIgnoreCase(email)
                : staffRepository.existsByEmailIgnoreCaseAndIdNot(email, currentStaffId);

        if (ownerExists || staffExists) {
            throw new BusinessException("Email already exists.");
        }
    }

    private Staff getRestaurantStaff(Long staffId, Long restaurantId) {
        return staffRepository.findByIdAndRestaurantId(staffId, restaurantId)
                .orElseThrow(() -> new ResourceNotFoundException("Staff member not found."));
    }

    private UserRole parseStaffRole(String role) {
        String normalized = role.trim().toUpperCase();
        if (!normalized.startsWith("ROLE_")) {
            normalized = "ROLE_" + normalized;
        }

        if (!normalized.equals(UserRole.ROLE_KITCHEN.name()) && !normalized.equals(UserRole.ROLE_WAITER.name())) {
            throw new BusinessException("Role must be KITCHEN or WAITER.");
        }

        return UserRole.valueOf(normalized);
    }

    private String normalize(String value) {
        return value.trim().toLowerCase();
    }
}
