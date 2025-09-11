package com.example.debate_backend.repository;

import com.example.debate_backend.dto.ChatRoomDto;
import org.springframework.stereotype.Repository;

import java.util.*;

@Repository
public class ChatRoomRepository {
    private Map<String, ChatRoomDto> chatRoomMap = new LinkedHashMap<>();

    public ChatRoomDto createRoom(String name) {
        ChatRoomDto room = new ChatRoomDto(name);
        chatRoomMap.put(room.getId(), room);
        return room;
    }

    public List<ChatRoomDto> findAllRooms() {
        return new ArrayList<>(chatRoomMap.values());
    }

    public ChatRoomDto findRoomById(String id) {
        return chatRoomMap.get(id);
    }
}
