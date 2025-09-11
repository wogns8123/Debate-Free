package com.example.debate_backend.controller;

import com.example.debate_backend.dto.*;
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

    private final SimpMessagingTemplate messagingTemplate;
    private final DiscussionService discussionService;

    public DiscussionWebSocketController(SimpMessagingTemplate messagingTemplate, DiscussionService discussionService) {
        this.messagingTemplate = messagingTemplate;
        this.discussionService = discussionService;
    }

    @MessageMapping("/{roomId}/join")
    public void joinRoom(@DestinationVariable String roomId, @Payload ParticipantDto newParticipant) {
        List<ParticipantDto> updatedParticipants = discussionService.addOrUpdateParticipant(roomId, newParticipant);
        System.out.println("Participant " + newParticipant.getName() + " (" + newParticipant.getId() + ") joined room " + roomId);
        messagingTemplate.convertAndSend(
                "/topic/room/" + roomId + "/participants",
                updatedParticipants
        );
    }

    @MessageMapping("/{roomId}/leave")
    public void leaveRoom(@DestinationVariable String roomId, @Payload ParticipantDto leavingParticipant) {
        List<ParticipantDto> updatedParticipants = discussionService.removeParticipant(roomId, leavingParticipant.getId());
        System.out.println("Participant " + leavingParticipant.getName() + " (" + leavingParticipant.getId() + ") left room " + roomId);
        if (updatedParticipants != null) {
            messagingTemplate.convertAndSend(
                    "/topic/room/" + roomId + "/participants",
                    updatedParticipants
            );
        }
    }

    @MessageMapping("/{roomId}/chat.sendMessage")
    public void sendChatMessage(@DestinationVariable String roomId, @Payload ChatMessageDto chatMessage) {
        chatMessage.setRoomId(roomId);
        ChatMessageDto processedMessage = discussionService.processChatMessage(chatMessage);
        System.out.println("Chat in room " + roomId + " from " + processedMessage.getSender() + ": " + processedMessage.getContent());
        messagingTemplate.convertAndSend(
                "/topic/room/" + roomId + "/chat",
                processedMessage
        );
    }

    @MessageMapping("/{roomId}/status.update")
    public void updateDiscussionStatus(@DestinationVariable String roomId, @Payload DiscussionStatusDto status) {
        status.setRoomId(roomId);
        DiscussionStatusDto updatedStatus = discussionService.updateDiscussionStatus(roomId, status);
        System.out.println("Room " + roomId + " status updated to: " + updatedStatus.getType() + " - " + updatedStatus.getMessage());
        messagingTemplate.convertAndSend(
                "/topic/room/" + roomId + "/status",
                updatedStatus
        );
    }

    @MessageMapping("/{roomId}/vote")
    public void handleVote(@DestinationVariable String roomId, @Payload VoteMessageDto voteMessage) {
        voteMessage.setRoomId(roomId);
        VoteResultsDto updatedVoteResults = discussionService.processVote(voteMessage);
        System.out.println("Room " + roomId + " vote for " + voteMessage.getSide() + " by " + voteMessage.getVoterId());
        messagingTemplate.convertAndSend(
                "/topic/room/" + roomId + "/vote-results",
                updatedVoteResults.getResults()
        );
    }

    // 🟢 새로운 주장 제출 WebSocket 엔드포인트
    @MessageMapping("/{roomId}/argument.submit")
    public void submitArgument(@DestinationVariable String roomId, @Payload ArgumentDto newArgumentDto) {
        ArgumentDto processedArgument = discussionService.processNewArgument(roomId, newArgumentDto);
        System.out.println("New argument in room " + roomId + " from " + processedArgument.getParticipantName() + ": " + processedArgument.getText());
        messagingTemplate.convertAndSend(
                "/topic/room/" + roomId + "/argument.new",
                processedArgument
        );
    }
}