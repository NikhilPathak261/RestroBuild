package com.restrobuild.table.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record CreateTablesRequest(
        @NotNull(message = "Number of tables is required.")
        @Min(value = 1, message = "At least one table is required.")
        @Max(value = 500, message = "Number of tables cannot exceed 500.")
        Integer numberOfTables
) {
}
