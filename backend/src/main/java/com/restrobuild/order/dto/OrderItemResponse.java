package com.restrobuild.order.dto;

import java.math.BigDecimal;

public record OrderItemResponse(
        Long id,
        Long menuItemId,
        String menuItemName,
        Integer quantity,
        BigDecimal price,
        BigDecimal subtotal,
        boolean reviewed
) {
}
