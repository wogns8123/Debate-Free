package com.example.debate_backend.repository;

import com.example.debate_backend.model.Participant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ParticipantRepository extends JpaRepository<Participant, String> {
    // 특정 방의 모든 참가자 조회
    List<Participant> findByRoom_Id(String roomId);
    // 특정 방에서 ID로 참가자 조회
    Optional<Participant> findByIdAndRoom_Id(String participantId, String roomId);
}