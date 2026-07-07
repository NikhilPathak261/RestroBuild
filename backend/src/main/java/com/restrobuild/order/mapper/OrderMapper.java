package com.restrobuild.order.mapper;

import com.restrobuild.order.dto.OrderItemResponse;
import com.restrobuild.order.dto.OrderResponse;
import com.restrobuild.order.entity.CustomerOrder;
import com.restrobuild.order.entity.OrderItem;
import org.springframework.stereotype.Component;

@Component
public class OrderMapper {

    public OrderResponse toResponse(CustomerOrder order) {
        return new OrderResponse(
                order.getId(),
                order.getTable().getId(),
                order.getTable().getTableNumber(),
                order.getStatus(),
                order.getTotalAmount(),
                order.getSpecialInstructions(),
                order.getOrderedAt(),
                order.getItems().stream().map(this::toItemResponse).toList()
        );
    }

    private OrderItemResponse toItemResponse(OrderItem item) {
        return new OrderItemResponse(
                item.getId(),
                item.getMenuItem().getId(),
                item.getMenuItem().getName(),
                item.getQuantity(),
                item.getPrice(),
                item.getSubtotal()
        );
    }
}
