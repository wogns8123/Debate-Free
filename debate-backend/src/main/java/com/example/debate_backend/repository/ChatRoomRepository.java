package com.example.debate_backend.repository;

import com.example.debate_backend.model.ChatRoom;
import org.springframework.stereotype.Repository;

import java.util.*;

@Repository
public class ChatRoomRepository {
    private Map<String, ChatRoom> chatRoomMap = new LinkedHashMap<>();

    public ChatRoom createRoom(String name) {
        ChatRoom room = new ChatRoom(name);
        chatRoomMap.put(room.getId(), room);
        return room;
    }

    public List<ChatRoom> findAllRooms() {
        return new ArrayList<>(chatRoomMap.values());
    }

    public ChatRoom findRoomById(String id) {
        return chatRoomMap.get(id);
    }
}
