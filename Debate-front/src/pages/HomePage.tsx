import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { DiscussionStatusDto } from '../types';

// UI 컴포넌트들을 임포트합니다. (Gist에 있던 파일들)
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { ToggleGroup, ToggleGroupItem } from '../components/ui/toggle-group'; // 진영 선택용
import { Loader2 } from 'lucide-react'; // 로딩 아이콘

const HomePage: React.FC = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    // --- 피그마 디자인에 필요한 상태들 ---
    const [userName, setUserName] = useState(''); // 게스트 이름
    const [selectedSide, setSelectedSide] = useState<'for' | 'against'>('for'); // 선택한 진영 (기본값: 찬성)
    const [timeLimit, setTimeLimit] = useState(10); // 시간 제한 (기본값: 10분)
    const [topic, setTopic] = useState(''); // 직접 입력한 토픽
    const [isGeneratingTopic, setIsGeneratingTopic] = useState(false); // AI 토픽 생성 로딩

    // "새 토론방 생성" 버튼 클릭 시 실행될 함수
    const handleCreateRoom = async () => {
        if (!userName.trim()) {
            alert('게스트 이름을 입력해주세요.');
            return;
        }
        setIsLoading(true);

        try {
            // 1. 기존처럼 백엔드에 방 생성을 요청합니다.
            const response = await axios.post<DiscussionStatusDto>('/api/rooms/create');
            const roomStatus = response.data;
            
            // 2. 생성된 방으로 이동하면서, 사용자가 입력한 정보를 함께 전달합니다.
            navigate(`/room/${roomStatus.roomId}`, {
                state: {
                    initialUserName: userName,
                    initialSide: selectedSide,
                }
            });

        } catch (error) {
            console.error("Failed to create room:", error);
            alert("방 생성에 실패했습니다. 서버 상태를 확인해주세요.");
            setIsLoading(false);
        }
    };
    
    // AI 토픽 생성 핸들러 (현재는 임시 기능)
    const handleGenerateTopic = async () => {
        setIsGeneratingTopic(true);
        // TODO: 백엔드에 AI 토픽 생성 API를 호출하는 로직 추가
        // 지금은 2초 후에 임시 토픽을 설정합니다.
        setTimeout(() => {
            setTopic("AI는 인류의 미래에 긍정적인 영향을 미칠 것인가?");
            setIsGeneratingTopic(false);
        }, 2000);
    };


    // --- 피그마 디자인 기반의 JSX 렌더링 ---
    return (
        <div className="container mx-auto max-w-4xl py-12 px-4">
            <header className="text-center mb-12">
                <h1 className="text-4xl font-bold mb-2">🎲 랜덤 토론장</h1>
                <p className="text-lg text-gray-400">
                    랜덤 토픽이나 원하는 주제로 즉석 토론에 참여하세요. 논증 실력을 기르고, 다양한 관점을 구하며, 의미 있는 토론을 경험해보세요.
                </p>
            </header>

            <main className="grid md:grid-cols-2 gap-8">
                {/* 왼쪽: 토픽 생성 */}
                <Card className="bg-gray-800 border-gray-700">
                    <CardContent className="p-6">
                        <h2 className="text-2xl font-semibold mb-4">✍️ 토픽 생성</h2>
                        <p className="text-gray-400 mb-6">무작위 주제를 생성하거나 원하는 주제를 직접 입력하세요.</p>
                        
                        <div className="bg-gray-900 p-4 rounded-lg text-center mb-4 min-h-[100px] flex items-center justify-center">
                            {isGeneratingTopic ? (
                                <Loader2 className="animate-spin" />
                            ) : (
                                <p className={topic ? 'text-white' : 'text-gray-500'}>
                                    {topic || '토픽 생성 버튼을 누르거나 직접 입력하세요.'}
                                </p>
                            )}
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <Button onClick={handleGenerateTopic} disabled={isGeneratingTopic}>
                                {isGeneratingTopic ? <Loader2 className="animate-spin mr-2" /> : null}
                                랜덤 생성
                            </Button>
                            <Button variant="outline" className="border-gray-500 hover:bg-gray-700">직접 입력</Button>
                        </div>
                        <Input 
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            placeholder="또는, 토론할 주제를 직접 입력하세요..."
                            className="bg-gray-700 border-gray-600"
                        />
                    </CardContent>
                </Card>

                {/* 오른쪽: 토론방 생성 */}
                <Card className="bg-gray-800 border-gray-700">
                    <CardContent className="p-6">
                        <h2 className="text-2xl font-semibold mb-4">🚀 토론방 생성</h2>
                        <p className="text-gray-400 mb-6">정보를 입력하고 새로운 토론방을 만드세요.</p>
                        
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="guest-name">게스트 이름</Label>
                                <Input 
                                    id="guest-name"
                                    value={userName}
                                    onChange={(e) => setUserName(e.target.value)}
                                    placeholder="사용할 이름을 입력하세요"
                                    className="bg-gray-700 border-gray-600 mt-2"
                                />
                            </div>
                            <div>
                                <Label>진영 선택</Label>
                                <ToggleGroup 
                                    type="single" 
                                    value={selectedSide} 
                                    onValueChange={(value: 'for' | 'against') => {
                                        if (value) setSelectedSide(value);
                                    }}
                                    className="grid grid-cols-2 gap-2 mt-2"
                                >
                                    <ToggleGroupItem value="for" className="data-[state=on]:bg-green-600 data-[state=on]:text-white">👍 찬성</ToggleGroupItem>
                                    <ToggleGroupItem value="against" className="data-[state=on]:bg-red-600 data-[state=on]:text-white">👎 반대</ToggleGroupItem>
                                </ToggleGroup>
                            </div>
                            <div>
                                <Label>시간 제한 (분)</Label>
                                <Input 
                                    type="number"
                                    value={timeLimit}
                                    onChange={(e) => setTimeLimit(parseInt(e.target.value, 10))}
                                    className="bg-gray-700 border-gray-600 mt-2"
                                />
                            </div>
                        </div>

                        <Button onClick={handleCreateRoom} disabled={isLoading} className="w-full mt-6 bg-blue-600 hover:bg-blue-700" size="lg">
                            {isLoading ? <Loader2 className="animate-spin mr-2" /> : null}
                            새 토론방 생성
                        </Button>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
};

export default HomePage;