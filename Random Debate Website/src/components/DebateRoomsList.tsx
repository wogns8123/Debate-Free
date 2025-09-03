import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Users, Clock, MessageSquare, Play, Pause, Square } from 'lucide-react';
import { Debate } from '../App';

type DebateRoomsListProps = {
  debates: Debate[];
  onJoinDebate: (debate: Debate) => void;
};

export function DebateRoomsList({ debates, onJoinDebate }: DebateRoomsListProps) {
  const getPhaseDisplay = (phase: Debate['currentPhase']) => {
    switch (phase) {
      case 'waiting':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200">대기 중</Badge>;
      case 'debating':
        return <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">진행 중</Badge>;
      case 'finished':
        return <Badge variant="destructive" className="bg-gray-100 text-gray-800 border-gray-200">종료</Badge>;
    }
  };

  const getPhaseIcon = (phase: Debate['currentPhase']) => {
    switch (phase) {
      case 'waiting':
        return <Clock className="w-4 h-4" />;
      case 'debating':
        return <Play className="w-4 h-4" />;
      case 'finished':
        return <Square className="w-4 h-4" />;
    }
  };

  const formatTimeLimit = (minutes: number) => {
    return `${minutes}분`;
  };

  const getTimeRemaining = (debate: Debate) => {
    if (debate.currentPhase === 'finished') return '종료됨';
    if (debate.currentPhase === 'waiting') return '시작 전';
    
    const elapsed = Math.floor((Date.now() - debate.createdAt) / 1000 / 60);
    const remaining = Math.max(0, debate.timeLimit - elapsed);
    return `${remaining}분 남음`;
  };

  if (debates.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8 text-muted-foreground">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>아직 생성된 토론방이 없습니다</p>
            <p className="text-sm">새로운 토론방을 만들어보세요!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {debates.map((debate) => {
        const forCount = debate.participants.filter(p => p.side === 'for').length;
        const againstCount = debate.participants.filter(p => p.side === 'against').length;
        
        return (
          <Card key={debate.id} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      {getPhaseIcon(debate.currentPhase)}
                      {getPhaseDisplay(debate.currentPhase)}
                      <span className="text-sm text-muted-foreground">
                        {formatTimeLimit(debate.timeLimit)}
                      </span>
                    </div>
                    
                    <h3 className="leading-tight pr-4">
                      {debate.topic}
                    </h3>
                  </div>
                  
                  <Button 
                    onClick={() => onJoinDebate(debate)}
                    disabled={debate.currentPhase === 'finished'}
                    size="sm"
                  >
                    {debate.currentPhase === 'waiting' ? '참여하기' : 
                     debate.currentPhase === 'debating' ? '관람하기' : '완료됨'}
                  </Button>
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    {/* 총 참여자 수 */}
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">
                        {debate.participants.length}명 참여
                      </span>
                    </div>

                    {/* 토론 횟수 */}
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">
                        {debate.arguments.length}개 의견
                      </span>
                    </div>
                  </div>

                  <div className="text-sm text-muted-foreground">
                    {getTimeRemaining(debate)}
                  </div>
                </div>

                {/* 참여자 미리보기 */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        👍 찬성 ({forCount})
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                        👎 반대 ({againstCount})
                      </Badge>
                    </div>
                  </div>

                  {/* 참여자 아바타 미리보기 */}
                  {debate.participants.length > 0 && (
                    <div className="flex items-center gap-1">
                      <div className="flex -space-x-2">
                        {debate.participants.slice(0, 6).map((participant) => (
                          <Avatar key={participant.id} className="w-8 h-8 border-2 border-background">
                            <AvatarFallback className={`${participant.color} text-white text-xs`}>
                              {participant.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        ))}
                        {debate.participants.length > 6 && (
                          <div className="w-8 h-8 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                            <span className="text-xs text-muted-foreground">
                              +{debate.participants.length - 6}
                            </span>
                          </div>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground ml-2">
                        {debate.participants.map(p => p.name).join(', ')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}