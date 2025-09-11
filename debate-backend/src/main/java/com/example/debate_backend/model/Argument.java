package com.example.debate_backend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;

@Entity
@Data
@NoArgsConstructor
public class Argument {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID) // 주장의 ID는 자동 생성
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id", nullable = false)
    private Room room; // 이 주장이 제출된 방

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "participant_id", nullable = false)
    private Participant participant; // 주장을 제출한 참가자

    @Column(nullable = false, length = 1000)
    private String text; // 주장 내용

    @Column(nullable = false)
    private long timestamp; // 주장 제출 시간 (epoch milli)

    @Column(nullable = false)
    private String side; // "for" 또는 "against"

    // Lombok의 AllArgsConstructor를 사용하지 않고 직접 생성자를 정의하여 필수 필드 초기화
    public Argument(Room room, Participant participant, String text, String side) {
        this.room = room;
        this.participant = participant;
        this.text = text;
        this.side = side;
        this.timestamp = Instant.now().toEpochMilli(); // 생성 시 타임스탬프 자동 설정
    }
}