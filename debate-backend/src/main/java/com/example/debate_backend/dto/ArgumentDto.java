package com.example.debate_backend.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ArgumentDto {
    private String id;
    private String participantId;
    private String participantName;
    private String side;
    private String text; // 'content' -> 'text'
    private long timestamp; // 'String' -> 'long' (Java의 epoch milliseconds 타입)
}