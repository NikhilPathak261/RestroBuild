package com.restrobuild.order.dto;

import com.restrobuild.order.entity.OrderStatus;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public record OrderResponse(
        Long id,
        Long tableId,
        Integer tableNumber,
        OrderStatus status,
        BigDecimal totalAmount,
        String specialInstructions,
        Instant orderedAt,
        List<OrderItemResponse> items
) {
}
