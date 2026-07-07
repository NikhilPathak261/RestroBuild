package com.restrobuild.analytics.dto;

public record MenuItemStatsResponse(
        Long menuItemId,
        String menuItemName,
        long quantity
) {
}
