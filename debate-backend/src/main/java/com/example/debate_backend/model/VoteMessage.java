package com.example.debate_backend.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VoteMessage {
    private String voterId;
    private String roomId;
    private String side;
}
