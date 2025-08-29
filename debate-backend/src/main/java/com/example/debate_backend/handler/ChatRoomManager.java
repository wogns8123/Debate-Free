package com.example.debate_backend.handler;

import com.example.debate_backend.dto.ChatRoom;
import java.util.concurrent.ConcurrentHashMap;
import java.util.Map;

public class ChatRoomManager {
    private static final Map<String, ChatRoom> chatRooms = new ConcurrentHashMap<>();

    public static ChatRoom getOrCreateRoom(String roomId, String name) {
        return chatRooms.computeIfAbsent(roomId, id -> new ChatRoom(id, name));
    }

    public static ChatRoom getRoom(String roomId) {
        return chatRooms.get(roomId);
    }
}
