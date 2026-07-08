package com.restrobuild.config;

import com.restrobuild.websocket.service.OrderWebSocketHandler;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

import java.util.List;

@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {

    private final OrderWebSocketHandler orderWebSocketHandler;
    private final List<String> allowedOrigins;

    public WebSocketConfig(
            OrderWebSocketHandler orderWebSocketHandler,
            @Value("${app.cors.allowed-origins}") List<String> allowedOrigins
    ) {
        this.orderWebSocketHandler = orderWebSocketHandler;
        this.allowedOrigins = allowedOrigins;
    }

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(orderWebSocketHandler, "/ws")
                .setAllowedOriginPatterns(allowedOrigins.toArray(String[]::new));
    }
}
