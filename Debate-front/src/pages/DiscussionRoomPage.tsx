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

    const [stompClient, setStompClient] = useState<Stomp.Client | null>(null);
    const stompClientRef = useRef<Stomp.Client | null>(null);

    const [participants, setParticipants] = useState<ParticipantDto[]>([]);
    const [chatMessages, setChatMessages] = useState<ChatMessageDto[]>([]);
    const [discussionStatus, setDiscussionStatus] = useState<DiscussionStatusDto | null>(null);
    const [voteResults, setVoteResults] = useState<VoteResultsDto>({ for: 0, against: 0 });
    const [argumentsList, setArgumentsList] = useState<Argument[]>([]);
    const [myParticipant, setMyParticipant] = useState<ParticipantDto | null>(null);
    
    const currentUser: User = useMemo(() => ({ id: uuidv4(), name: `Guest-${Math.floor(Math.random() * 1000)}` }), []);

    const [timeRemaining, setTimeRemaining] = useState(0);
    const [isTimerRunning, setIsTimerRunning] = useState(false);

    // --- 콜백 함수 정의 ---
    const handleLeaveDebate = useCallback(() => {
        console.log("Leaving debate room");
        navigate('/');
    }, [navigate]);

    const sendStatusUpdate = useCallback((type: DiscussionStatusDto['type'], message: string) => {
        if (!stompClient || !roomId) return;
        const statusUpdate: Partial<DiscussionStatusDto> = { type, message };
        stompClient.send(`/app/${roomId}/status.update`, {}, JSON.stringify(statusUpdate));
    }, [stompClient, roomId]);

    const handleStartDebate = useCallback(() => {
        setIsTimerRunning(true);
        sendStatusUpdate('STARTED', '토론이 시작되었습니다!');
    }, [sendStatusUpdate]);

    const handlePauseDebate = useCallback(() => {
        setIsTimerRunning(false);
        sendStatusUpdate('PAUSED', '토론이 일시 중지되었습니다.');
    }, [sendStatusUpdate]);

    const handleEndDebate = useCallback(() => {
        setIsTimerRunning(false);
        sendStatusUpdate('ENDED', '토론이 종료되었습니다.');
    }, [sendStatusUpdate]);

    const handleStartVoting = useCallback(() => {
        setIsTimerRunning(false);
        sendStatusUpdate('VOTING', '투표가 시작되었습니다!');
    }, [sendStatusUpdate]);

    const handleAddArgument = useCallback((text: string, participantId: string) => {
        if (!stompClient || !myParticipant || !roomId || !text.trim() || myParticipant.side === 'none') return;
        const newArgument: Omit<Argument, 'id' | 'timestamp' | 'participantName'> = {
            participantId: participantId,
            side: myParticipant.side,
            text: text
        };
        stompClient.send(`/app/${roomId}/argument.submit`, {}, JSON.stringify(newArgument));
    }, [stompClient, myParticipant, roomId]);

    const sendChatMessage = useCallback((content: string) => {
        if (!stompClient || !myParticipant || !roomId || !content.trim()) return;
        const chatMsg: Omit<ChatMessageDto, 'timestamp' | 'roomId'> = {
            type: 'CHAT', content, sender: myParticipant.name,
        };
        stompClient.send(`/app/${roomId}/chat.sendMessage`, {}, JSON.stringify(chatMsg));
    }, [stompClient, myParticipant, roomId]);

    const sendVote = useCallback((side: 'for' | 'against') => {
        if (!stompClient || !myParticipant || !roomId) return;
        const voteMsg = { voterId: myParticipant.id, side };
        stompClient.send(`/app/${roomId}/vote`, {}, JSON.stringify(voteMsg));
    }, [stompClient, myParticipant, roomId]);


    // --- WebSocket 연결 및 데이터 로딩 ---
    useEffect(() => {
        if (!roomId) {
            navigate('/');
            return;
        }

        const fetchInitialData = async () => {
            try {
                const statusRes = await axios.get<DiscussionStatusDto>(`/api/rooms/${roomId}/status`);
                setDiscussionStatus(statusRes.data);
                if (statusRes.data.type === 'STARTED' && statusRes.data.startTime > 0) {
                    const elapsedSeconds = Math.floor((Date.now() - statusRes.data.startTime) / 1000);
                    setTimeRemaining(Math.max(0, statusRes.data.durationSeconds - elapsedSeconds));
                    setIsTimerRunning(true);
                } else {
                    setTimeRemaining(statusRes.data.durationSeconds);
                    setIsTimerRunning(false);
                }

                const participantsRes = await axios.get<ParticipantDto[]>(`/api/rooms/${roomId}/participants`);
                setParticipants(participantsRes.data);
                
                const votesRes = await axios.get<{ results: VoteResultsDto }>(`/api/rooms/${roomId}/vote-results`);
                setVoteResults(votesRes.data.results);
            } catch (error) {
                console.error("Failed to fetch initial room data:", error);
                alert("방 정보를 가져오는 데 실패했거나, 존재하지 않는 방입니다.");
                navigate('/');
            }
        };
        fetchInitialData();

        const socket = new SockJS('/ws');
        const client = Stomp.over(socket);
        client.debug = () => {};
        stompClientRef.current = client;

        // 🟢 구독 객체들을 저장할 배열을 생성합니다.
        const subscriptions: Stomp.Subscription[] = [];

        const onConnected = () => {
            setStompClient(client);

            // --- 각 토픽 구독 및 구독 객체 저장 ---
            subscriptions.push(
                client.subscribe(`/topic/room/${roomId}/participants`, (message) => setParticipants(JSON.parse(message.body)))
            );
            subscriptions.push(
                client.subscribe(`/topic/room/${roomId}/chat`, (message) => setChatMessages((prev) => [...prev, JSON.parse(message.body)]))
            );
            subscriptions.push(
                client.subscribe(`/topic/room/${roomId}/status`, (message) => {
                    const newStatus: DiscussionStatusDto = JSON.parse(message.body);
                    setDiscussionStatus(newStatus);
                    setIsTimerRunning(newStatus.type === 'STARTED');
                    if (newStatus.type === 'STARTED' && newStatus.startTime > 0) {
                        const elapsedSeconds = Math.floor((Date.now() - newStatus.startTime) / 1000);
                        setTimeRemaining(Math.max(0, newStatus.durationSeconds - elapsedSeconds));
                    } else if (['WAITING', 'ENDED', 'PAUSED', 'VOTING'].includes(newStatus.type)) {
                        setTimeRemaining(newStatus.durationSeconds);
                    }
                })
            );
            subscriptions.push(
                client.subscribe(`/topic/room/${roomId}/vote-results`, (message) => setVoteResults(JSON.parse(message.body)))
            );
            subscriptions.push(
                client.subscribe(`/topic/room/${roomId}/argument.new`, (message) => setArgumentsList((prev) => [...prev, JSON.parse(message.body)]))
            );

            // --- 방에 참여 (JOIN) 메시지 전송 ---
            const myParticipantInfo: ParticipantDto = {
                id: currentUser.id,
                name: currentUser.name,
                side: Math.random() > 0.5 ? 'for' : 'against',
                color: `bg-${['red','blue','green','purple'][Math.floor(Math.random()*4)]}-500`
            };
            setMyParticipant(myParticipantInfo);
            client.send(`/app/${roomId}/join`, {}, JSON.stringify(myParticipantInfo));
        };

        client.connect({}, onConnected, (error) => {
            console.error("WebSocket connection error:", error);
            alert("WebSocket 연결에 실패했습니다. 서버 상태를 확인해주세요.");
            navigate('/');
        });

        // 🟢 컴포넌트 언마운트 시 WebSocket 연결 및 모든 구독 해제
        return () => {
            if (stompClientRef.current?.connected) {
                // 모든 구독을 해제하여 중복 수신을 방지합니다.
                subscriptions.forEach(sub => sub.unsubscribe());

                stompClientRef.current.disconnect(() => {
                    console.log('WebSocket Disconnected and subscriptions cleaned up.');
                });
            }
        };
    }, [roomId, currentUser.id, currentUser.name, navigate]); // 의존성 배열

    // --- 타이머 로직 관리 ---
    useEffect(() => {
        let interval: NodeJS.Timeout | undefined;
        if (isTimerRunning && timeRemaining > 0) {
            interval = setInterval(() => {
                setTimeRemaining((prev) => {
                    if (prev <= 1) {
                        setIsTimerRunning(false);
                        sendStatusUpdate('ENDED', '시간이 종료되었습니다!');
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } else if (timeRemaining <= 0 && isTimerRunning) {
            setIsTimerRunning(false);
            sendStatusUpdate('ENDED', '시간이 종료되었습니다!');
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isTimerRunning, timeRemaining, sendStatusUpdate]);


    // --- DebateRoom 컴포넌트에 전달할 Debate 객체 구성 ---
    const debateForRoom: Debate | null = useMemo(() => {
        if (!discussionStatus) return null;

        const currentPhaseTyped: Debate['currentPhase'] = discussionStatus.type.toLowerCase() as Debate['currentPhase'];

        return {
            id: roomId!,
            topic: discussionStatus.currentTopic,
            currentPhase: currentPhaseTyped,
            timeLimit: Math.floor(discussionStatus.durationSeconds / 60),
            createdAt: discussionStatus.startTime,
            participants: participants,
            arguments: argumentsList,
        };
    }, [roomId, discussionStatus, participants, argumentsList]);

    // --- 렌더링 ---
    if (!debateForRoom || !myParticipant) {
        return <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">토론방 로딩 중...</div>;
    }

    return (
        <DebateRoom
            debate={debateForRoom}
            onLeaveDebate={handleLeaveDebate}
            onStartDebate={handleStartDebate}
            onPauseDebate={handlePauseDebate}
            onEndDebate={handleEndDebate}
            onStartVoting={handleStartVoting}
            onAddArgument={handleAddArgument}
            user={currentUser}
            myParticipant={myParticipant}
            timeRemaining={timeRemaining}
            isTimerRunning={isTimerRunning}
            onSendChatMessage={sendChatMessage}
            onSendVote={sendVote}
            chatMessages={chatMessages}
            voteResults={voteResults}
        />
    );
};

export default DiscussionRoomPage;