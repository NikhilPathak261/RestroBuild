package com.restrobuild.order.mapper;

import com.restrobuild.order.dto.OrderItemResponse;
import com.restrobuild.order.dto.OrderResponse;
import com.restrobuild.order.entity.CustomerOrder;
import com.restrobuild.order.entity.OrderItem;
import com.restrobuild.review.repository.ReviewRepository;
import org.springframework.stereotype.Component;

@Component
public class OrderMapper {

    private final ReviewRepository reviewRepository;

    public OrderMapper(ReviewRepository reviewRepository) {
        this.reviewRepository = reviewRepository;
    }

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
                item.getSubtotal(),
                item.getId() != null && reviewRepository.existsByOrderItemId(item.getId())
        );
    }
}
