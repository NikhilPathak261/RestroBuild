package com.restrobuild.order.dto;

import java.math.BigDecimal;
import java.util.List;

public record OrderBillResponse(
        Long tableId,
        Integer tableNumber,
        Integer orderCount,
        Integer itemCount,
        BigDecimal subtotal,
        BigDecimal totalAmount,
        List<OrderBillItemResponse> items
) {
}
