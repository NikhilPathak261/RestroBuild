package com.restrobuild.auth.service;

import com.restrobuild.auth.dto.AuthResponse;
import com.restrobuild.auth.dto.LoginRequest;
import com.restrobuild.auth.dto.RefreshTokenRequest;
import com.restrobuild.auth.dto.RefreshTokenResponse;
import com.restrobuild.auth.dto.RegisterOwnerRequest;
import com.restrobuild.auth.entity.Owner;
import com.restrobuild.auth.repository.OwnerRepository;
import com.restrobuild.exception.BusinessException;
import com.restrobuild.security.JwtService;
import com.restrobuild.staff.entity.Staff;
import com.restrobuild.staff.repository.StaffRepository;
import io.jsonwebtoken.JwtException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthenticationService {

    private final OwnerRepository ownerRepository;
    private final StaffRepository staffRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthenticationService(
            OwnerRepository ownerRepository,
            StaffRepository staffRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService
    ) {
        this.ownerRepository = ownerRepository;
        this.staffRepository = staffRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Transactional
    public void registerOwner(RegisterOwnerRequest request) {
        String email = request.email().trim().toLowerCase();
        if (ownerRepository.existsByEmailIgnoreCase(email) || staffRepository.existsByEmailIgnoreCase(email)) {
            throw new BusinessException("Email already exists.");
        }

        Owner owner = new Owner(
                request.name().trim(),
                email,
                passwordEncoder.encode(request.password())
        );

        ownerRepository.save(owner);
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        String email = request.email().trim();
        return ownerRepository.findByEmailIgnoreCase(email)
                .map(owner -> loginOwner(owner, request.password()))
                .or(() -> staffRepository.findByEmailIgnoreCase(email).map(staff -> loginStaff(staff, request.password())))
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password."));
    }

    @Transactional(readOnly = true)
    public RefreshTokenResponse refresh(RefreshTokenRequest request) {
        String refreshToken = request.refreshToken().trim();
        String email;

        try {
            email = jwtService.extractSubject(refreshToken);
        } catch (JwtException | IllegalArgumentException exception) {
            throw new BadCredentialsException("Invalid refresh token.");
        }

        return ownerRepository.findByEmailIgnoreCase(email)
                .map(owner -> refreshOwner(owner, refreshToken))
                .or(() -> staffRepository.findByEmailIgnoreCase(email).map(staff -> refreshStaff(staff, refreshToken)))
                .orElseThrow(() -> new BadCredentialsException("Invalid refresh token."));
    }

    private AuthResponse loginOwner(Owner owner, String password) {
        if (!passwordEncoder.matches(password, owner.getPasswordHash())) {
            throw new BadCredentialsException("Invalid email or password.");
        }

        String role = owner.getRole().name();
        return new AuthResponse(
                jwtService.generateAccessToken(owner.getEmail(), role),
                jwtService.generateRefreshToken(owner.getEmail(), role),
                role
        );
    }

    private AuthResponse loginStaff(Staff staff, String password) {
        if (!staff.isActive() || !passwordEncoder.matches(password, staff.getPasswordHash())) {
            throw new BadCredentialsException("Invalid email or password.");
        }

        String role = staff.getRole().name();
        return new AuthResponse(
                jwtService.generateAccessToken(staff.getEmail(), role),
                jwtService.generateRefreshToken(staff.getEmail(), role),
                role
        );
    }

    private RefreshTokenResponse refreshOwner(Owner owner, String refreshToken) {
        String role = owner.getRole().name();
        validateRefreshToken(refreshToken, owner.getEmail(), owner.getPasswordHash(), role, owner.isActive());
        return new RefreshTokenResponse(jwtService.generateAccessToken(owner.getEmail(), role));
    }

    private RefreshTokenResponse refreshStaff(Staff staff, String refreshToken) {
        String role = staff.getRole().name();
        validateRefreshToken(refreshToken, staff.getEmail(), staff.getPasswordHash(), role, staff.isActive());
        return new RefreshTokenResponse(jwtService.generateAccessToken(staff.getEmail(), role));
    }

    private void validateRefreshToken(String refreshToken, String email, String passwordHash, String role, boolean active) {
        if (!active) {
            throw new BadCredentialsException("Invalid refresh token.");
        }

        if (!jwtService.isTokenValid(refreshToken, User
                .withUsername(email)
                .password(passwordHash)
                .authorities(role)
                .disabled(!active)
                .build())) {
            throw new BadCredentialsException("Invalid refresh token.");
        }
    }
}
