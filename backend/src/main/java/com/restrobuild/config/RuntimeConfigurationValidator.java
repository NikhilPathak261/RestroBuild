package com.restrobuild.config;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

@Component
public class RuntimeConfigurationValidator {

    private static final int MINIMUM_PRODUCTION_JWT_SECRET_LENGTH = 32;
    private static final String PLACEHOLDER_JWT_SECRET = "change-this-development-secret-change-this-development-secret";

    private final Environment environment;
    private final String jwtSecret;
    private final List<String> corsAllowedOrigins;

    public RuntimeConfigurationValidator(
            Environment environment,
            @Value("${app.jwt.secret}") String jwtSecret,
            @Value("${app.cors.allowed-origins}") List<String> corsAllowedOrigins
    ) {
        this.environment = environment;
        this.jwtSecret = jwtSecret;
        this.corsAllowedOrigins = corsAllowedOrigins;
    }

    @PostConstruct
    void validate() {
        if (!isProductionProfile()) {
            return;
        }

        if (jwtSecret == null || jwtSecret.isBlank()) {
            throw new IllegalStateException("JWT_SECRET must be set before running with the prod profile.");
        }

        if (PLACEHOLDER_JWT_SECRET.equals(jwtSecret)) {
            throw new IllegalStateException("JWT_SECRET must be changed before running with the prod profile.");
        }

        if (jwtSecret.length() < MINIMUM_PRODUCTION_JWT_SECRET_LENGTH) {
            throw new IllegalStateException("JWT_SECRET must be at least 32 characters before running with the prod profile.");
        }

        if (corsAllowedOrigins == null || corsAllowedOrigins.isEmpty()) {
            throw new IllegalStateException("CORS_ALLOWED_ORIGINS must contain at least one origin in the prod profile.");
        }

        if (corsAllowedOrigins.stream().anyMatch(origin -> origin == null || origin.isBlank())) {
            throw new IllegalStateException("CORS_ALLOWED_ORIGINS must not contain blank origins in the prod profile.");
        }

        if (corsAllowedOrigins.stream().anyMatch(origin -> "*".equals(origin.trim()))) {
            throw new IllegalStateException("CORS_ALLOWED_ORIGINS must not contain wildcard origins in the prod profile.");
        }
    }

    private boolean isProductionProfile() {
        return Arrays.asList(environment.getActiveProfiles()).contains("prod");
    }
}
