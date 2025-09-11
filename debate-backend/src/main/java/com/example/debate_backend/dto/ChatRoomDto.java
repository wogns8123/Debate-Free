package com.example.debate_backend.dto;

import lombok.Data;
import java.util.UUID; // UUID를 사용하기 위해 임포트

@Data
public class ChatRoomDto {
    private String id;
    private String name;

    // 방 생성 시 ID를 자동으로 할당하는 생성자
    public ChatRoomDto(String name) {
        this.id = UUID.randomUUID().toString(); // 고유한 ID 생성
        this.name = name;
    }
}