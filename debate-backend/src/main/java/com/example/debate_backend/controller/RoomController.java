package com.example.debate_backend.controller;

import com.example.debate_backend.dto.ArgumentDto; // ArgumentDto 임포트
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

    @PostMapping("/create")
    public ResponseEntity<DiscussionStatusDto> createRoom() {
        DiscussionStatusDto initialStatus = discussionService.createRoom();
        return ResponseEntity.ok(initialStatus);
    }

    @GetMapping("/{roomId}/status")
    public ResponseEntity<DiscussionStatusDto> getRoomStatus(@PathVariable String roomId) {
        DiscussionStatusDto status = discussionService.getRoomStatus(roomId);
        return status != null ? ResponseEntity.ok(status) : ResponseEntity.notFound().build();
    }

    @GetMapping("/{roomId}/participants")
    public ResponseEntity<List<ParticipantDto>> getParticipants(@PathVariable String roomId) {
        List<ParticipantDto> participants = discussionService.getParticipants(roomId);
        return ResponseEntity.ok(participants);
    }

    @GetMapping("/{roomId}/vote-results")
    public ResponseEntity<VoteResultsDto> getVoteResults(@PathVariable String roomId) {
        VoteResultsDto results = discussionService.getVoteResults(roomId);
        return ResponseEntity.ok(results);
    }

    // 🟢 특정 방의 모든 주장을 가져오는 REST API 엔드포인트 추가
    @GetMapping("/{roomId}/arguments")
    public ResponseEntity<List<ArgumentDto>> getArguments(@PathVariable String roomId) {
        List<ArgumentDto> arguments = discussionService.getArguments(roomId);
        return ResponseEntity.ok(arguments);
    }
}