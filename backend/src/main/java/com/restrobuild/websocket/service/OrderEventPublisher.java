package com.restrobuild.websocket.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.restrobuild.order.entity.CustomerOrder;
import com.restrobuild.websocket.dto.OrderEvent;
import com.restrobuild.websocket.dto.OrderEventType;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Service
public class OrderEventPublisher {

    private final OrderWebSocketHandler webSocketHandler;
    private final ObjectMapper objectMapper;

    public OrderEventPublisher(OrderWebSocketHandler webSocketHandler, ObjectMapper objectMapper) {
        this.webSocketHandler = webSocketHandler;
        this.objectMapper = objectMapper;
    }

    public void publish(CustomerOrder order, OrderEventType eventType) {
        OrderEvent event = new OrderEvent(
                eventType,
                order.getId(),
                order.getRestaurant().getId(),
                order.getTable().getId(),
                order.getTable().getTableNumber(),
                order.getStatus(),
                Instant.now()
        );

        try {
            String payload = objectMapper.writeValueAsString(event);
            webSocketHandler.broadcast("/topic/orders/" + order.getId(), payload);
            webSocketHandler.broadcast("/topic/kitchen/orders", payload);
            webSocketHandler.broadcast("/topic/waiter/orders", payload);
            webSocketHandler.broadcast("/topic/owner/orders", payload);
        } catch (JsonProcessingException ignored) {
            // REST remains the source of truth if event serialization fails.
        }
    }
}
