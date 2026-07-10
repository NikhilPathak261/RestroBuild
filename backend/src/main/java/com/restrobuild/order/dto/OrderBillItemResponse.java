package com.restrobuild.order.dto;

import com.restrobuild.order.entity.OrderStatus;

import java.math.BigDecimal;

public record OrderBillItemResponse(
        Long orderId,
        OrderStatus orderStatus,
        Long orderItemId,
        Long menuItemId,
        String menuItemName,
        Integer quantity,
        BigDecimal price,
        BigDecimal subtotal
) {
}
