import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid'; // UUID 라이브러리 사용
import { ParticipantDto, ChatMessageDto, DiscussionStatusDto, VoteResultsDto } from '../types';

// Gist의 컴포넌트 및 새로 추가한 컴포넌트들을 임포트
import { DiscussionTopic } from '../components/DiscussionTopic';
import { DiscussionControls } from '../components/DiscussionControls';
import { ParticipantList } from '../components/ParticipantList';
import { ChatSection } from '../components/ChatSection';

const DiscussionRoomPage: React.FC = () => {
    const { roomId } = useParams<{ roomId: string }>();
    const [stompClient, setStompClient] = useState<Stomp.Client | null>(null);
    const stompClientRef = useRef<Stomp.Client | null>(null);

    // 상태 관리
    const [participants, setParticipants] = useState<ParticipantDto[]>([]);
    const [chatMessages, setChatMessages] = useState<ChatMessageDto[]>([]);
    const [discussionStatus, setDiscussionStatus] = useState<DiscussionStatusDto | null>(null);
    const [voteResults, setVoteResults] = useState<VoteResultsDto>({ for: 0, against: 0 });
    const [myParticipant, setMyParticipant] = useState<ParticipantDto | null>(null);

    // WebSocket 연결 및 데이터 로딩 로직
    useEffect(() => {
        if (!roomId) return;

        const fetchInitialData = async () => {
            try {
                const statusRes = await axios.get<DiscussionStatusDto>(`/api/rooms/${roomId}/status`);
                setDiscussionStatus(statusRes.data);
                const participantsRes = await axios.get<ParticipantDto[]>(`/api/rooms/${roomId}/participants`);
                setParticipants(participantsRes.data);
                const votesRes = await axios.get<{ results: VoteResultsDto }>(`/api/rooms/${roomId}/vote-results`);
                setVoteResults(votesRes.data.results);
            } catch (error) {
                console.error("Failed to fetch initial room data:", error);
                alert("방 정보를 가져오는 데 실패했습니다.");
            }
        };
        fetchInitialData();

        const socket = new SockJS('/ws');
        const client = Stomp.over(socket);
        client.debug = () => {};
        stompClientRef.current = client;

        const onConnected = () => {
            setStompClient(client);
            client.subscribe(`/topic/room/${roomId}/participants`, (message) => setParticipants(JSON.parse(message.body)));
            client.subscribe(`/topic/room/${roomId}/chat`, (message) => setChatMessages((prev) => [...prev, JSON.parse(message.body)]));
            client.subscribe(`/topic/room/${roomId}/status`, (message) => setDiscussionStatus(JSON.parse(message.body)));
            client.subscribe(`/topic/room/${roomId}/vote-results`, (message) => setVoteResults(JSON.parse(message.body)));

            const me: ParticipantDto = {
        id: uuidv4(), // 고유한 ID 생성
        name: `Guest-${Math.floor(Math.random() * 1000)}`,
        side: Math.random() > 0.5 ? 'for' : 'against',
        color: `bg-teal-500`
    };
    setMyParticipant(me);
    client.send(`/app/${roomId}/join`, {}, JSON.stringify(me));
        };

        client.connect({}, onConnected, (error) => console.error(error));

        return () => {
            if (stompClientRef.current?.connected) {
                stompClientRef.current.disconnect();
            }
        };
    }, [roomId]);

    // 이벤트 핸들러 함수들
    const sendChatMessage = (content: string) => {
        if (stompClient && myParticipant && roomId && content.trim()) {
            const chatMsg = { type: 'CHAT', content, sender: myParticipant.name };
            stompClient.send(`/app/${roomId}/chat.sendMessage`, {}, JSON.stringify(chatMsg));
        }
    };

    const sendVote = (side: 'for' | 'against') => {
        if (stompClient && myParticipant && roomId) {
            const voteMsg = { voterId: myParticipant.id, side };
            stompClient.send(`/app/${roomId}/vote`, {}, JSON.stringify(voteMsg));
        }
    };

    const updateStatus = (type: DiscussionStatusDto['type'], message: string) => {
        if (stompClient && roomId) {
            const statusUpdate = { type, message };
            stompClient.send(`/app/${roomId}/status.update`, {}, JSON.stringify(statusUpdate));
        }
    };

    if (!discussionStatus) {
        return <div className="flex items-center justify-center min-h-screen">로딩 중...</div>;
    }

    // JSX 렌더링 부분
    return (
        <div className="container mx-auto p-4 flex flex-col md:flex-row gap-4">
            <div className="flex-grow space-y-4">
                <DiscussionTopic status={discussionStatus} />
                <DiscussionControls
                    currentStatus={discussionStatus.type}
                    onStartDiscussion={() => updateStatus('STARTED', '토론 시작!')}
                    onEndDiscussion={() => updateStatus('ENDED', '토론 종료.')}
                    onStartVoting={() => updateStatus('VOTING', '투표 시작!')}
                    onVote={sendVote}
                    voteResults={voteResults}
                />
                <ChatSection messages={chatMessages} onSendMessage={sendChatMessage} />
            </div>
            <div className="w-full md:w-80 flex-shrink-0">
                <ParticipantList participants={participants} />
            </div>
        </div>
    );
};

export default DiscussionRoomPage;