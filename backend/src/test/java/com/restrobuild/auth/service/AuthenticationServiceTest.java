package com.restrobuild.auth.service;

import com.restrobuild.auth.dto.LoginRequest;
import com.restrobuild.auth.entity.Owner;
import com.restrobuild.auth.repository.OwnerRepository;
import com.restrobuild.security.JwtService;
import com.restrobuild.staff.repository.StaffRepository;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class AuthenticationServiceTest {

    private final OwnerRepository ownerRepository = mock(OwnerRepository.class);
    private final StaffRepository staffRepository = mock(StaffRepository.class);
    private final PasswordEncoder passwordEncoder = mock(PasswordEncoder.class);
    private final JwtService jwtService = mock(JwtService.class);
    private final AuthenticationService service = new AuthenticationService(
            ownerRepository,
            staffRepository,
            passwordEncoder,
            jwtService
    );

    @Test
    void loginRejectsInactiveOwnerBeforeIssuingTokens() {
        Owner owner = new Owner("Owner", "owner@test.local", "hash");
        ReflectionTestUtils.setField(owner, "active", false);
        when(ownerRepository.findByEmailIgnoreCase("owner@test.local")).thenReturn(Optional.of(owner));
        when(passwordEncoder.matches("password", "hash")).thenReturn(true);

        assertThrows(BadCredentialsException.class, () -> service.login(
                new LoginRequest("owner@test.local", "password")
        ));

        verify(jwtService, never()).generateAccessToken("owner@test.local", "ROLE_OWNER");
        verify(jwtService, never()).generateRefreshToken("owner@test.local", "ROLE_OWNER");
    }
}
