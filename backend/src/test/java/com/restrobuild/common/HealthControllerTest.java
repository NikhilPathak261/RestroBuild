package com.restrobuild.common;

import org.junit.jupiter.api.Test;
import org.springframework.dao.QueryTimeoutException;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class HealthControllerTest {

    @Test
    void healthReturnsLivenessStatus() {
        HealthController controller = new HealthController(mock(JdbcTemplate.class));

        var response = controller.health();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody().success());
        assertEquals("OK", response.getBody().data());
    }

    @Test
    void readinessReturnsReadyWhenDatabaseResponds() {
        JdbcTemplate jdbcTemplate = mock(JdbcTemplate.class);
        when(jdbcTemplate.queryForObject("SELECT 1", Integer.class)).thenReturn(1);
        HealthController controller = new HealthController(jdbcTemplate);

        var response = controller.readiness();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody().success());
        assertEquals("READY", response.getBody().data());
    }

    @Test
    void readinessReturnsUnavailableWhenDatabaseFails() {
        JdbcTemplate jdbcTemplate = mock(JdbcTemplate.class);
        when(jdbcTemplate.queryForObject("SELECT 1", Integer.class)).thenThrow(new QueryTimeoutException("timeout"));
        HealthController controller = new HealthController(jdbcTemplate);

        var response = controller.readiness();

        assertEquals(HttpStatus.SERVICE_UNAVAILABLE, response.getStatusCode());
        assertEquals(false, response.getBody().success());
    }
}
