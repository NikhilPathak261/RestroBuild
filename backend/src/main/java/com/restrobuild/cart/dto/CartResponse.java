package com.restrobuild.cart.dto;

import java.math.BigDecimal;
import java.util.List;

public record CartResponse(
        String cartToken,
        List<CartItemResponse> items,
        BigDecimal subtotal
) {
}
