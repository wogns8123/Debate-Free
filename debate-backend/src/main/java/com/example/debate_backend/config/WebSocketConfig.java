package com.example.debate_backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;
import org.springframework.web.socket.server.support.DefaultHandshakeHandler; // 필요시

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // 🟢 WebSocket 엔드포인트 경로 확인
        registry.addEndpoint("/ws") // <<< /ws 경로가 맞는지 확인
                // 🟢 React 앱의 origin 허용 (CORS 설정)
                .setAllowedOriginPatterns("http://localhost:3000", "http://localhost:5173") // Vite 기본 포트 5173도 추가
                .withSockJS(); // SockJS 폴백 지원
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        // 클라이언트가 서버로 메시지를 보낼 때 사용할 접두사
        registry.setApplicationDestinationPrefixes("/app");
        // Simple Broker의 목적지 접두사
        registry.enableSimpleBroker("/topic", "/queue");
    }
}