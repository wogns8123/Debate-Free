package com.example.debate_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessageDto {
    public enum MessageType {
        CHAT, JOIN, LEAVE, STATUS // CHAT: 일반 채팅, JOIN: 입장, LEAVE: 퇴장, STATUS: 토론 상태 변경 알림
    }
    private MessageType type;
    private String content;
    private String sender;
    private String roomId; // 어떤 방의 메시지인지 식별
    private String timestamp; // 메시지 전송 시간 (ISO 8601 형식)
}