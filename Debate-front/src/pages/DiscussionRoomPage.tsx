import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

import { ParticipantDto, ChatMessageDto, DiscussionStatusDto, VoteResultsDto, Argument, Debate, User } from '../types';
import { DebateRoom } from '../components/DebateRoom'; 

const DiscussionRoomPage: React.FC = () => {
    const { roomId } = useParams<{ roomId: string }>();
    const navigate = useNavigate();

    // WebSocket 클라이언트 인스턴스와 Ref
    const [stompClient, setStompClient] = useState<Stomp.Client | null>(null);
    const stompClientRef = useRef<Stomp.Client | null>(null);

    // 백엔드에서 실시간으로 받아오는 데이터 상태들
    const [participants, setParticipants] = useState<ParticipantDto[]>([]);
    const [chatMessages, setChatMessages] = useState<ChatMessageDto[]>([]);
    const [discussionStatus, setDiscussionStatus] = useState<DiscussionStatusDto | null>(null);
    const [voteResults, setVoteResults] = useState<VoteResultsDto>({ for: 0, against: 0 });
    const [argumentsList, setArgumentsList] = useState<Argument[]>([]);

    // 현재 접속한 사용자(나 자신)의 참가자 정보
    const [myParticipant, setMyParticipant] = useState<ParticipantDto | null>(null);
    
    // 현재 사용자(User) 정보 - 로그인 기능이 없으므로 임시로 ID와 이름 생성
    const currentUser: User = useMemo(() => ({ id: uuidv4(), name: `Guest-${Math.floor(Math.random() * 1000)}` }), []);

    // 타이머 관련 상태
    const [timeRemaining, setTimeRemaining] = useState(0); // 남은 시간 (초)
    const [isTimerRunning, setIsTimerRunning] = useState(false); // 타이머 실행 여부

    // --- 콜백 함수 정의 (useCallback으로 최적화 및 의존성 관리) ---

    // 1. 방 나가기 핸들러
    const handleLeaveDebate = useCallback(() => {
        console.log("Leaving debate room");
        navigate('/'); // 홈 페이지로 이동
    }, [navigate]);

    // 2. 토론 상태 업데이트 (백엔드로 전송)
    const sendStatusUpdate = useCallback((type: DiscussionStatusDto['type'], message: string) => {
        if (!stompClient || !roomId) return;
        const statusUpdate: Partial<DiscussionStatusDto> = { type, message };
        stompClient.send(`/app/${roomId}/status.update`, {}, JSON.stringify(statusUpdate));
    }, [stompClient, roomId]);

    // 3. 토론 시작 핸들러
    const handleStartDebate = useCallback(() => {
        setIsTimerRunning(true);
        sendStatusUpdate('STARTED', '토론이 시작되었습니다!');
    }, [sendStatusUpdate]);

    // 4. 토론 일시 정지 핸들러
    const handlePauseDebate = useCallback(() => {
        setIsTimerRunning(false);
        sendStatusUpdate('PAUSED', '토론이 일시 중지되었습니다.');
    }, [sendStatusUpdate]);

    // 5. 토론 종료 핸들러
    const handleEndDebate = useCallback(() => {
        setIsTimerRunning(false);
        sendStatusUpdate('ENDED', '토론이 종료되었습니다.');
    }, [sendStatusUpdate]);

    // 6. 투표 시작 핸들러
    const handleStartVoting = useCallback(() => {
        setIsTimerRunning(false); // 투표 중에는 타이머 멈춤
        sendStatusUpdate('VOTING', '투표가 시작되었습니다!');
    }, [sendStatusUpdate]);

    // 7. 새로운 주장 추가 핸들러 (백엔드로 전송)
    const handleAddArgument = useCallback((text: string, participantId: string) => {
        if (!stompClient || !myParticipant || !roomId || !text.trim()) return;

        // 진영이 'none'인 참가자는 주장 제출 불가
        if (myParticipant.side === 'none') {
            console.warn("Cannot add argument: My participant has no assigned side.");
            return;
        }

        const newArgument: Omit<Argument, 'id' | 'timestamp' | 'participantName'> = {
            participantId: participantId,
            side: myParticipant.side,
            text: text
        };
        stompClient.send(`/app/${roomId}/argument.submit`, {}, JSON.stringify(newArgument));
    }, [stompClient, myParticipant, roomId]);

    // 8. 채팅 메시지 전송 핸들러 (백엔드로 전송)
    const sendChatMessage = useCallback((content: string) => {
        if (!stompClient || !myParticipant || !roomId || !content.trim()) return;
        const chatMsg: Omit<ChatMessageDto, 'timestamp' | 'roomId'> = {
            type: 'CHAT', content, sender: myParticipant.name,
        };
        stompClient.send(`/app/${roomId}/chat.sendMessage`, {}, JSON.stringify(chatMsg));
    }, [stompClient, myParticipant, roomId]);

    // 9. 투표 전송 핸들러 (백엔드로 전송)
    const sendVote = useCallback((side: 'for' | 'against') => {
        if (!stompClient || !myParticipant || !roomId) return;
        const voteMsg = { voterId: myParticipant.id, side };
        stompClient.send(`/app/${roomId}/vote`, {}, JSON.stringify(voteMsg));
    }, [stompClient, myParticipant, roomId]);


    // --- useEffect 훅으로 사이드 이펙트 관리 ---

    // 1. WebSocket 연결 및 초기 데이터 로딩
    useEffect(() => {
        if (!roomId) { // roomId가 없으면 홈으로 리다이렉트
            navigate('/');
            return;
        }

        // 컴포넌트 마운트 시 초기 REST API 데이터 fetching
        const fetchInitialData = async () => {
            try {
                const statusRes = await axios.get<DiscussionStatusDto>(`/api/rooms/${roomId}/status`);
                setDiscussionStatus(statusRes.data);

                // 초기 타이머 상태 설정
                if (statusRes.data.type === 'STARTED' && statusRes.data.startTime > 0) {
                    const elapsedSeconds = Math.floor((Date.now() - statusRes.data.startTime) / 1000);
                    setTimeRemaining(Math.max(0, statusRes.data.durationSeconds - elapsedSeconds));
                    setIsTimerRunning(true);
                } else {
                    setTimeRemaining(statusRes.data.durationSeconds); // 대기 중, 종료, 일시정지, 투표 상태일 때
                    setIsTimerRunning(false);
                }

                const participantsRes = await axios.get<ParticipantDto[]>(`/api/rooms/${roomId}/participants`);
                setParticipants(participantsRes.data);
                
                const votesRes = await axios.get<{ results: VoteResultsDto }>(`/api/rooms/${roomId}/vote-results`);
                setVoteResults(votesRes.data.results);
                
                // TODO: 주장(Argument) 목록을 가져오는 REST API 엔드포인트가 필요할 수 있습니다.
                //       현재는 WebSocket으로만 받을 수 있도록 되어있으므로, 새로고침 시 이전에 제출된 주장을 볼 수 없습니다.
                //       백엔드에 `/api/rooms/{roomId}/arguments` 같은 엔드포인트가 있다면 여기서 호출합니다.
            } catch (error) {
                console.error("Failed to fetch initial room data:", error);
                alert("방 정보를 가져오는 데 실패했거나, 존재하지 않는 방입니다.");
                navigate('/');
            }
        };
        fetchInitialData();

        // WebSocket 연결 설정
        const socket = new SockJS('/ws'); // 프록시 설정 덕분에 상대 경로 사용
        const client = Stomp.over(socket);
        client.debug = () => {}; // STOMP 디버그 로그 비활성화
        stompClientRef.current = client; // Ref에 클라이언트 인스턴스 저장

        const onConnected = () => {
            setStompClient(client); // 상태에 클라이언트 인스턴스 저장

            // --- 각 토픽 구독 ---
            client.subscribe(`/topic/room/${roomId}/participants`, (message) => setParticipants(JSON.parse(message.body)));
            client.subscribe(`/topic/room/${roomId}/chat`, (message) => setChatMessages((prev) => [...prev, JSON.parse(message.body)]));
            client.subscribe(`/topic/room/${roomId}/status`, (message) => {
                const newStatus: DiscussionStatusDto = JSON.parse(message.body);
                setDiscussionStatus(newStatus);
                // 상태 변경에 따라 타이머 로직 업데이트
                setIsTimerRunning(newStatus.type === 'STARTED');
                if (newStatus.type === 'STARTED' && newStatus.startTime > 0) {
                    const elapsedSeconds = Math.floor((Date.now() - newStatus.startTime) / 1000);
                    setTimeRemaining(Math.max(0, newStatus.durationSeconds - elapsedSeconds));
                } else if (['WAITING', 'ENDED', 'PAUSED', 'VOTING'].includes(newStatus.type)) {
                    // 대기, 종료, 일시정지, 투표 상태일 때
                    // 만약 특정 상태에서 durationSeconds가 의미 없다면 0으로 설정 가능
                    setTimeRemaining(newStatus.durationSeconds);
                }
            });
            client.subscribe(`/topic/room/${roomId}/vote-results`, (message) => setVoteResults(JSON.parse(message.body)));
            client.subscribe(`/topic/room/${roomId}/argument.new`, (message) => setArgumentsList((prev) => [...prev, JSON.parse(message.body)]));

            // --- 방에 참여 (JOIN) 메시지 전송 ---
            // 내 정보 (myParticipant)를 생성하고 백엔드로 전송하여 참가자로 등록
            const myParticipantInfo: ParticipantDto = {
                id: currentUser.id, // currentUser의 ID 사용
                name: currentUser.name, // currentUser의 이름 사용
                side: Math.random() > 0.5 ? 'for' : 'against', // 초기 진영은 랜덤으로 부여
                color: `bg-${['red','blue','green','purple'][Math.floor(Math.random()*4)]}-500` // 랜덤 UI 색상
            };
            setMyParticipant(myParticipantInfo);
            client.send(`/app/${roomId}/join`, {}, JSON.stringify(myParticipantInfo));
        };

        // WebSocket 연결 시도 및 에러 처리
        client.connect({}, onConnected, (error) => {
            console.error("WebSocket connection error:", error);
            alert("WebSocket 연결에 실패했습니다. 서버 상태를 확인해주세요.");
            navigate('/'); // 연결 실패 시 홈으로 리다이렉트
        });

        // 컴포넌트 언마운트 시 WebSocket 연결 해제
        return () => {
            if (stompClientRef.current?.connected) {
                stompClientRef.current.disconnect(() => {
                    console.log('WebSocket Disconnected successfully on unmount.');
                });
            }
        };
    }, [roomId, currentUser.id, currentUser.name, navigate]); // 의존성 배열

    // 2. 타이머 로직 관리 (useEffect)
    useEffect(() => {
        let interval: NodeJS.Timeout | undefined;
        if (isTimerRunning && timeRemaining > 0) {
            interval = setInterval(() => {
                setTimeRemaining((prev) => {
                    if (prev <= 1) { // 1초 남았을 때 0으로 만들고 타이머 종료 처리
                        setIsTimerRunning(false);
                        sendStatusUpdate('ENDED', '시간이 종료되었습니다!');
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } else if (timeRemaining <= 0 && isTimerRunning) { // 시간이 0이 되고 타이머가 아직 running일 경우 강제로 종료 처리
            setIsTimerRunning(false);
            sendStatusUpdate('ENDED', '시간이 종료되었습니다!');
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isTimerRunning, timeRemaining, sendStatusUpdate]);


    // DebateRoom 컴포넌트에 전달할 Debate 객체 구성 (useMemo로 최적화)
    const debateForRoom: Debate | null = useMemo(() => {
        if (!discussionStatus) return null; // discussionStatus가 없으면 Debate 객체 구성 불가

        // DiscussionStatusDto의 타입을 Debate의 currentPhase 타입에 맞게 소문자로 변환
        // 예: 'WAITING' -> 'waiting'
        const currentPhaseTyped: Debate['currentPhase'] = discussionStatus.type.toLowerCase() as Debate['currentPhase'];

        return {
            id: roomId!, // useParams에서 가져온 roomId
            topic: discussionStatus.currentTopic, // 상태에서 가져온 주제
            currentPhase: currentPhaseTyped, // 변환된 상태
            timeLimit: Math.floor(discussionStatus.durationSeconds / 60), // 초를 분으로 변환
            createdAt: discussionStatus.startTime, // 시작 시간
            participants: participants, // 현재 참가자 목록
            arguments: argumentsList, // 현재 주장 목록
        };
    }, [roomId, discussionStatus, participants, argumentsList]); // 의존성 배열

    // 로딩 중이거나 필요한 데이터가 아직 없는 경우 (최소한의 UI 표시)
    if (!debateForRoom || !myParticipant) {
        return <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">토론방 로딩 중...</div>;
    }

    // 모든 데이터가 준비되면 DebateRoom 컴포넌트를 렌더링
    return (
        <DebateRoom
            debate={debateForRoom} // 구성된 Debate 객체 전달
            onLeaveDebate={handleLeaveDebate}
            onStartDebate={handleStartDebate}
            onPauseDebate={handlePauseDebate}
            onEndDebate={handleEndDebate}
            onStartVoting={handleStartVoting}
            onAddArgument={handleAddArgument} // 주장 추가 콜백 전달
            user={currentUser} // User 타입의 현재 사용자 정보 전달
            myParticipant={myParticipant} // ParticipantDto 타입의 현재 참가자 정보 전달
            timeRemaining={timeRemaining} // 타이머 남은 시간 전달
            isTimerRunning={isTimerRunning} // 타이머 실행 상태 전달
            onSendChatMessage={sendChatMessage} // 채팅 메시지 전송 콜백 전달
            onSendVote={sendVote} // 투표 전송 콜백 전달
            chatMessages={chatMessages} // 채팅 메시지 목록 전달
            voteResults={voteResults} // 투표 결과 전달
        />
    );
};

export default DiscussionRoomPage;