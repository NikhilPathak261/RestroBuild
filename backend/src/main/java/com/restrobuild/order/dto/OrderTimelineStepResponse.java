package com.restrobuild.order.dto;

import com.restrobuild.order.entity.OrderStatus;

import java.time.Instant;

public record OrderTimelineStepResponse(
        OrderStatus status,
        String label,
        String description,
        String state,
        Instant timestamp
) {
}
