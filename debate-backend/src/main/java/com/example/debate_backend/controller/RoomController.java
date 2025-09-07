package com.example.debate_backend.controller;

import com.example.debate_backend.dto.DiscussionStatusDto;
import com.example.debate_backend.dto.ParticipantDto;
import com.example.debate_backend.dto.VoteResultsDto;
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
     * @return 생성된 방의 초기 상태 정보 (roomId 포함)
     */
    @PostMapping("/create")
    public ResponseEntity<DiscussionStatusDto> createRoom() {
        DiscussionStatusDto initialStatus = discussionService.createRoom();
        return ResponseEntity.ok(initialStatus);
    }

    /**
     * 특정 토론방의 현재 상태를 조회합니다.
     */
    @GetMapping("/{roomId}/status")
    public ResponseEntity<DiscussionStatusDto> getRoomStatus(@PathVariable String roomId) {
        DiscussionStatusDto status = discussionService.getRoomStatus(roomId);
        return status != null ? ResponseEntity.ok(status) : ResponseEntity.notFound().build();
    }

    /**
     * 특정 토론방의 현재 참가자 목록을 조회합니다.
     */
    @GetMapping("/{roomId}/participants")
    public ResponseEntity<List<ParticipantDto>> getParticipants(@PathVariable String roomId) {
        List<ParticipantDto> participants = discussionService.getParticipants(roomId);
        return ResponseEntity.ok(participants);
    }

    /**
     * 특정 토론방의 현재 투표 결과를 조회합니다.
     */
    @GetMapping("/{roomId}/vote-results")
    public ResponseEntity<VoteResultsDto> getVoteResults(@PathVariable String roomId) {
        VoteResultsDto results = discussionService.getVoteResults(roomId);
        return ResponseEntity.ok(results);
    }
}