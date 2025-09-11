package com.example.debate_backend.repository;

import com.example.debate_backend.model.Topic;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TopicRepository extends JpaRepository<Topic, String> {
    // 특정 제목으로 토픽을 찾는 메서드 (AI 생성 후 중복 방지 등)
    Optional<Topic> findByTitle(String title);
}