package com.restrobuild.cart.dto;

import java.math.BigDecimal;

public record CartItemResponse(
        Long id,
        Long menuItemId,
        String menuItemName,
        Integer quantity,
        BigDecimal price,
        BigDecimal subtotal,
        String specialInstructions
) {
}
