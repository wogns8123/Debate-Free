import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { DiscussionStatusDto } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Loader2, Zap, BrainCircuit, Mic, Users, Clock } from 'lucide-react';

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
    <div className="flex flex-col items-center text-center">
        <div className="mb-4">{icon}</div>
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-sm text-gray-400">{description}</p>
    </div>
);

const HomePage: React.FC = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [userName, setUserName] = useState('');
    const [selectedSide, setSelectedSide] = useState<'for' | 'against'>();
    const [timeLimit, setTimeLimit] = useState(10);
    const [topic, setTopic] = useState('');
    const [isGeneratingTopic, setIsGeneratingTopic] = useState(false);

    const handleCreateRoom = async () => {
        if (!userName.trim()) {
            alert('게스트 이름을 입력해주세요.');
            return;
        }
        if (!selectedSide) {
            alert('입장할 진영 (찬성/반대)을 선택해주세요.');
            return;
        }
        setIsLoading(true);

        try {
            const response = await axios.post<DiscussionStatusDto>('/api/rooms/create');
            const newRoom = response.data;
            navigate(`/room/${newRoom.roomId}`, {
                state: {
                    initialUserName: userName.trim(),
                    initialSide: selectedSide,
                }
            });
        } catch (error) {
            console.error("Failed to create room:", error);
            alert("방 생성에 실패했습니다. 서버 상태를 확인해주세요.");
            setIsLoading(false);
        }
    };

    const handleGenerateTopic = async () => {
        setIsGeneratingTopic(true);
        setTimeout(() => {
            setTopic("AI는 인류의 미래에 긍정적인 영향을 미칠 것인가?");
            setIsGeneratingTopic(false);
        }, 1500);
    };

    const handleQuickDemo = () => {
        const demoUserName = `데모유저${Math.floor(Math.random() * 100)}`;
        const demoSide = Math.random() > 0.5 ? 'for' : 'against';

        setIsLoading(true);
        axios.post<DiscussionStatusDto>('/api/rooms/create').then(response => {
            navigate(`/room/${response.data.roomId}`, {
                state: {
                    initialUserName: demoUserName,
                    initialSide: demoSide,
                }
            });
        }).catch(error => {
            console.error("Failed to create demo room:", error);
            alert("데모 방 생성에 실패했습니다.");
            setIsLoading(false);
        });
    };

    return (
        <div className="min-h-screen bg-background text-foreground font-sans">
            <div className="container mx-auto max-w-5xl py-8 px-4">
                <header className="flex justify-between items-center mb-8">
                    <h1 className="text-xl font-bold">💬 랜덤 토론장</h1>
                    <div>
                        <Button variant="ghost">게스트 모드</Button>
                        <Button className="ml-2">로그인/가입</Button>
                    </div>
                </header>

                <div className="bg-primary/5 border rounded-lg p-6 mb-12 text-center">
                    <h2 className="text-2xl font-bold mb-2">환영합니다! 👋</h2>
                    <p className="text-muted-foreground mb-4">게스트로 토론에 참여하거나 회원가입하여 더 많은 기능을 이용하세요.</p>
                    <div className="flex justify-center gap-4">
                        <Button variant="outline">게스트: 이름만 입력하면 바로 토론 참여 가능</Button>
                        <Button>회원: 토론 히스토리, 프로필 관리 등 추가 기능</Button>
                    </div>
                </div>

                <main>
                    <Card className="mb-12">
                        <CardContent className="p-6 flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-semibold">빠른 데모 체험</h3>
                                <p className="text-muted-foreground">샘플 토론에 참여하여 기능을 체험해보세요.</p>
                            </div>
                            <Button onClick={handleQuickDemo}>
                                <Zap className="w-4 h-4 mr-2" />
                                빠른 데모
                            </Button>
                        </CardContent>
                    </Card>

                    <div className="grid md:grid-cols-2 gap-8 mb-24">
                        <Card>
                            <CardContent className="p-6">
                                <h2 className="text-2xl font-semibold mb-2">✍️ 토픽 생성</h2>
                                <p className="text-muted-foreground mb-6">무작위 주제를 생성하거나 원하는 주제를 직접 입력하세요.</p>
                                <div className="bg-muted p-4 rounded-lg text-center mb-4 min-h-[120px] flex items-center justify-center">
                                    {isGeneratingTopic ? (
                                        <Loader2 className="animate-spin text-primary" size={32} />
                                    ) : (
                                        <Input
                                            value={topic} // 🟢 value는 항상 `topic` 상태와 연결
                                            onChange={(e) => setTopic(e.target.value)} // 🟢 onChange로 `topic` 상태를 업데이트
                                            placeholder="또는, 토론할 주제를 직접 입력" // 🟢 비어있을 때의 안내 문구는 placeholder 사용
                                        />
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Button onClick={handleGenerateTopic} disabled={isGeneratingTopic} className="w-full">
                                        <BrainCircuit className="w-4 h-4 mr-2" />
                                        {isGeneratingTopic ? '생성 중...' : '랜덤 생성'}
                                    </Button>
                                    <Input
                                        value={topic}
                                        onChange={(e) => setTopic(e.target.value)}
                                        placeholder="또는, 토론할 주제를 직접 입력"
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <h2 className="text-2xl font-semibold mb-2">🚀 토론방 생성</h2>
                                <p className="text-muted-foreground mb-6">정보를 입력하고 새로운 토론방을 만드세요.</p>
                                <div className="space-y-4">
                                    <div>
                                        <Label htmlFor="guest-name">게스트 이름</Label>
                                        <Input
                                            id="guest-name"
                                            value={userName}
                                            onChange={(e) => setUserName(e.target.value)}
                                            placeholder="사용할 이름을 입력하세요"
                                            className="mt-2"
                                        />
                                    </div>
                                    <div>
                                        <Label>입장 선택</Label>
                                        <ToggleGroup
                                            type="single"
                                            value={selectedSide}
                                            onValueChange={(value: 'for' | 'against') => {
                                                if (value) setSelectedSide(value);
                                            }}
                                            className="grid grid-cols-2 gap-2 mt-2"
                                        >
                                            <ToggleGroupItem value="for" aria-label="찬성">👍 찬성</ToggleGroupItem>
                                            <ToggleGroupItem value="against" aria-label="반대">👎 반대</ToggleGroupItem>
                                        </ToggleGroup>
                                    </div>
                                    <div>
                                        <Label htmlFor="time-limit">시간 제한 (분)</Label>
                                        <Input
                                            id="time-limit"
                                            type="number"
                                            value={timeLimit}
                                            onChange={(e) => setTimeLimit(Math.max(1, parseInt(e.target.value, 10)))}
                                            className="mt-2"
                                        />
                                    </div>
                                </div>
                                <Button onClick={handleCreateRoom} disabled={isLoading} className="w-full mt-6" size="lg">
                                    {isLoading && <Loader2 className="animate-spin mr-2" />}
                                    새 토론방 생성
                                </Button>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <FeatureCard icon={<Mic size={32} />} title="토픽 선택" description="랜덤 토픽이나 커스텀 주제로 토론하세요" />
                        <FeatureCard icon={<Users size={32} />} title="멀티플레이어" description="여러 참여자와 실시간으로 토론하세요" />
                        <FeatureCard icon={<Clock size={32} />} title="시간 제한" description="시간 제한이 있는 구조화된 토론" />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default HomePage;