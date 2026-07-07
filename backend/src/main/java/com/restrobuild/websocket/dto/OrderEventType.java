package com.restrobuild.websocket.dto;

public enum OrderEventType {
    NEW_ORDER,
    ORDER_PREPARING,
    ORDER_READY,
    ORDER_SERVED,
    ORDER_CANCELLED
}
