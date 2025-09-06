package com.example.debate_backend.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessage {
    public enum MessageType{
        CHAT, JOIN, LEAVE, STATUS
    }
    private MessageType type;
    private String Content;
    private String sender;
    private String roomId;
    private String timestamp;
}
