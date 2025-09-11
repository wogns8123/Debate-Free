import { Clock } from 'lucide-react';
import { Badge } from './ui/badge';

type DebateTimerProps = {
  timeRemaining: number;
  isRunning: boolean;
};

export function DebateTimer({ timeRemaining, isRunning }: DebateTimerProps) {
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getTimeColor = () => {
    if (timeRemaining <= 60) return 'destructive'; // Last minute
    if (timeRemaining <= 180) return 'secondary'; // Last 3 minutes
    return 'default';
  };

  const getTimeStatus = () => {
    if (!isRunning && timeRemaining > 0) return 'Paused';
    if (timeRemaining <= 0) return 'Time Up!';
    return 'Active';
  };

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        <Clock className={`w-5 h-5 ${isRunning ? 'animate-pulse' : ''}`} />
        <div className="text-right">
          <div className="font-mono text-lg font-medium">
            {formatTime(timeRemaining)}
          </div>
          <div className="text-xs text-muted-foreground">
            {getTimeStatus()}
          </div>
        </div>
      </div>
      
      <Badge variant={getTimeColor()}>
        {timeRemaining <= 0 ? 'Finished' : isRunning ? 'Running' : 'Paused'}
      </Badge>
    </div>
  );
}