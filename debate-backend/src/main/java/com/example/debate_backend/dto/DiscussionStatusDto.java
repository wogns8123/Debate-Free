package com.example.debate_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DiscussionStatusDto {
    public enum StatusType {
        WAITING, STARTED, PAUSED, ENDED, VOTING
    }
    private String roomId;
    private StatusType type;
    private String message; // 추가 정보 (예: "토론이 시작되었습니다!")
    private String currentTopic; // 현재 토론 주제
    private long startTime; // 토론 시작 시간 (Epoch milli)
    private long durationSeconds; // 토론 지속 시간 (초)
}