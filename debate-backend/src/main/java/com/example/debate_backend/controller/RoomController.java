package com.example.debate_backend.controller;

import com.example.debate_backend.model.DiscussionStatus;
import com.example.debate_backend.model.Participant;
import com.example.debate_backend.service.DiscussionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/rooms")
public class RoomController {

    private final DiscussionService discussionService;

    public RoomController(DiscussionService discussionService) {
        this.discussionService = discussionService;
    }

    /**
     * 새로운 토론방을 생성합니다.
     * @return 생성된 방 ID와 초기 상태를 포함한 응답
     */
    @PostMapping("/create")
    public ResponseEntity<Map<String, String>> createRoom() {
        String roomId = discussionService.createRoom();
        return ResponseEntity.ok(Map.of("roomId", roomId, "message", "Room created successfully."));
    }

    /**
     * 특정 토론방의 현재 상태를 조회합니다.
     */
    @GetMapping("/{roomId}/status")
    public ResponseEntity<DiscussionStatus> getRoomStatus(@PathVariable String roomId) {
        DiscussionStatus status = discussionService.getRoomStatus(roomId);
        return status != null ? ResponseEntity.ok(status) : ResponseEntity.notFound().build();
    }

    /**
     * 특정 토론방의 현재 참가자 목록을 조회합니다.
     */
    @GetMapping("/{roomId}/participants")
    public ResponseEntity<List<Participant>> getParticipants(@PathVariable String roomId) {
        List<Participant> participants = discussionService.getParticipants(roomId);
        return ResponseEntity.ok(participants);
    }

    /**
     * 특정 토론방의 현재 투표 결과를 조회합니다.
     */
    @GetMapping("/{roomId}/vote-results")
    public ResponseEntity<Map<String, Integer>> getVoteResults(@PathVariable String roomId) {
        Map<String, Integer> results = discussionService.getVoteResults(roomId);
        return ResponseEntity.ok(results);
    }
}
