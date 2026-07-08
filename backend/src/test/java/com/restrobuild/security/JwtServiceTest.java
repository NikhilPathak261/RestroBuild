package com.restrobuild.security;

import org.junit.jupiter.api.Test;
import org.springframework.security.core.userdetails.User;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class JwtServiceTest {

    private static final String SECRET = "test-secret-value-with-enough-length-for-hmac-signing";

    private final JwtService jwtService = new JwtService(SECRET, 900000, 604800000);

    @Test
    void validatesAccessAndRefreshTokensSeparately() {
        String accessToken = jwtService.generateAccessToken("owner@test.local", "ROLE_OWNER");
        String refreshToken = jwtService.generateRefreshToken("owner@test.local", "ROLE_OWNER");
        var userDetails = User
                .withUsername("owner@test.local")
                .password("password")
                .authorities("ROLE_OWNER")
                .build();

        assertEquals("owner@test.local", jwtService.extractSubject(accessToken));
        assertEquals("ROLE_OWNER", jwtService.extractRole(accessToken));
        assertTrue(jwtService.isAccessTokenValid(accessToken, userDetails));
        assertFalse(jwtService.isRefreshTokenValid(accessToken, userDetails));
        assertTrue(jwtService.isRefreshTokenValid(refreshToken, userDetails));
        assertFalse(jwtService.isAccessTokenValid(refreshToken, userDetails));
    }
}
