package com.example.debate_backend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

// DiscussionStatusDto의 내용을 DB에 저장하기 위한 엔티티
@Entity
@Data
@NoArgsConstructor
public class Room {
    @Id
    // @GeneratedValue(strategy = GenerationType.UUID) // Room ID는 우리가 직접 생성 (UUID.randomUUID().substring(0,8))
    private String id; // roomId와 동일하게 사용

    @ManyToOne(fetch = FetchType.LAZY) // Topic과 다대일 관계 (지연 로딩)
    @JoinColumn(name = "topic_id", nullable = false) // 외래 키 컬럼 이름
    private Topic topic;

    @Enumerated(EnumType.STRING) // Enum 이름을 DB에 문자열로 저장
    @Column(nullable = false)
    private RoomStatus status; // WAITING, STARTED 등 (새로운 Enum 정의 필요)

    @Column(length = 500)
    private String message; // 토론 상태 메시지 (예: "토론이 시작되었습니다!")

    private long startTime; // 토론 시작 시간 (Epoch milli)
    private long durationSeconds; // 토론 지속 시간 (초)

    // 이 방에 속한 참가자들 (일대다 관계)
    // mappedBy = "room"은 Participant 엔티티의 'room' 필드에 의해 매핑됨을 의미
    // CascadeType.ALL은 Room이 삭제될 때 관련 Participant도 함께 삭제
    @OneToMany(mappedBy = "room", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Participant> participants; // JPA에서는 @OneToMany 관계를 갖는 List는 DTO와 다름

    // 이 방에 속한 주장들
    @OneToMany(mappedBy = "room", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Argument> arguments;

    public Room(String id, Topic topic, RoomStatus status, String message, long durationSeconds) {
        this.id = id;
        this.topic = topic;
        this.status = status;
        this.message = message;
        this.durationSeconds = durationSeconds;
        this.startTime = 0; // 초기에는 0으로 설정
    }

    // RoomStatus Enum 정의 (DiscussionStatusDto.StatusType과 유사)
    public enum RoomStatus {
        WAITING, STARTED, PAUSED, ENDED, VOTING
    }
}