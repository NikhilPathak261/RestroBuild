package com.restrobuild.websocket.service;

import org.junit.jupiter.api.Test;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class OrderWebSocketHandlerTest {

    private final OrderWebSocketHandler handler = new OrderWebSocketHandler();

    @Test
    void allowsOnlyKnownOrderDestinations() {
        assertTrue(handler.isAllowedDestination("/topic/orders/42"));
        assertTrue(handler.isAllowedDestination("/topic/kitchen/orders"));
        assertTrue(handler.isAllowedDestination("/topic/waiter/orders"));
        assertTrue(handler.isAllowedDestination("/topic/owner/orders"));

        assertFalse(handler.isAllowedDestination("/topic/orders/0"));
        assertFalse(handler.isAllowedDestination("/topic/orders/not-a-number"));
        assertFalse(handler.isAllowedDestination("/topic/admin/secrets"));
        assertFalse(handler.isAllowedDestination(""));
    }

    @Test
    void ignoresUnknownSubscriptions() throws Exception {
        WebSocketSession session = mock(WebSocketSession.class);

        handler.handleTextMessage(session, new TextMessage("SUBSCRIBE /topic/admin/secrets"));
        handler.broadcast("/topic/admin/secrets", "{\"type\":\"TEST\"}");

        verify(session, never()).sendMessage(any(TextMessage.class));
    }

    @Test
    void broadcastsOnlyToOpenSubscribers() throws Exception {
        WebSocketSession openSession = mock(WebSocketSession.class);
        WebSocketSession closedSession = mock(WebSocketSession.class);
        when(openSession.isOpen()).thenReturn(true);
        when(closedSession.isOpen()).thenReturn(false);

        handler.handleTextMessage(openSession, new TextMessage("SUBSCRIBE /topic/orders/42"));
        handler.handleTextMessage(closedSession, new TextMessage("SUBSCRIBE /topic/orders/42"));
        handler.broadcast("/topic/orders/42", "{\"type\":\"TEST\"}");

        verify(openSession).sendMessage(argThat(message -> "{\"type\":\"TEST\"}".equals(message.getPayload())));
        verify(closedSession, never()).sendMessage(any(TextMessage.class));
    }
}
