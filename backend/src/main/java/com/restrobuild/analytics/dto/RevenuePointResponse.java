package com.restrobuild.analytics.dto;

import java.math.BigDecimal;

public record RevenuePointResponse(
        String label,
        BigDecimal revenue
) {
}
