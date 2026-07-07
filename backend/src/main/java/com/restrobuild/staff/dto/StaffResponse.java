package com.restrobuild.staff.dto;

public record StaffResponse(
        Long id,
        String name,
        String email,
        String role,
        boolean active
) {
}
