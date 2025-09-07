package com.example.debate_backend.handler;

import com.example.debate_backend.dto.ChatMessageDto;
import com.example.debate_backend.dto.ParticipantDto;
import com.example.debate_backend.service.DiscussionService;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectedEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Component
public class WebSocketEventListener {

    private final SimpMessageSendingOperations messagingTemplate;
    private final DiscussionService discussionService;

    public WebSocketEventListener(SimpMessageSendingOperations messagingTemplate, DiscussionService discussionService) {
        this.messagingTemplate = messagingTemplate;
        this.discussionService = discussionService;
    }

    /**
     * WebSocket 세션 연결 이벤트 처리
     * 여기서는 특별한 로직을 추가하지 않지만, 사용자 인증 정보 등을 가져올 수 있습니다.
     */
    @EventListener
    public void handleWebSocketConnectListener(SessionConnectedEvent event) {
        // System.out.println("Received a new web socket connection");
        // 클라이언트에서 /app/{roomId}/join 메시지를 보내기 때문에 여기서 직접 참가자 추가는 하지 않습니다.
    }

    /**
     * WebSocket 세션 연결 해제 이벤트 처리
     * 사용자가 연결을 끊으면 해당 참가자를 방에서 제거하고, 업데이트된 목록을 브로드캐스트합니다.
     */
    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        String sessionId = headerAccessor.getSessionId();

        if (sessionId == null) {
            return; // 세션 ID가 없으면 처리 불가
        }

        System.out.println("WebSocket Disconnected: " + sessionId);

        // ======================= 에러 수정 부분 =======================
        // .forEach(roomId -> ...) 람다 대신, 명시적인 for-each 루프를 사용하여 타입 추론 문제를 해결합니다.

        Set<String> roomIds = discussionService.getActiveRoomIds();

        // 모든 방을 순회하며 해당 참가자를 찾아서 제거
        for (String roomId : roomIds) {
            List<ParticipantDto> participants = discussionService.getParticipants(roomId);
            Optional<ParticipantDto> disconnectedParticipantOpt = participants.stream()
                    .filter(p -> sessionId.equals(p.getId()))
                    .findFirst();

            // 만약 해당 방에서 연결이 끊긴 참가자를 찾았다면
            if (disconnectedParticipantOpt.isPresent()) {
                ParticipantDto disconnectedParticipant = disconnectedParticipantOpt.get();
                List<ParticipantDto> updatedParticipants = discussionService.removeParticipant(roomId, disconnectedParticipant.getId());
                System.out.println("Participant " + disconnectedParticipant.getName() + " (" + disconnectedParticipant.getId() + ") auto-left room " + roomId + " due to disconnect.");

                if (updatedParticipants != null) {
                    // 1. 업데이트된 참가자 목록을 브로드캐스트
                    messagingTemplate.convertAndSend(
                            "/topic/room/" + roomId + "/participants",
                            updatedParticipants
                    );

                    // 2. 채팅방에 퇴장 메시지 브로드캐스트
                    ChatMessageDto chatMessage = new ChatMessageDto(
                            ChatMessageDto.MessageType.LEAVE,
                            disconnectedParticipant.getName() + "님이 퇴장했습니다.",
                            "System",
                            roomId,
                            Instant.now().toString()
                    );
                    messagingTemplate.convertAndSend("/topic/room/" + roomId + "/chat", chatMessage);
                }
                // 한 사용자는 하나의 방에만 참여한다고 가정하고, 찾았으면 루프를 중단. (성능 향상)
                break;
            }
        }
        // ==========================================================
    }
}