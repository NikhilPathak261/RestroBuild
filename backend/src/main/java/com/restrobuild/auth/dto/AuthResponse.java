package com.restrobuild.auth.dto;

public record AuthResponse(
        String accessToken,
        String refreshToken,
        String role
) {
}
