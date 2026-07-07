package com.restrobuild.menu.dto;

import jakarta.validation.constraints.NotNull;

public record AvailabilityRequest(
        @NotNull(message = "Availability is required.")
        Boolean available
) {
}
