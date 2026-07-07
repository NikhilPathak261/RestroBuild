package com.restrobuild.order.dto;

import com.restrobuild.order.entity.OrderStatus;

public record OrderStatusResponse(
        Long orderId,
        OrderStatus status,
        Integer estimatedTime
) {
}
