package com.example.debate_backend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity // JPA 엔티티임을 명시
@Data // Lombok: Getter, Setter, equals, hashCode, toString 자동 생성
@NoArgsConstructor // Lombok: 기본 생성자 자동 생성
public class Topic {
    @Id // 기본 키
    @GeneratedValue(strategy = GenerationType.UUID) // UUID로 ID 자동 생성
    private String id;

    @Column(nullable = false, unique = true, length = 255) // Null 불허, 유니크, 길이 제한
    private String title;

    @CreationTimestamp // 엔티티 생성 시 자동으로 현재 시간 기록
    @Column(nullable = false, updatable = false) // 생성 후 변경 불가
    private LocalDateTime createdAt;

    // 추가 필드 (예: 난이도, 카테고리)
    // private String difficulty;
    // private String category;

    public Topic(String title) {
        this.title = title;
    }
}