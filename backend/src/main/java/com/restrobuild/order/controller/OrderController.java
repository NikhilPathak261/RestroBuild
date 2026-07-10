package com.restrobuild.order.controller;

import com.restrobuild.common.ApiResponse;
import com.restrobuild.order.dto.OrderBillResponse;
import com.restrobuild.order.dto.OrderResponse;
import com.restrobuild.order.dto.OrderStatusResponse;
import com.restrobuild.order.dto.OrderTimelineStepResponse;
import com.restrobuild.order.dto.PlaceOrderRequest;
import com.restrobuild.order.entity.OrderStatus;
import com.restrobuild.order.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping("/api/orders")
    public ResponseEntity<ApiResponse<OrderResponse>> placeOrder(@Valid @RequestBody PlaceOrderRequest request) {
        OrderResponse response = orderService.placeOrder(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Order placed successfully.", response));
    }

    @GetMapping("/api/orders/{orderId}")
    public ResponseEntity<ApiResponse<OrderResponse>> getOrder(@PathVariable Long orderId) {
        OrderResponse response = orderService.getOrder(orderId);
        return ResponseEntity.ok(ApiResponse.success("Order fetched successfully.", response));
    }

    @GetMapping("/api/orders/table/{tableId}")
    public ResponseEntity<ApiResponse<List<OrderResponse>>> getCurrentTableOrders(@PathVariable Long tableId) {
        List<OrderResponse> response = orderService.getCurrentTableOrders(tableId);
        return ResponseEntity.ok(ApiResponse.success("Table orders fetched successfully.", response));
    }

    @GetMapping("/api/orders/table/{tableId}/bill")
    public ResponseEntity<ApiResponse<OrderBillResponse>> getTableBill(@PathVariable Long tableId) {
        OrderBillResponse response = orderService.getTableBill(tableId);
        return ResponseEntity.ok(ApiResponse.success("Table bill fetched successfully.", response));
    }

    @GetMapping("/api/orders")
    @PreAuthorize("hasAuthority('ROLE_OWNER')")
    public ResponseEntity<ApiResponse<List<OrderResponse>>> getRestaurantOrders(
            @RequestParam(required = false) OrderStatus status,
            @RequestParam(required = false) Integer tableNumber,
            @RequestParam(required = false) LocalDate date
    ) {
        List<OrderResponse> response = orderService.getRestaurantOrders(status, tableNumber, date);
        return ResponseEntity.ok(ApiResponse.success("Restaurant orders fetched successfully.", response));
    }

    @PatchMapping("/api/orders/{orderId}/cancel")
    @PreAuthorize("hasAuthority('ROLE_OWNER')")
    public ResponseEntity<ApiResponse<Void>> cancelOrder(@PathVariable Long orderId) {
        orderService.cancelOrder(orderId);
        return ResponseEntity.ok(ApiResponse.success("Order cancelled successfully."));
    }

    @GetMapping("/api/orders/{orderId}/status")
    public ResponseEntity<ApiResponse<OrderStatusResponse>> getOrderStatus(@PathVariable Long orderId) {
        OrderStatusResponse response = orderService.getOrderStatus(orderId);
        return ResponseEntity.ok(ApiResponse.success("Order status fetched successfully.", response));
    }

    @GetMapping("/api/orders/{orderId}/timeline")
    public ResponseEntity<ApiResponse<List<OrderTimelineStepResponse>>> getOrderTimeline(@PathVariable Long orderId) {
        List<OrderTimelineStepResponse> response = orderService.getOrderTimeline(orderId);
        return ResponseEntity.ok(ApiResponse.success("Order timeline fetched successfully.", response));
    }
}
