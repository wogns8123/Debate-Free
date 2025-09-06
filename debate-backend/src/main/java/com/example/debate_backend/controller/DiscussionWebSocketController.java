package com.example.debate_backend.controller;

import com.example.debate_backend.model.ChatMessage;
import com.example.debate_backend.model.DiscussionStatus;
import com.example.debate_backend.model.Participant;
import com.example.debate_backend.model.VoteMessage;
import com.example.debate_backend.service.DiscussionService;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.util.List;
import java.util.Map;

@Controller
public class DiscussionWebSocketController {

    private final SimpMessagingTemplate messagingTemplate; // 클라이언트로 메시지를 보내는 역할
    private final DiscussionService discussionService; // 비즈니스 로직 처리

    public DiscussionWebSocketController(SimpMessagingTemplate messagingTemplate, DiscussionService discussionService) {
        this.messagingTemplate = messagingTemplate;
        this.discussionService = discussionService;
    }

    /**
     * 새로운 참가자가 토론방에 참여했을 때 호출됩니다.
     * 클라이언트: STOMP send to "/app/{roomId}/join"
     * 서버: "/topic/room/{roomId}/participants"로 업데이트된 참가자 목록 브로드캐스트
     */
    @MessageMapping("/{roomId}/join")
    public void joinRoom(@DestinationVariable String roomId, @Payload Participant newParticipant) {
        List<Participant> updatedParticipants = discussionService.addParticipant(roomId, newParticipant);
        System.out.println(newParticipant.getName() + " joined room " + roomId);

        // 업데이트된 참가자 목록을 방의 모든 구독자에게 전송
        messagingTemplate.convertAndSend(
                "/topic/room/" + roomId + "/participants",
                updatedParticipants
        );

        // 참가자에게 현재 방 상태 정보 전송 (선택 사항)
        // messagingTemplate.convertAndSendToUser(
        //    newParticipant.getId(), // 여기서는 participant.id를 user principal 이름으로 가정
        //    "/queue/status",
        //    discussionService.getRoomStatus(roomId)
        // );
    }

    /**
     * 참가자가 토론방을 나갔을 때 호출됩니다.
     * 클라이언트: STOMP send to "/app/{roomId}/leave"
     * 서버: "/topic/room/{roomId}/participants"로 업데이트된 참가자 목록 브로드캐스트
     */
    @MessageMapping("/{roomId}/leave")
    public void leaveRoom(@DestinationVariable String roomId, @Payload Participant leavingParticipant) {
        List<Participant> updatedParticipants = discussionService.removeParticipant(roomId, leavingParticipant.getId());
        System.out.println(leavingParticipant.getName() + " left room " + roomId);

        // 업데이트된 참가자 목록을 방의 모든 구독자에게 전송
        messagingTemplate.convertAndSend(
                "/topic/room/" + roomId + "/participants",
                updatedParticipants
        );
    }

    /**
     * 클라이언트가 채팅 메시지를 보낼 때 호출됩니다.
     * 클라이언트: STOMP send to "/app/{roomId}/chat.sendMessage"
     * 서버: "/topic/room/{roomId}/chat"으로 메시지 브로드캐스트
     */
    @MessageMapping("/{roomId}/chat.sendMessage")
    public void sendChatMessage(@DestinationVariable String roomId, @Payload ChatMessage chatMessage) {
        chatMessage.setRoomId(roomId); // 방 ID 설정 (혹시 클라이언트에서 누락될 경우)
        ChatMessage processedMessage = discussionService.processChatMessage(chatMessage);
        System.out.println("Chat in room " + roomId + " from " + processedMessage.getSender() + ": " + processedMessage.getContent());

        messagingTemplate.convertAndSend(
                "/topic/room/" + roomId + "/chat",
                processedMessage
        );
    }

    /**
     * 토론 시작/종료 등의 상태 변경을 처리합니다.
     * 클라이언트: STOMP send to "/app/{roomId}/status.update"
     * 서버: "/topic/room/{roomId}/status"로 상태 정보 브로드캐스트
     */
    @MessageMapping("/{roomId}/status.update")
    public void updateDiscussionStatus(@DestinationVariable String roomId, @Payload DiscussionStatus status) {
        status.setRoomId(roomId); // 방 ID 설정
        DiscussionStatus updatedStatus = discussionService.updateDiscussionStatus(roomId, status);
        System.out.println("Room " + roomId + " status updated to: " + updatedStatus.getType() + " - " + updatedStatus.getMessage());

        messagingTemplate.convertAndSend(
                "/topic/room/" + roomId + "/status",
                updatedStatus
        );
    }

    /**
     * 클라이언트가 투표를 제출할 때 호출됩니다.
     * 클라이언트: STOMP send to "/app/{roomId}/vote"
     * 서버: "/topic/room/{roomId}/vote-results"로 업데이트된 투표 결과 브로드캐스트
     */
    @MessageMapping("/{roomId}/vote")
    public void handleVote(@DestinationVariable String roomId, @Payload VoteMessage voteMessage) {
        voteMessage.setRoomId(roomId); // 방 ID 설정
        Map<String, Integer> updatedVoteResults = discussionService.processVote(voteMessage);
        System.out.println("Room " + roomId + " vote for " + voteMessage.getSide() + " by " + voteMessage.getVoterId());

        messagingTemplate.convertAndSend(
                "/topic/room/" + roomId + "/vote-results",
                updatedVoteResults
        );
    }
}