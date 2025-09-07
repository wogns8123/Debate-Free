package com.example.debate_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VoteResultsDto {
    private String roomId;
    private Map<String, Integer> results; // 예: {"for": 5, "against": 3}
}