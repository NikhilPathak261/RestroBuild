package com.restrobuild.order.controller;

import com.restrobuild.common.ApiResponse;
import com.restrobuild.order.dto.OrderResponse;
import com.restrobuild.order.entity.OrderStatus;
import com.restrobuild.order.service.OrderService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@PreAuthorize("hasAnyAuthority('ROLE_OWNER', 'ROLE_KITCHEN')")
public class KitchenController {

    private final OrderService orderService;

    public KitchenController(OrderService orderService) {
        this.orderService = orderService;
    }

    @GetMapping("/api/kitchen/orders/pending")
    public ResponseEntity<ApiResponse<List<OrderResponse>>> getPendingOrders() {
        List<OrderResponse> response = orderService.getKitchenOrders(OrderStatus.PENDING);
        return ResponseEntity.ok(ApiResponse.success("Pending orders fetched successfully.", response));
    }

    @GetMapping("/api/kitchen/orders/preparing")
    public ResponseEntity<ApiResponse<List<OrderResponse>>> getPreparingOrders() {
        List<OrderResponse> response = orderService.getKitchenOrders(OrderStatus.PREPARING);
        return ResponseEntity.ok(ApiResponse.success("Preparing orders fetched successfully.", response));
    }

    @GetMapping("/api/kitchen/orders/ready")
    public ResponseEntity<ApiResponse<List<OrderResponse>>> getReadyOrders() {
        List<OrderResponse> response = orderService.getKitchenOrders(OrderStatus.READY);
        return ResponseEntity.ok(ApiResponse.success("Ready orders fetched successfully.", response));
    }

    @PatchMapping("/api/kitchen/orders/{orderId}/prepare")
    public ResponseEntity<ApiResponse<OrderResponse>> markPreparing(@PathVariable Long orderId) {
        OrderResponse response = orderService.markPreparing(orderId);
        return ResponseEntity.ok(ApiResponse.success("Order marked preparing successfully.", response));
    }

    @PatchMapping("/api/kitchen/orders/{orderId}/ready")
    public ResponseEntity<ApiResponse<OrderResponse>> markReady(@PathVariable Long orderId) {
        OrderResponse response = orderService.markReady(orderId);
        return ResponseEntity.ok(ApiResponse.success("Order marked ready successfully.", response));
    }
}
