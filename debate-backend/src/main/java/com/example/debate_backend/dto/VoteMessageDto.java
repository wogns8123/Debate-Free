package com.example.debate_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VoteMessageDto {
    private String voterId; // 투표한 사용자 ID
    private String roomId; // 어떤 방에 투표했는지
    private String side; // "for" 또는 "against"
}