package com.example.debate_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ParticipantDto {
    private String id; // 사용자 세션 ID 또는 고유 ID (ex: WebSocket Session ID)
    private String name;
    private String side; // "for", "against", "none" (none은 아직 선택 안 했을 때)
    private String color; // UI 표시용 색상 코드 (예: "bg-blue-500")
}