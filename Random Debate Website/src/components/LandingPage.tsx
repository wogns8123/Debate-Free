import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Shuffle, Users, Clock, Zap, List } from 'lucide-react';
import { TopicGenerator } from './TopicGenerator';
import { DebateRoomsList } from './DebateRoomsList';
import { Debate, Participant } from '../App';
import { User } from './AuthModal';

const DEBATE_TOPICS = [
  "Social media does more harm than good to society",
  "Artificial intelligence will replace human creativity",
  "Remote work is better than office work",
  "Video games are a legitimate form of art",
  "Space exploration is a waste of resources",
  "Cryptocurrency will replace traditional currency",
  "Schools should ban smartphones completely",
  "Universal basic income should be implemented globally",
  "Climate change is humanity's greatest threat",
  "Private companies should fund space exploration",
  "Online education is superior to traditional classroom learning",
  "Genetic engineering in humans should be allowed",
  "Social media influencers have too much power",
  "Self-driving cars will make roads safer",
  "Standardized testing should be abolished",
  "Nuclear energy is essential for fighting climate change",
  "Professional sports salaries are too high",
  "Mandatory military service builds character",
  "Fast fashion should be banned",
  "Homework is counterproductive to learning"
];

const PARTICIPANT_COLORS = [
  'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 
  'bg-pink-500', 'bg-indigo-500', 'bg-teal-500', 'bg-red-500'
];

type LandingPageProps = {
  onJoinDebate: (debate: Debate) => void;
  onCreateDebate: (debate: Debate) => void;
  allDebates: Debate[];
  user: User | null;
};

export function LandingPage({ onJoinDebate, onCreateDebate, allDebates, user }: LandingPageProps) {
  const [currentTopic, setCurrentTopic] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [selectedSide, setSelectedSide] = useState<'for' | 'against' | null>(null);
  const [timeLimit, setTimeLimit] = useState(10);

  const generateRandomTopic = () => {
    const randomTopic = DEBATE_TOPICS[Math.floor(Math.random() * DEBATE_TOPICS.length)];
    setCurrentTopic(randomTopic);
  };

  const createDebate = () => {
    if (!currentTopic || !selectedSide) return;
    
    // 로그인한 사용자인 경우 user 정보 사용, 게스트인 경우 입력한 이름 사용
    if (!user && !playerName.trim()) return;

    const participant: Participant = {
      id: user ? user.id : `guest-${Date.now()}`,
      name: user ? user.name : playerName,
      side: selectedSide,
      color: PARTICIPANT_COLORS[0]
    };

    const debate: Debate = {
      id: Date.now().toString(),
      topic: currentTopic,
      participants: [participant],
      arguments: [],
      timeLimit: timeLimit,
      currentPhase: 'waiting',
      createdAt: Date.now()
    };

    onCreateDebate(debate);
  };

  const quickJoinDemo = () => {
    const demoTopic = DEBATE_TOPICS[Math.floor(Math.random() * DEBATE_TOPICS.length)];
    const demoParticipants: Participant[] = [
      {
        id: user ? user.id : 'demo-user',
        name: user ? user.name : '게스트',
        side: 'for',
        color: PARTICIPANT_COLORS[0]
      },
      {
        id: '2',
        name: 'Alex (AI)',
        side: 'against',
        color: PARTICIPANT_COLORS[1]
      }
    ];

    const demoDebate: Debate = {
      id: 'demo',
      topic: demoTopic,
      participants: demoParticipants,
      arguments: [],
      timeLimit: 5,
      currentPhase: 'debating',
      createdAt: Date.now()
    };

    onJoinDebate(demoDebate);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* 게스트 사용자 안내 */}
      {!user && (
        <div className="mb-8">
          <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
            <CardContent className="pt-6">
              <div className="text-center">
                <h3 className="mb-2 text-blue-900 dark:text-blue-100">환영합니다! 🎯</h3>
                <p className="text-blue-700 dark:text-blue-200 mb-4">
                  게스트로 토론에 참여하거나 회원가입하여 더 많은 기능을 이용하세요
                </p>
                <div className="flex flex-col sm:flex-row gap-2 justify-center">
                  <Badge variant="outline" className="border-blue-300 text-blue-700 bg-blue-100 dark:border-blue-700 dark:text-blue-200 dark:bg-blue-900">
                    👤 게스트: 이름만 입력하면 바로 토론 참여 가능
                  </Badge>
                  <Badge variant="outline" className="border-green-300 text-green-700 bg-green-100 dark:border-green-700 dark:text-green-200 dark:bg-green-900">
                    ✨ 회원: 토론 히스토리, 프로필 관리 등 추가 기능
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="mb-4">🎯 랜덤 토론장</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          랜덤 토픽이나 원하는 주제로 즉석 토론에 참여하세요. 논증 실력을 기르고, 
          다양한 관점을 탐구하며, 의미 있는 토론을 경험해보세요.
        </p>
      </div>

      {/* Quick Demo */}
      <div className="mb-8">
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="mb-2">빠른 데모 체험</h3>
                <p className="text-muted-foreground">
                  샘플 토론에 참여하여 기능을 체험해보세요
                </p>
              </div>
              <Button 
                onClick={quickJoinDemo} 
                size="lg" 
                className="ml-4"
              >
                <Zap className="w-4 h-4 mr-2" />
                빠른 데모
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 기존 토론방 리스트 */}
      {allDebates.length > 0 && (
        <div className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <List className="w-5 h-5" />
                진행중인 토론방 ({allDebates.length})
              </CardTitle>
              <CardDescription>
                기존 토론방에 참여하거나 관람해보세요
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DebateRoomsList 
                debates={allDebates}
                onJoinDebate={onJoinDebate}
              />
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-8">
        {/* Topic Generator */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shuffle className="w-5 h-5" />
              토픽 생성
            </CardTitle>
            <CardDescription>
              무작위 주제를 생성하거나 원하는 주제를 직접 입력하세요
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <TopicGenerator 
              currentTopic={currentTopic}
              onTopicGenerated={setCurrentTopic}
              onGenerateTopic={generateRandomTopic}
            />
          </CardContent>
        </Card>

        {/* Create Debate */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              토론방 생성
            </CardTitle>
            <CardDescription>
              정보를 입력하고 새로운 토론방을 만드세요
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!user && (
              <div>
                <Label htmlFor="playerName">게스트 이름</Label>
                <Input
                  id="playerName"
                  placeholder="토론에 사용할 이름을 입력하세요"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                />
              </div>
            )}
            
            {user && (
              <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">회원</Badge>
                  <span><strong>{user.name}</strong>님으로 토론방에 참여합니다</span>
                </div>
              </div>
            )}

            {!user && (
              <div className="text-sm text-muted-foreground bg-blue-50 dark:bg-blue-950 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-2 text-blue-700 dark:text-blue-200">
                  <Badge variant="outline" className="border-blue-300 text-blue-700 bg-blue-100 dark:border-blue-700 dark:text-blue-200 dark:bg-blue-900">게스트</Badge>
                  <span>입력한 이름으로 토론에 참여합니다</span>
                </div>
              </div>
            )}

            <div>
              <Label>입장 선택</Label>
              <div className="flex gap-2 mt-2">
                <Button
                  variant={selectedSide === 'for' ? 'default' : 'outline'}
                  onClick={() => setSelectedSide('for')}
                  className="flex-1"
                >
                  👍 찬성
                </Button>
                <Button
                  variant={selectedSide === 'against' ? 'default' : 'outline'}
                  onClick={() => setSelectedSide('against')}
                  className="flex-1"
                >
                  👎 반대
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="timeLimit" className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                시간 제한 (분)
              </Label>
              <Input
                id="timeLimit"
                type="number"
                min="1"
                max="30"
                value={timeLimit}
                onChange={(e) => setTimeLimit(Number(e.target.value))}
              />
            </div>

            <Button 
              onClick={createDebate}
              disabled={!currentTopic || (!user && !playerName.trim()) || !selectedSide}
              className="w-full"
              size="lg"
            >
              새 토론방 생성
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Features */}
      <div className="mt-12 grid sm:grid-cols-3 gap-6">
        <div className="text-center">
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
            <Shuffle className="w-6 h-6 text-primary" />
          </div>
          <h3 className="mb-2">토픽 선택</h3>
          <p className="text-muted-foreground">
            랜덤 토픽이나 커스텀 주제로 토론하세요
          </p>
        </div>
        <div className="text-center">
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
            <Users className="w-6 h-6 text-primary" />
          </div>
          <h3 className="mb-2">멀티플레이어</h3>
          <p className="text-muted-foreground">
            여러 참여자와 실시간으로 토론하세요
          </p>
        </div>
        <div className="text-center">
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
            <Clock className="w-6 h-6 text-primary" />
          </div>
          <h3 className="mb-2">시간 제한</h3>
          <p className="text-muted-foreground">
            시간 제한이 있는 구조화된 토론
          </p>
        </div>
      </div>
    </div>
  );
}