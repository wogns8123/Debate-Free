import React from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { ArrowLeft, Users, Clock, Play, Pause, Square, MessageSquare } from 'lucide-react';

import { ParticipantList } from './ParticipantList';
import { ArgumentInput } from './ArgumentInput';
import { ArgumentsList } from './ArgumentsList';
import { DebateTimer } from './DebateTimer';
import { ChatSection } from './ChatSection';
import { DiscussionControls } from './DiscussionControls'
import { Debate, User, ChatMessageDto, VoteResultsDto, ParticipantDto } from '../types';


type DebateRoomProps = {
  debate: Debate;
  onLeaveDebate: () => void;
  onStartDebate: () => void;
  onPauseDebate: () => void;
  onEndDebate: () => void;
  onStartVoting: () => void;
  onAddArgument: (text: string, participantId: string) => void;
  user: User | null;
  myParticipant: ParticipantDto | null;

  timeRemaining: number;
  isTimerRunning: boolean;

  chatMessages: ChatMessageDto[];
  onSendChatMessage: (content: string) => void;

  voteResults: VoteResultsDto;
  onSendVote: (side: 'for' | 'against') => void;
};

export function DebateRoom({
  debate,
  onLeaveDebate,
  onStartDebate,
  onPauseDebate,
  onEndDebate,
  onStartVoting,
  onAddArgument,
  user,
  myParticipant,
  timeRemaining,
  isTimerRunning,
  chatMessages,
  onSendChatMessage,
  voteResults,
  onSendVote,
}: DebateRoomProps) {

  const getPhaseDisplay = () => {
    switch (debate.currentPhase) {
      case 'waiting': return <Badge className="bg-yellow-500 text-white">대기 중</Badge>;
      case 'debating': return <Badge className="bg-green-500 text-white">토론 진행 중</Badge>;
      case 'voting': return <Badge className="bg-purple-500 text-white">투표 진행 중</Badge>;
      case 'paused': return <Badge className="bg-orange-500 text-white">일시 정지</Badge>;
      case 'finished': return <Badge className="bg-gray-500 text-white">토론 종료</Badge>;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="border-b border-gray-700 bg-gray-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={onLeaveDebate} className="text-white hover:bg-gray-700">
                <ArrowLeft className="w-4 h-4 mr-2" />
                나가기
              </Button>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-xl font-bold">토론방</h2>
                  {getPhaseDisplay()}
                </div>
                <p className="text-gray-400">
                  {debate.topic}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <DebateTimer
                timeRemaining={timeRemaining}
                isRunning={isTimerRunning}
              />

              <div className="flex gap-2">
                {debate.currentPhase === 'waiting' && (
                  <Button onClick={onStartDebate} className="bg-blue-600 hover:bg-blue-700">
                    <Play className="w-4 h-4 mr-2" />
                    시작
                  </Button>
                )}
                {debate.currentPhase === 'debating' && (
                  <>
                    <Button variant="outline" onClick={onPauseDebate} className="border-gray-500 text-white hover:bg-gray-700">
                      <Pause className="w-4 h-4 mr-2" />
                      일시정지
                    </Button>
                    <Button variant="destructive" onClick={onEndDebate} className="bg-red-600 hover:bg-red-700">
                      <Square className="w-4 h-4 mr-2" />
                      종료
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Participants Sidebar */}
          <div className="lg:col-span-1">
            <Card className="bg-gray-800 border-gray-700 text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Users className="w-5 h-5" />
                  참가자 ({debate.participants.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ParticipantList participants={debate.participants} />
              </CardContent>
            </Card>
          </div>

          {/* Main Debate Area */}
          <div className="lg:col-span-3 space-y-6">
            {/* Discussion Topic */}
            <Card className="bg-gray-800 border-gray-700 text-white">
              <CardHeader>
                <CardTitle className="text-lg">토론 주제: {debate.topic}</CardTitle>
              </CardHeader>
              <CardContent>
                  <div className="flex justify-center items-center gap-2 text-sm">
                      {getPhaseDisplay()}
                      <span className="px-3 py-1 rounded-full bg-blue-700">
                          총 토론 시간: {debate.timeLimit}분
                      </span>
                  </div>
              </CardContent>
            </Card>
            
            {/* Debate Controls & Voting */}
            <Card className="bg-gray-800 border-gray-700 text-white">
                <CardHeader>
                    <CardTitle className="text-lg">토론 제어 및 투표</CardTitle>
                </CardHeader>
                <CardContent>
                    <DiscussionControls
                        currentStatus={debate.currentPhase}
                        onStartDiscussion={onStartDebate}
                        onEndDiscussion={onEndDebate}
                        onStartVoting={onStartVoting}
                        onVote={onSendVote}
                        voteResults={voteResults}
                    />
                </CardContent>
            </Card>


            {/* Arguments */}
            <Card className="bg-gray-800 border-gray-700 text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                    <MessageSquare className="w-5 h-5" />
                    주장 ({debate.arguments.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ArgumentsList
                  arguments={debate.arguments}
                  participants={debate.participants}
                />
              </CardContent>
            </Card>

            {/* Argument Input */}
            {debate.currentPhase === 'debating' && myParticipant && (
              <Card className="bg-gray-800 border-gray-700 text-white">
                <CardHeader>
                  <CardTitle className="text-lg">당신의 주장 추가하기</CardTitle>
                </CardHeader>
                <CardContent>
                  <ArgumentInput
                    onAddArgument={(text) => onAddArgument(text, myParticipant.id)}
                    currentUser={myParticipant}
                    disabled={debate.currentPhase !== 'debating'}
                  />
                </CardContent>
              </Card>
            )}

            {/* Chat Section */}
            <ChatSection
                messages={chatMessages}
                onSendMessage={onSendChatMessage}
            />

            {/* Debate Finished Message */}
            {debate.currentPhase === 'finished' && (
              <Card className="border-red-600/20 bg-red-600/10 text-white">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <h3 className="text-xl font-bold mb-2">토론 종료!</h3>
                    <p className="text-gray-400 mb-4">
                      시간이 종료되었습니다! 위 주장들을 검토하고 다양한 관점을 되돌아보세요.
                    </p>
                    <Button onClick={onLeaveDebate} className="bg-blue-600 hover:bg-blue-700">
                      홈으로 돌아가기
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}