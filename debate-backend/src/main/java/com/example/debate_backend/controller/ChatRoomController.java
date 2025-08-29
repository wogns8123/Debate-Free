package com.example.debate_backend.controller;

import com.example.debate_backend.dto.ChatRoom;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/rooms")
@CrossOrigin(origins = "http://localhost:5173")
public class ChatRoomController {

    // 서버가 살아있는 동안 방 목록 저장
    private final Map<String, ChatRoom> rooms = new ConcurrentHashMap<>();

    // 방 생성
    @PostMapping
    public ResponseEntity<ChatRoom> createRoom(@RequestParam String name) {
        // 새 방 ID 생성
        String roomId = UUID.randomUUID().toString();

        // ChatRoom 객체 생성
        ChatRoom room = new ChatRoom(roomId, name);

        // Map에 저장
        rooms.put(roomId, room);

        return ResponseEntity.ok(room);
    }

    // 방 목록 조회
    @GetMapping
    public List<ChatRoom> getRooms() {
        return new ArrayList<>(rooms.values());
    }
}
