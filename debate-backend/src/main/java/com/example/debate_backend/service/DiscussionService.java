package com.example.debate_backend.service;

import com.example.debate_backend.dto.*;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.stream.Collectors;

@Service
public class DiscussionService {

    // 각 방의 참가자 목록 (roomId -> List<ParticipantDto>)
    private final Map<String, List<ParticipantDto>> roomParticipants = new ConcurrentHashMap<>();
    // 각 방의 현재 상태 (roomId -> DiscussionStatusDto)
    private final Map<String, DiscussionStatusDto> roomStatuses = new ConcurrentHashMap<>();
    // 각 방의 투표 결과 (roomId -> Map<side, count>)
    private final Map<String, Map<String, Integer>> roomVotes = new ConcurrentHashMap<>();
    // 각 방의 주장 목록 (roomId -> List<ArgumentDto>)
    private final Map<String, List<ArgumentDto>> roomArguments = new ConcurrentHashMap<>();
    // 토론 주제 목록
    private final List<String> topics = List.of(
            "AI는 인간의 일자리를 위협하는가?",
            "재택근무는 생산성을 향상시키는가?",
            "우주 탐사는 필수적인가?",
            "청소년에게 스마트폰 사용을 전면 금지해야 하는가?",
            "동물 복지를 위해 육식을 금지해야 하는가?"
    );
    private final Random random = new Random();
    /**
     * 현재 활성화된 모든 방의 ID 목록을 반환합니다.
     * WebSocketEventListener에서 연결이 끊긴 사용자가 어느 방에 있었는지 찾기 위해 사용됩니다.
     * @return Set of room IDs
     */
    public Set<String> getActiveRoomIds() {
        return roomStatuses.keySet();
    }

    /**
     * 새로운 토론방을 생성하고 초기 상태를 설정합니다.
     * @return 생성된 방 ID와 초기 DiscussionStatusDto
     */
    public DiscussionStatusDto createRoom() {
        String roomId = UUID.randomUUID().toString().substring(0, 8); // 간략한 방 ID
        String randomTopic = topics.get(random.nextInt(topics.size()));

        DiscussionStatusDto initialStatus = new DiscussionStatusDto(
                roomId,
                DiscussionStatusDto.StatusType.WAITING,
                "토론 참가자를 기다리는 중...",
                randomTopic,
                0, // startTime
                0  // durationSeconds
        );
        roomStatuses.put(roomId, initialStatus);
        roomParticipants.put(roomId, new CopyOnWriteArrayList<>()); // 동시성 문제 방지
        roomVotes.put(roomId, new ConcurrentHashMap<>());
        roomVotes.get(roomId).put("for", 0);
        roomVotes.get(roomId).put("against", 0);
        roomArguments.put(roomId, new CopyOnWriteArrayList<>());
        return initialStatus;
    }

    /**
     * 특정 방의 상태를 가져옵니다.
     */
    public DiscussionStatusDto getRoomStatus(String roomId) {
        return roomStatuses.get(roomId);
    }

    /**
     * 특정 방의 참가자 목록을 가져옵니다.
     */
    public List<ParticipantDto> getParticipants(String roomId) {
        return roomParticipants.getOrDefault(roomId, Collections.emptyList());
    }

    /**
     * 참가자를 방에 추가합니다. 이미 참여한 참가자면 업데이트합니다.
     * @return 업데이트된 참가자 목록
     */
    public List<ParticipantDto> addOrUpdateParticipant(String roomId, ParticipantDto newParticipant) {
        List<ParticipantDto> participants = roomParticipants.computeIfAbsent(roomId, k -> new CopyOnWriteArrayList<>());

        // 이미 있는 참가자인지 확인 (ID로)
        Optional<ParticipantDto> existingParticipant = participants.stream()
                .filter(p -> p.getId().equals(newParticipant.getId()))
                .findFirst();

        if (existingParticipant.isPresent()) {
            // 기존 참가자 정보 업데이트 (예: side, name, color 변경 가능)
            ParticipantDto p = existingParticipant.get();
            p.setName(newParticipant.getName());
            p.setSide(newParticipant.getSide());
            p.setColor(newParticipant.getColor());
        } else {
            // 새로운 참가자 추가
            participants.add(newParticipant);
        }
        return participants;
    }

    /**
     * 참가자를 방에서 제거합니다.
     * @return 업데이트된 참가자 목록
     */
    public List<ParticipantDto> removeParticipant(String roomId, String participantId) {
        List<ParticipantDto> participants = roomParticipants.get(roomId);
        if (participants != null) {
            participants.removeIf(p -> p.getId().equals(participantId));
            if (participants.isEmpty()) {
                // 모든 참가자가 나갔을 경우, 방 상태 초기화 (선택 사항)
                roomStatuses.remove(roomId);
                roomVotes.remove(roomId);
                roomParticipants.remove(roomId);
                System.out.println("Room " + roomId + " is empty and removed.");
            }
        }
        return participants;
    }

    /**
     * 토론방의 상태를 업데이트합니다.
     */
    public DiscussionStatusDto updateDiscussionStatus(String roomId, DiscussionStatusDto status) {
        DiscussionStatusDto currentStatus = roomStatuses.get(roomId);
        if (currentStatus == null) {
            // 방이 존재하지 않음
            throw new IllegalArgumentException("Room " + roomId + " not found.");
        }

        // 상태 전환 로직 (예: WAITING -> STARTED, STARTED -> VOTING -> ENDED)
        if (status.getType() == DiscussionStatusDto.StatusType.STARTED && currentStatus.getType() == DiscussionStatusDto.StatusType.WAITING) {
            status.setStartTime(Instant.now().toEpochMilli()); // 시작 시간 기록
            status.setCurrentTopic(currentStatus.getCurrentTopic()); // 기존 주제 유지
        } else if (status.getType() == DiscussionStatusDto.StatusType.VOTING && currentStatus.getType() == DiscussionStatusDto.StatusType.STARTED) {
            // 투표 시작
            status.setStartTime(currentStatus.getStartTime()); // 시작 시간 유지
            status.setCurrentTopic(currentStatus.getCurrentTopic()); // 기존 주제 유지
        } else if (status.getType() == DiscussionStatusDto.StatusType.ENDED) {
            // 종료 시점
            status.setStartTime(currentStatus.getStartTime()); // 시작 시간 유지
            status.setCurrentTopic(currentStatus.getCurrentTopic()); // 기존 주제 유지
            status.setDurationSeconds((Instant.now().toEpochMilli() - currentStatus.getStartTime()) / 1000); // 총 토론 시간 계산
        } else {
            // 유효하지 않은 상태 전환 또는 기타 업데이트
            status.setStartTime(currentStatus.getStartTime());
            status.setCurrentTopic(currentStatus.getCurrentTopic());
            status.setDurationSeconds(currentStatus.getDurationSeconds());
        }

        roomStatuses.put(roomId, status);
        return status;
    }

    /**
     * 채팅 메시지를 처리하고 반환합니다.
     */
    public ChatMessageDto processChatMessage(ChatMessageDto chatMessage) {
        chatMessage.setTimestamp(Instant.now().toString()); // 서버에서 타임스탬프 설정
        // 실제로는 DB에 저장하는 로직이 들어갈 수 있습니다.
        return chatMessage;
    }

    /**
     * 투표를 처리하고 업데이트된 투표 결과를 반환합니다.
     */
    public VoteResultsDto processVote(VoteMessageDto voteMessage) {
        Map<String, Integer> votes = roomVotes.computeIfAbsent(voteMessage.getRoomId(), k -> {
            Map<String, Integer> initialVotes = new ConcurrentHashMap<>();
            initialVotes.put("for", 0);
            initialVotes.put("against", 0);
            return initialVotes;
        });

        votes.merge(voteMessage.getSide(), 1, Integer::sum); // 선택한 쪽에 1 추가

        return new VoteResultsDto(voteMessage.getRoomId(), votes);
    }

    /**
     * 특정 방의 현재 투표 결과를 가져옵니다.
     */
    public VoteResultsDto getVoteResults(String roomId) {
        Map<String, Integer> votes = roomVotes.getOrDefault(roomId, Map.of("for", 0, "against", 0));
        return new VoteResultsDto(roomId, votes);
    }

    /**
     * 클라이언트로부터 받은 새로운 주장을 처리합니다.
     * @param roomId 주장이 제출된 방 ID
     * @param newArgumentDto 클라이언트가 보낸 주장 데이터
     * @return 서버에서 ID와 timestamp를 부여한 완전한 ArgumentDto
     */
    public ArgumentDto processNewArgument(String roomId, ArgumentDto newArgumentDto) {
        // 1. 주장의 고유 ID를 서버에서 생성 (UUID 사용)
        newArgumentDto.setId(UUID.randomUUID().toString());

        // 2. 타임스탬프를 서버 시간 기준으로 long 타입(epoch milliseconds)으로 설정
        // 이렇게 하면 클라이언트가 시간을 조작할 수 없습니다.
        newArgumentDto.setTimestamp(Instant.now().toEpochMilli());

        // 3. 해당 방의 주장 목록을 가져옵니다.
        List<ArgumentDto> arguments = roomArguments.get(roomId);
        if (arguments != null) {
            // 4. 주장 목록에 새로운 주장을 추가합니다.
            arguments.add(newArgumentDto);
        } else {
            // 방이 존재하지 않는 예외적인 경우
            // 실제 서비스에서는 로깅을 하거나 예외를 던지는 것이 좋습니다.
            System.err.println("Warning: Room " + roomId + " not found for new argument.");
        }

        // 5. 완성된 주장 객체를 컨트롤러로 반환합니다.
        // 컨트롤러는 이 객체를 모든 클라이언트에게 브로드캐스트하게 됩니다.
        return newArgumentDto;
    }
}