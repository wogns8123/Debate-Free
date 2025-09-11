package com.example.debate_backend.service;

import com.example.debate_backend.dto.*;
import com.example.debate_backend.model.*;
import com.example.debate_backend.repository.*;
import com.example.debate_backend.service.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.stream.Collectors;

@Service
public class DiscussionService {

    private final TopicRepository topicRepository;
    private final RoomRepository roomRepository;
    private final ParticipantRepository participantRepository;
    private final ArgumentRepository argumentRepository;

    // 🟢 AI Topic Generation Service 필드 선언 (클래스 레벨로 이동)
    // AI 기능을 실제로 사용하려면 이 필드를 주입받아야 합니다.
    // 현재는 주입받지 않으므로 @Autowired를 제거하거나 주입받는 생성자에 추가해야 합니다.
    private final AITopicGenerationService aiTopicGenerationService;

    private final Map<String, Map<String, Integer>> roomVotes = new ConcurrentHashMap<>();

    private final List<String> defaultTopics = List.of(
            "AI는 인간의 일자리를 위협하는가?",
            "재택근무는 생산성을 향상시키는가?",
            "우주 탐사는 필수적인가?",
            "청소년에게 스마트폰 사용을 전면 금지해야 하는가?",
            "동물 복지를 위해 육식을 금지해야 하는가?"
    );
    private final Random random = new Random();

    // 🟢 생성자 수정: aiTopicGenerationService를 주입받도록 변경 (선택 사항)
    // AI 기능을 사용하지 않으면 aiTopicGenerationService 파라미터를 제거하고 생성자에서 관련 로직 제거
    public DiscussionService(TopicRepository topicRepository,
                             RoomRepository roomRepository,
                             ParticipantRepository participantRepository,
                             ArgumentRepository argumentRepository,
                             AITopicGenerationService aiTopicGenerationService) { // 🟢 AI 서비스 주입
        this.topicRepository = topicRepository;
        this.roomRepository = roomRepository;
        this.participantRepository = participantRepository;
        this.argumentRepository = argumentRepository;
        this.aiTopicGenerationService = aiTopicGenerationService; // 🟢 AI 서비스 초기화
        initializeDefaultTopics();
    }

    @Transactional
    public void initializeDefaultTopics() {
        if (topicRepository.count() == 0) {
            defaultTopics.forEach(title -> {
                if (topicRepository.findByTitle(title).isEmpty()) {
                    topicRepository.save(new Topic(title));
                }
            });
            System.out.println("Initialized default topics in DB.");
        }
    }

    public Set<String> getActiveRoomIds() {
        return new HashSet<>(roomRepository.findAll().stream()
                .map(Room::getId)
                .collect(Collectors.toList()));
    }

    /**
     * 새로운 토론방을 생성하고 초기 상태를 설정합니다.
     * @return 생성된 방 ID와 초기 DiscussionStatusDto
     */
    @Transactional
    public DiscussionStatusDto createRoom() {
        Topic selectedTopic;

        Optional<String> aiGeneratedTopicTitle = aiTopicGenerationService.generateTopicFromAI();

        if (aiGeneratedTopicTitle.isPresent()) {
            // AI가 주제를 성공적으로 생성하고 DB에 저장했다면, 해당 주제를 가져옴
            selectedTopic = topicRepository.findByTitle(aiGeneratedTopicTitle.get())
                    .orElseThrow(() -> new IllegalStateException("AI generated topic not found in DB after saving."));
        } else {
            // AI 주제 생성 실패 시 기존 토픽 목록에서 랜덤 선택 (Fallback)
            List<Topic> allTopics = topicRepository.findAll();
            if (allTopics.isEmpty()) {
                throw new IllegalStateException("No topics available in the database to create a room.");
            }
            selectedTopic = allTopics.get(random.nextInt(allTopics.size()));
            System.out.println("Falling back to random topic: " + selectedTopic.getTitle());
        }

        String roomId = UUID.randomUUID().toString().substring(0, 8);

        Room newRoom = new Room(
                roomId,
                selectedTopic,
                Room.RoomStatus.WAITING,
                "토론 참가자를 기다리는 중...",
                300 // 기본 토론 시간 300초 (5분)
        );
        roomRepository.save(newRoom);

        Map<String, Integer> initialVotes = new ConcurrentHashMap<>();
        initialVotes.put("for", 0);
        initialVotes.put("against", 0);
        roomVotes.put(roomId, initialVotes);

        return convertToDto(newRoom);
    }

    @Transactional(readOnly = true)
    public DiscussionStatusDto getRoomStatus(String roomId) {
        return roomRepository.findById(roomId)
                .map(this::convertToDto)
                .orElse(null);
    }

    @Transactional(readOnly = true)
    public List<ParticipantDto> getParticipants(String roomId) {
        return participantRepository.findByRoom_Id(roomId).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public List<ParticipantDto> addOrUpdateParticipant(String roomId, ParticipantDto participantDto) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new IllegalArgumentException("Room not found: " + roomId));

        Optional<Participant> existingParticipantOpt = participantRepository.findByIdAndRoom_Id(participantDto.getId(), roomId);

        Participant participant;
        if (existingParticipantOpt.isPresent()) {
            participant = existingParticipantOpt.get();
            participant.setName(participantDto.getName());
            participant.setSide(participantDto.getSide());
            participant.setColor(participantDto.getColor());
        } else {
            participant = new Participant(
                    participantDto.getId(),
                    room,
                    participantDto.getName(),
                    participantDto.getSide(),
                    participantDto.getColor()
            );
        }
        participantRepository.save(participant);
        return getParticipants(roomId);
    }

    @Transactional
    public List<ParticipantDto> removeParticipant(String roomId, String participantId) {
        participantRepository.deleteById(participantId);

        List<Participant> remainingParticipants = participantRepository.findByRoom_Id(roomId);
        if (remainingParticipants.isEmpty()) {
            roomRepository.deleteById(roomId);
            roomVotes.remove(roomId);
            System.out.println("Room " + roomId + " is empty and has been removed.");
            return null;
        }
        return remainingParticipants.stream().map(this::convertToDto).collect(Collectors.toList());
    }

    @Transactional
    public DiscussionStatusDto updateDiscussionStatus(String roomId, DiscussionStatusDto statusUpdateDto) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new IllegalArgumentException("Room not found: " + roomId));

        Room.RoomStatus newStatusType = Room.RoomStatus.valueOf(statusUpdateDto.getType().name());

        room.setStatus(newStatusType);
        room.setMessage(statusUpdateDto.getMessage());

        if (newStatusType == Room.RoomStatus.STARTED && room.getStartTime() == 0) {
            room.setStartTime(Instant.now().toEpochMilli());
        } else if (newStatusType == Room.RoomStatus.ENDED) {
            long duration = (Instant.now().toEpochMilli() - room.getStartTime()) / 1000;
            room.setDurationSeconds(duration);
        }

        roomRepository.save(room);
        return convertToDto(room);
    }

    public ChatMessageDto processChatMessage(ChatMessageDto chatMessage) {
        chatMessage.setTimestamp(Instant.now().toString());
        return chatMessage;
    }

    @Transactional
    public ArgumentDto processNewArgument(String roomId, ArgumentDto newArgumentDto) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new IllegalArgumentException("Room not found: " + roomId));
        Participant participant = participantRepository.findByIdAndRoom_Id(newArgumentDto.getParticipantId(), roomId)
                .orElseThrow(() -> new IllegalArgumentException("Participant not found in room: " + newArgumentDto.getParticipantId()));

        Argument argument = new Argument(
                room,
                participant,
                newArgumentDto.getText(),
                newArgumentDto.getSide()
        );
        argumentRepository.save(argument);
        return convertToDto(argument);
    }

    @Transactional(readOnly = true)
    public List<ArgumentDto> getArguments(String roomId) {
        return argumentRepository.findByRoomIdWithParticipant(roomId).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public VoteResultsDto processVote(VoteMessageDto voteMessage) {
        Map<String, Integer> votes = roomVotes.computeIfAbsent(voteMessage.getRoomId(), k -> {
            Map<String, Integer> initialVotes = new ConcurrentHashMap<>();
            initialVotes.put("for", 0);
            initialVotes.put("against", 0);
            return initialVotes;
        });

        votes.merge(voteMessage.getSide(), 1, Integer::sum);

        return new VoteResultsDto(voteMessage.getRoomId(), votes);
    }

    public VoteResultsDto getVoteResults(String roomId) {
        Map<String, Integer> votes = roomVotes.getOrDefault(roomId, Map.of("for", 0, "against", 0));
        return new VoteResultsDto(roomId, votes);
    }

    // ==========================================================
    // 🟢 Entity to DTO 변환 헬퍼 메서드 (클래스 레벨로 이동)
    // ==========================================================
    @Transactional(readOnly = true)
    private DiscussionStatusDto convertToDto(Room room) {
        return new DiscussionStatusDto(
                room.getId(),
                DiscussionStatusDto.StatusType.valueOf(room.getStatus().name()),
                room.getMessage(),
                room.getTopic().getTitle(),
                room.getStartTime(),
                room.getDurationSeconds()
        );
    }

    @Transactional(readOnly = true)
    private ParticipantDto convertToDto(Participant participant) {
        return new ParticipantDto(
                participant.getId(),
                participant.getName(),
                participant.getSide(),
                participant.getColor()
        );
    }

    @Transactional(readOnly = true)
    private ArgumentDto convertToDto(Argument argument) {
        return new ArgumentDto(
                argument.getId(),
                argument.getParticipant().getId(),
                argument.getParticipant().getName(),
                argument.getSide(),
                argument.getText(),
                argument.getTimestamp()
        );
    }
}