package com.example.debate_backend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
public class Participant {
    @Id
    private String id; // WebSocket Session ID 또는 사용자 고유 ID

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id", nullable = false)
    private Room room; // 이 참가자가 속한 방

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String side; // "for", "against", "none"

    @Column(nullable = false)
    private String color; // UI 표시용 색상 코드

    public Participant(String id, Room room, String name, String side, String color) {
        this.id = id;
        this.room = room;
        this.name = name;
        this.side = side;
        this.color = color;
    }
}