import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { DiscussionStatusDto } from '../types'; // Gist의 types.ts를 백엔드 DTO에 맞게 수정해야 함
import { Button } from '../components/ui/button'; 

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
            // 에러 객체에서 더 자세한 정보를 얻어올 수 있다면 좋습니다.
            if (axios.isAxiosError(error)) {
                if (error.response) {
                    // 서버에서 응답을 보냈지만 status code가 2xx가 아닌 경우
                    alert(`방 생성에 실패했습니다. 상태 코드: ${error.response.status}`);
                } else if (error.request) {
                    // 요청은 보냈으나 응답을 받지 못한 경우 (네트워크 문제 등)
                    alert("방 생성 요청을 보냈으나 응답이 없습니다. 서버 연결을 확인해주세요.");
                } else {
                    // 기타 에러
                    alert("방 생성 중 알 수 없는 에러가 발생했습니다.");
                }
            } else {
                alert("방 생성 중 알 수 없는 에러가 발생했습니다.");
            }
            setIsLoading(false);
        }  finally { // finally 블록에서 isLoading을 false로 설정하여, 에러 발생 시에도 버튼 활성화
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
            <h1 className="text-5xl font-bold mb-4">랜덤 토론 사이트</h1>
            <p className="text-xl text-gray-400 mb-8">버튼을 눌러 새로운 토론을 시작하세요.</p>
            <Button onClick={handleCreateRoom} disabled={isLoading} size="lg" className="bg-blue-600 hover:bg-blue-700 text-white">
                {isLoading ? '방 생성 중...' : '새 토론방 만들기'}
            </Button>
        </div>
    );
};

export default HomePage;