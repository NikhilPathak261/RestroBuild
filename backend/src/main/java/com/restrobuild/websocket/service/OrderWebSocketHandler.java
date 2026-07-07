package com.restrobuild.websocket.service;

import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class OrderWebSocketHandler extends TextWebSocketHandler {

    private final Map<String, Set<WebSocketSession>> subscribers = new ConcurrentHashMap<>();

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) {
        String payload = message.getPayload();
        if (payload.startsWith("SUBSCRIBE ")) {
            String destination = payload.substring("SUBSCRIBE ".length()).trim();
            subscribers.computeIfAbsent(destination, key -> ConcurrentHashMap.newKeySet()).add(session);
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        subscribers.values().forEach(sessions -> sessions.remove(session));
    }

    public void broadcast(String destination, String payload) {
        Set<WebSocketSession> sessions = subscribers.getOrDefault(destination, Set.of());
        sessions.forEach(session -> send(session, payload));
    }

    private void send(WebSocketSession session, String payload) {
        if (!session.isOpen()) {
            return;
        }

        try {
            session.sendMessage(new TextMessage(payload));
        } catch (IOException ignored) {
            // REST remains the source of truth if a real-time delivery fails.
        }
    }
}
