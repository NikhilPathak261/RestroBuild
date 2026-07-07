package com.restrobuild.order.controller;

import com.restrobuild.common.ApiResponse;
import com.restrobuild.order.dto.OrderResponse;
import com.restrobuild.order.service.OrderService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@PreAuthorize("hasAnyAuthority('ROLE_OWNER', 'ROLE_WAITER')")
public class WaiterController {

    private final OrderService orderService;

    public WaiterController(OrderService orderService) {
        this.orderService = orderService;
    }

    @GetMapping("/api/waiter/orders/ready")
    public ResponseEntity<ApiResponse<List<OrderResponse>>> getReadyOrders() {
        List<OrderResponse> response = orderService.getWaiterReadyOrders();
        return ResponseEntity.ok(ApiResponse.success("Ready orders fetched successfully.", response));
    }

    @PatchMapping("/api/waiter/orders/{orderId}/served")
    public ResponseEntity<ApiResponse<OrderResponse>> markServed(@PathVariable Long orderId) {
        OrderResponse response = orderService.markServed(orderId);
        return ResponseEntity.ok(ApiResponse.success("Order marked served successfully.", response));
    }
}
