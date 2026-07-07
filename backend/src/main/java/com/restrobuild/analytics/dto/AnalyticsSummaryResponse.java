package com.restrobuild.analytics.dto;

import java.math.BigDecimal;

public record AnalyticsSummaryResponse(
        long totalOrders,
        long todayOrders,
        BigDecimal totalRevenue,
        BigDecimal todayRevenue,
        double averageRating
) {
}
