package com.example.debate_backend.repository;

import com.example.debate_backend.model.Argument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ArgumentRepository extends JpaRepository<Argument, String> {
    // 특정 방의 모든 주장 조회
    @Query("SELECT a FROM Argument a JOIN FETCH a.participant p WHERE a.room.id = :roomId ORDER BY a.timestamp ASC")
    List<Argument> findByRoomIdWithParticipant(@Param("roomId") String roomId);
}