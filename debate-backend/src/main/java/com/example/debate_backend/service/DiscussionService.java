package com.example.debate_backend.service;

import jakarta.persistence.criteria.CriteriaBuilder;
import org.springframework.stereotype.Service;
import com.example.debate_backend.model.ChatMessage;
import com.example.debate_backend.model.DiscussionStatus;
import com.example.debate_backend.model.Participant;
import com.example.debate_backend.model.VoteMessage;
import org.springframework.stereotype.Service;

import java.util.*;
import java.time.Instant;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.stream.Collectors;

@Service
public class DiscussionService {
    // 각 방의 참가자 목록(roomId -> List<Participant>)
    private final Map<String, List<Participant>> roomParticipants = new ConcurrentHashMap<>();
    // 각 방의 현재 상태(roomId -> DiscussionStatus)
    private final Map<String,DiscussionStatus> roomStatuses = new ConcurrentHashMap<>();
    // 각방의 투표 결과(roomId -> Map<side, count>)
    private final Map<String, Map<String, Integer>> roomVotes = new ConcurrentHashMap<>();
    // 토론 주제 목록
    private final List<String> topics = List.of(
            "AI는 인간의 일자리를 위협하는가?",
            "재택근무는 생산성을 향상시키는가?",
            "우주 탐사는 필수적인가?",
            "청소년에게 스마트폰 사용을 전면 금지해야 하는가?",
            "동물 복지를 위해 육식을 금지해야 하는가?"
    );
    private final Random random = new Random();

    // 방 생성
    public String createRoom(){
        String roomId = UUID.randomUUID().toString().substring(0, 8);
        String randomTopic = topics.get(random.nextInt(topics.size()));
        DiscussionStatus initialStatus = new DiscussionStatus(roomId, DiscussionStatus.StatusType.WAITING, "토론 참가자를 기다리는 중 ... ", randomTopic, 0);
        roomStatuses.put(roomId, initialStatus);
        roomParticipants.put(roomId,new CopyOnWriteArrayList<>());
        roomVotes.put(roomId, new ConcurrentHashMap<>());
        roomVotes.get(roomId).put("for", 0);
        roomVotes.get(roomId).put("against",0);
        return roomId;
    }
    // 방의 상태
    public DiscussionStatus getRoomStatus(String roomId){
        return roomStatuses.get(roomId);
    }

    // 방의 참가자 목록
    public List<Participant> getParticipants(String roomId){
        return roomParticipants.getOrDefault(roomId, Collections.emptyList());
    }

    // 방의 참가자 추가
    public List<Participant> addParticipant(String roomId, Participant newParticipant){
        List<Participant> participants = roomParticipants.computeIfAbsent(roomId,k -> new CopyOnWriteArrayList<>());
        if(participants.stream().noneMatch(p->p.getId().equals(newParticipant.getId()))){
            participants.add(newParticipant);
        }
        return participants;
    }
    // 방의 참가자 제거
    public List<Participant> removeParticipant(String roomId, String participantId){
        List<Participant> participants = roomParticipants.get(roomId);
        if(participants != null){
            participants.removeIf(p -> p.getId().equals(participantId));
        }
        return participants;
    }
    // 방 업데이트
    public DiscussionStatus updateDiscussionStatus(String roomId, DiscussionStatus status){
        if(status.getType() == DiscussionStatus.StatusType.STARTED){
            status.setStartTime(Instant.now().toEpochMilli());
        }
        roomStatuses.put(roomId, status);
        return status;
    }
    // 채팅 메시지 저장 / 반환
    public ChatMessage processChatMessage(ChatMessage chatMessage){
        chatMessage.setTimestamp(Instant.now().toString());
        return chatMessage;
    }
    // 투표 처리 후 결과 반환
    public Map<String, Integer> processVote(VoteMessage voteMessage){
        Map<String, Integer> votes = roomVotes.computeIfAbsent(voteMessage.getRoomId(), k -> new ConcurrentHashMap<>());
        votes.merge(voteMessage.getSide(),1,Integer::sum);
        return votes;
    }
    // 투표 결과 반환
    public Map<String, Integer> getVoteResults(String roomId){
        return roomVotes.getOrDefault(roomId, Map.of("for", 0, "against",0));
    }


}
