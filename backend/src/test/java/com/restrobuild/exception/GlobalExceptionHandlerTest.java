package com.restrobuild.exception;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class GlobalExceptionHandlerTest {

    private final GlobalExceptionHandler handler = new GlobalExceptionHandler();

    @Test
    void missingCredentialsReturnUnauthorizedApiResponse() {
        var response = handler.handleMissingCredentials(
                new AuthenticationCredentialsNotFoundException("Authentication required.")
        );

        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
        assertFalse(response.getBody().success());
        assertEquals("Authentication required.", response.getBody().message());
        assertTrue(response.getBody().errors().contains("A valid access token is required."));
    }
}
