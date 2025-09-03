import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { ArrowLeft, Users, Clock, Play, Pause, Square } from 'lucide-react';
import { ParticipantList } from './ParticipantList';
import { ArgumentInput } from './ArgumentInput';
import { ArgumentsList } from './ArgumentsList';
import { DebateTimer } from './DebateTimer';
import { Debate, Argument } from '../App';
import { User } from './AuthModal';

type DebateRoomProps = {
  debate: Debate;
  onLeaveDebate: () => void;
  onUpdateDebate: (debate: Debate) => void;
  user: User | null;
};

export function DebateRoom({ debate, onLeaveDebate, onUpdateDebate, user }: DebateRoomProps) {
  const [timeRemaining, setTimeRemaining] = useState(debate.timeLimit * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(debate.currentPhase === 'debating');

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isTimerRunning && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            onUpdateDebate({
              ...debate,
              currentPhase: 'finished'
            });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isTimerRunning, timeRemaining, debate, onUpdateDebate]);

  const handleStartDebate = () => {
    setIsTimerRunning(true);
    onUpdateDebate({
      ...debate,
      currentPhase: 'debating'
    });
  };

  const handlePauseDebate = () => {
    setIsTimerRunning(false);
  };

  const handleEndDebate = () => {
    setIsTimerRunning(false);
    onUpdateDebate({
      ...debate,
      currentPhase: 'finished'
    });
  };

  const handleAddArgument = (text: string, participantId: string) => {
    const participant = debate.participants.find(p => p.id === participantId);
    if (!participant) return;

    const newArgument: Argument = {
      id: Date.now().toString(),
      participantId,
      text,
      timestamp: Date.now(),
      side: participant.side
    };

    const updatedDebate = {
      ...debate,
      arguments: [...debate.arguments, newArgument]
    };

    onUpdateDebate(updatedDebate);
  };

  const getPhaseDisplay = () => {
    switch (debate.currentPhase) {
      case 'waiting':
        return <Badge variant="secondary">Waiting to Start</Badge>;
      case 'debating':
        return <Badge variant="default">Debate in Progress</Badge>;
      case 'finished':
        return <Badge variant="destructive">Debate Finished</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={onLeaveDebate}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Leave
              </Button>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h2>Debate Room</h2>
                  {getPhaseDisplay()}
                </div>
                <p className="text-muted-foreground">
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
                  <Button onClick={handleStartDebate}>
                    <Play className="w-4 h-4 mr-2" />
                    Start
                  </Button>
                )}
                
                {debate.currentPhase === 'debating' && (
                  <>
                    <Button variant="outline" onClick={handlePauseDebate}>
                      <Pause className="w-4 h-4 mr-2" />
                      Pause
                    </Button>
                    <Button variant="destructive" onClick={handleEndDebate}>
                      <Square className="w-4 h-4 mr-2" />
                      End
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
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Participants ({debate.participants.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ParticipantList participants={debate.participants} />
              </CardContent>
            </Card>
          </div>

          {/* Main Debate Area */}
          <div className="lg:col-span-3 space-y-6">
            {/* Arguments */}
            <Card>
              <CardHeader>
                <CardTitle>Arguments ({debate.arguments.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <ArgumentsList 
                  arguments={debate.arguments}
                  participants={debate.participants}
                />
              </CardContent>
            </Card>

            {/* Argument Input */}
            {debate.currentPhase === 'debating' && (
              <Card>
                <CardHeader>
                  <CardTitle>Add Your Argument</CardTitle>
                </CardHeader>
                <CardContent>
                  <ArgumentInput 
                    onAddArgument={handleAddArgument}
                    participants={debate.participants}
                    disabled={debate.currentPhase !== 'debating'}
                    currentUser={user}
                  />
                </CardContent>
              </Card>
            )}

            {/* Debate Finished Message */}
            {debate.currentPhase === 'finished' && (
              <Card className="border-destructive/20 bg-destructive/5">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <h3 className="mb-2">Debate Finished!</h3>
                    <p className="text-muted-foreground mb-4">
                      Time's up! Review the arguments above and reflect on the different perspectives shared.
                    </p>
                    <Button onClick={onLeaveDebate}>
                      Return to Home
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