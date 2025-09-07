package com.example.debate_backend.controller;

import com.example.debate_backend.dto.ChatMessageDto;
import com.example.debate_backend.dto.DiscussionStatusDto;
import com.example.debate_backend.dto.ParticipantDto;
import com.example.debate_backend.dto.VoteMessageDto;
import com.example.debate_backend.dto.VoteResultsDto;
import com.example.debate_backend.service.DiscussionService;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import com.example.debate_backend.dto.ArgumentDto;
import java.util.List;

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
    public void joinRoom(@DestinationVariable String roomId, @Payload ParticipantDto newParticipant) {
        // 서비스 계층에서 참가자 추가 및 업데이트 로직 처리
        List<ParticipantDto> updatedParticipants = discussionService.addOrUpdateParticipant(roomId, newParticipant);
        System.out.println("Participant " + newParticipant.getName() + " (" + newParticipant.getId() + ") joined room " + roomId);

        // 업데이트된 참가자 목록을 방의 모든 구독자에게 전송
        messagingTemplate.convertAndSend(
                "/topic/room/" + roomId + "/participants",
                updatedParticipants
        );

        // (선택 사항) 새로 참여한 사용자에게만 현재 방 상태와 투표 결과 전송
        // 이 부분은 클라이언트가 처음 연결 시 REST API를 통해 가져오는 것이 더 효율적일 수 있습니다.
        // String userSpecificQueue = "/queue/user/" + newParticipant.getId() + "/status"; // 개인 큐 경로
        // messagingTemplate.convertAndSendToUser(newParticipant.getId(), userSpecificQueue, discussionService.getRoomStatus(roomId));
        // messagingTemplate.convertAndSendToUser(newParticipant.getId(), userSpecificQueue, discussionService.getVoteResults(roomId));
    }

    // 참고: 참가자 퇴장 처리는 `WebSocketEventListener`에서 WebSocket 세션 종료 시 자동으로 처리하는 것이 더 견고합니다.
    // @MessageMapping("/{roomId}/leave") 메서드는 클라이언트가 명시적으로 퇴장 버튼을 누를 때 사용할 수 있습니다.
    @MessageMapping("/{roomId}/leave")
    public void leaveRoom(@DestinationVariable String roomId, @Payload ParticipantDto leavingParticipant) {
        List<ParticipantDto> updatedParticipants = discussionService.removeParticipant(roomId, leavingParticipant.getId());
        System.out.println("Participant " + leavingParticipant.getName() + " (" + leavingParticipant.getId() + ") left room " + roomId);

        if (updatedParticipants != null) { // 방이 아직 존재하고 참가자가 남아있을 경우
            messagingTemplate.convertAndSend(
                    "/topic/room/" + roomId + "/participants",
                    updatedParticipants
            );
        }
    }


    /**
     * 클라이언트가 채팅 메시지를 보낼 때 호출됩니다.
     * 클라이언트: STOMP send to "/app/{roomId}/chat.sendMessage"
     * 서버: "/topic/room/{roomId}/chat"으로 메시지 브로드캐스트
     */
    @MessageMapping("/{roomId}/chat.sendMessage")
    public void sendChatMessage(@DestinationVariable String roomId, @Payload ChatMessageDto chatMessage) {
        chatMessage.setRoomId(roomId); // 방 ID 설정
        ChatMessageDto processedMessage = discussionService.processChatMessage(chatMessage);
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
    public void updateDiscussionStatus(@DestinationVariable String roomId, @Payload DiscussionStatusDto status) {
        status.setRoomId(roomId); // 방 ID 설정
        DiscussionStatusDto updatedStatus = discussionService.updateDiscussionStatus(roomId, status);
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
    public void handleVote(@DestinationVariable String roomId, @Payload VoteMessageDto voteMessage) {
        // 투표한 사용자 ID와 방 ID를 기준으로 한 번만 투표할 수 있도록 서비스 계층에서 제어 가능
        voteMessage.setRoomId(roomId); // 방 ID 설정
        VoteResultsDto updatedVoteResults = discussionService.processVote(voteMessage);
        System.out.println("Room " + roomId + " vote for " + voteMessage.getSide() + " by " + voteMessage.getVoterId());

        messagingTemplate.convertAndSend(
                "/topic/room/" + roomId + "/vote-results",
                updatedVoteResults.getResults() // 클라이언트는 Map<String, Integer>를 받도록 변경
        );
    }

    /**
     * 클라이언트가 새로운 주장을 제출할 때 호출됩니다.
     * 클라이언트: STOMP send to "/app/{roomId}/argument.submit"
     * 서버: "/topic/room/{roomId}/arguments"로 업데이트된 주장 목록 브로드캐스트 (또는 새 주장 하나만)
     */
    @MessageMapping("/{roomId}/argument.submit")
    public void submitArgument(@DestinationVariable String roomId, @Payload ArgumentDto newArgumentDto) {
        // 서비스 계층을 호출하여 주장을 처리하고, ID와 timestamp가 부여된 객체를 받습니다.
        ArgumentDto processedArgument = discussionService.processNewArgument(roomId, newArgumentDto);

        System.out.println("New argument in room " + roomId + " from " + processedArgument.getParticipantName());

        // 옵션 1: 새로 추가된 주장 하나만 브로드캐스트 (효율적)
        messagingTemplate.convertAndSend(
                "/topic/room/" + roomId + "/argument.new", // 토픽 이름을 다르게 하여 구분
                processedArgument
        );

        // 옵션 2: 전체 주장 목록을 다시 브로드캐스트 (간단하지만 비효율적일 수 있음)
        // List<ArgumentDto> allArguments = discussionService.getArguments(roomId); // getArguments 메서드 필요
        // messagingTemplate.convertAndSend("/topic/room/" + roomId + "/arguments", allArguments);
    }
}