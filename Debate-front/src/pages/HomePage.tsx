import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { DiscussionStatusDto } from '../types'; // Gist의 types.ts를 백엔드 DTO에 맞게 수정해야 함

const HomePage: React.FC = () => {
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleCreateRoom = async () => {
        setIsLoading(true);
        try {
            // 백엔드 API 호출하여 방 생성
            const response = await axios.post<DiscussionStatusDto>('/api/rooms/create');
            const roomStatus = response.data;
            navigate(`/room/${roomStatus.roomId}`);
        } catch (error) {
            console.error("Failed to create room:", error);
            alert("방 생성에 실패했습니다.");
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <h1 className="text-5xl font-bold mb-4">랜덤 토론 사이트</h1>
            <p className="text-xl text-gray-400 mb-8">버튼을 눌러 새로운 토론을 시작하세요.</p>
            <button onClick={handleCreateRoom} disabled={isLoading} className="px-6 py-3 bg-blue-600 rounded-lg text-lg font-semibold hover:bg-blue-700 disabled:bg-gray-500">
                {isLoading ? '방 생성 중...' : '새 토론방 만들기'}
            </button>
        </div>
    );
};

export default HomePage;