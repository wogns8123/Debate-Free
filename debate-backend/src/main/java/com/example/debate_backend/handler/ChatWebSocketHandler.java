package com.example.debate_backend.handler;

import com.example.debate_backend.dto.ChatRoom;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.*;
import org.springframework.web.socket.handler.TextWebSocketHandler;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.*;

@Component
public class ChatWebSocketHandler extends TextWebSocketHandler {

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final Map<WebSocketSession, String> sessionRoomMap = new HashMap<>();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        System.out.println("새 연결: " + session.getId());
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        Map<String, String> payload = objectMapper.readValue(message.getPayload(), Map.class);

        String type = payload.get("type");
        String roomId = payload.get("roomId");
        String roomName = payload.getOrDefault("roomName", "채팅방");

        if ("JOIN".equals(type)) {
            ChatRoom room = ChatRoomManager.getOrCreateRoom(roomId, roomName);
            room.addSession(session);
            sessionRoomMap.put(session, roomId);
            System.out.println("세션 " + session.getId() + " 이(가) " + roomId + "방에 참여");
        }
        else if ("CHAT".equals(type)) {
            ChatRoom room = ChatRoomManager.getRoom(roomId);
            if (room != null) {
                for (WebSocketSession s : room.getSessions()) {
                    if (s.isOpen()) {
                        s.sendMessage(new TextMessage(payload.get("sender") + ": " + payload.get("message")));
                    }
                }
            }
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        String roomId = sessionRoomMap.remove(session);
        if (roomId != null) {
            ChatRoom room = ChatRoomManager.getRoom(roomId);
            if (room != null) {
                room.removeSession(session);
            }
        }
        System.out.println("세션 종료: " + session.getId());
    }
}
