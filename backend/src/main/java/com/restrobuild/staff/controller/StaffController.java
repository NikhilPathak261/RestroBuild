package com.restrobuild.staff.controller;

import com.restrobuild.common.ApiResponse;
import com.restrobuild.staff.dto.CreateStaffRequest;
import com.restrobuild.staff.dto.StaffResponse;
import com.restrobuild.staff.dto.UpdateStaffRequest;
import com.restrobuild.staff.service.StaffService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@PreAuthorize("hasAuthority('ROLE_OWNER')")
public class StaffController {

    private final StaffService staffService;

    public StaffController(StaffService staffService) {
        this.staffService = staffService;
    }

    @PostMapping("/api/staff")
    public ResponseEntity<ApiResponse<StaffResponse>> createStaff(@Valid @RequestBody CreateStaffRequest request) {
        StaffResponse response = staffService.createStaff(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Staff member created successfully.", response));
    }

    @GetMapping("/api/staff")
    public ResponseEntity<ApiResponse<List<StaffResponse>>> getStaff() {
        List<StaffResponse> response = staffService.getStaff();
        return ResponseEntity.ok(ApiResponse.success("Staff members fetched successfully.", response));
    }

    @GetMapping("/api/staff/{staffId}")
    public ResponseEntity<ApiResponse<StaffResponse>> getStaffDetails(@PathVariable Long staffId) {
        StaffResponse response = staffService.getStaffDetails(staffId);
        return ResponseEntity.ok(ApiResponse.success("Staff member fetched successfully.", response));
    }

    @PutMapping("/api/staff/{staffId}")
    public ResponseEntity<ApiResponse<StaffResponse>> updateStaff(
            @PathVariable Long staffId,
            @Valid @RequestBody UpdateStaffRequest request
    ) {
        StaffResponse response = staffService.updateStaff(staffId, request);
        return ResponseEntity.ok(ApiResponse.success("Staff member updated successfully.", response));
    }

    @PatchMapping("/api/staff/{staffId}/disable")
    public ResponseEntity<ApiResponse<StaffResponse>> disableStaff(@PathVariable Long staffId) {
        StaffResponse response = staffService.disableStaff(staffId);
        return ResponseEntity.ok(ApiResponse.success("Staff member disabled successfully.", response));
    }

    @PatchMapping("/api/staff/{staffId}/enable")
    public ResponseEntity<ApiResponse<StaffResponse>> enableStaff(@PathVariable Long staffId) {
        StaffResponse response = staffService.enableStaff(staffId);
        return ResponseEntity.ok(ApiResponse.success("Staff member enabled successfully.", response));
    }

    @DeleteMapping("/api/staff/{staffId}")
    public ResponseEntity<ApiResponse<Void>> deleteStaff(@PathVariable Long staffId) {
        staffService.deleteStaff(staffId);
        return ResponseEntity.ok(ApiResponse.success("Staff member deleted successfully."));
    }
}
