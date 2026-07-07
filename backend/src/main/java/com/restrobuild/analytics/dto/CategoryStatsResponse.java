package com.restrobuild.analytics.dto;

public record CategoryStatsResponse(
        Long categoryId,
        String categoryName,
        long quantity
) {
}
