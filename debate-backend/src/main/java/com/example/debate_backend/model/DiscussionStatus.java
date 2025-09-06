package com.example.debate_backend.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DiscussionStatus {
    public enum StatusType{
        WAITING, STARTED, PAUSED, ENDED, VOTING
    }
    private String roomId;
    private StatusType type;
    private String message;
    private String currentTopic;
    private long startTime;
}
