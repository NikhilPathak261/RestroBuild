package com.restrobuild.config;

import org.junit.jupiter.api.Test;
import org.springframework.mock.env.MockEnvironment;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;

class RuntimeConfigurationValidatorTest {

    private static final String DEVELOPMENT_JWT_SECRET = "change-this-development-secret-change-this-development-secret";
    private static final String PRODUCTION_JWT_SECRET = "replace-with-a-long-production-secret-value";

    @Test
    void allowsDevelopmentSecretOutsideProductionProfile() {
        MockEnvironment environment = new MockEnvironment();
        RuntimeConfigurationValidator validator = new RuntimeConfigurationValidator(environment, DEVELOPMENT_JWT_SECRET, List.of("*"));

        assertDoesNotThrow(validator::validate);
    }

    @Test
    void rejectsDevelopmentSecretInProductionProfile() {
        MockEnvironment environment = new MockEnvironment();
        environment.setActiveProfiles("prod");
        RuntimeConfigurationValidator validator = new RuntimeConfigurationValidator(environment, DEVELOPMENT_JWT_SECRET, List.of("https://app.example.com"));

        assertThrows(IllegalStateException.class, validator::validate);
    }

    @Test
    void allowsCustomSecretInProductionProfile() {
        MockEnvironment environment = new MockEnvironment();
        environment.setActiveProfiles("prod");
        RuntimeConfigurationValidator validator = new RuntimeConfigurationValidator(environment, PRODUCTION_JWT_SECRET, List.of("https://app.example.com"));

        assertDoesNotThrow(validator::validate);
    }

    @Test
    void rejectsWildcardCorsOriginsInProductionProfile() {
        MockEnvironment environment = new MockEnvironment();
        environment.setActiveProfiles("prod");
        RuntimeConfigurationValidator validator = new RuntimeConfigurationValidator(environment, PRODUCTION_JWT_SECRET, List.of("*"));

        assertThrows(IllegalStateException.class, validator::validate);
    }
}
