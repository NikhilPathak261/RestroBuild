package com.restrobuild.websocket.dto;

import com.restrobuild.order.entity.OrderStatus;

import java.time.Instant;

public record OrderEvent(
        OrderEventType eventType,
        Long orderId,
        Long restaurantId,
        Long tableId,
        Integer tableNumber,
        OrderStatus status,
        Instant timestamp
) {
}
