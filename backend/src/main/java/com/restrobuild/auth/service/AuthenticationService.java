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
import io.jsonwebtoken.JwtException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthenticationService {

    private final OwnerRepository ownerRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthenticationService(
            OwnerRepository ownerRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService
    ) {
        this.ownerRepository = ownerRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Transactional
    public void registerOwner(RegisterOwnerRequest request) {
        String email = request.email().trim().toLowerCase();
        if (ownerRepository.existsByEmailIgnoreCase(email)) {
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
        Owner owner = ownerRepository.findByEmailIgnoreCase(request.email().trim())
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password."));

        if (!passwordEncoder.matches(request.password(), owner.getPasswordHash())) {
            throw new BadCredentialsException("Invalid email or password.");
        }

        String role = owner.getRole().name();
        String accessToken = jwtService.generateAccessToken(owner.getEmail(), role);
        String refreshToken = jwtService.generateRefreshToken(owner.getEmail(), role);

        return new AuthResponse(accessToken, refreshToken, role);
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

        Owner owner = ownerRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new BadCredentialsException("Invalid refresh token."));

        String role = owner.getRole().name();
        if (!jwtService.isTokenValid(refreshToken, User
                .withUsername(owner.getEmail())
                .password(owner.getPasswordHash())
                .authorities(role)
                .disabled(!owner.isActive())
                .build())) {
            throw new BadCredentialsException("Invalid refresh token.");
        }

        return new RefreshTokenResponse(jwtService.generateAccessToken(owner.getEmail(), role));
    }
}
