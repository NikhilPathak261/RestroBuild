package com.restrobuild.common;

import org.springframework.dao.DataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/health")
public class HealthController {

    private final JdbcTemplate jdbcTemplate;

    public HealthController(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<String>> health() {
        return ResponseEntity.ok(ApiResponse.success("RestroBuild backend is running.", "OK"));
    }

    @GetMapping("/ready")
    public ResponseEntity<ApiResponse<String>> readiness() {
        try {
            Integer result = jdbcTemplate.queryForObject("SELECT 1", Integer.class);
            if (Integer.valueOf(1).equals(result)) {
                return ResponseEntity.ok(ApiResponse.success("RestroBuild backend is ready.", "READY"));
            }
        } catch (DataAccessException ignored) {
            return unavailable();
        }

        return unavailable();
    }

    private ResponseEntity<ApiResponse<String>> unavailable() {
        return ResponseEntity
                .status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(new ApiResponse<>(false, "RestroBuild backend is not ready.", null, null));
    }
}
