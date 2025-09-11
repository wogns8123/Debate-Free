import { Card } from './ui/card';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import { MessageSquare } from 'lucide-react';
import { Argument, ParticipantDto } from '../types';

type ArgumentsListProps = {
  arguments: Argument[];
  participants: ParticipantDto[];
};

export function ArgumentsList({ arguments: debateArguments, participants }: ArgumentsListProps) {
  const getParticipant = (participantId: string) => {
    return participants.find(p => p.id === participantId);
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (debateArguments.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p>No arguments yet. Be the first to make your point!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-h-96 overflow-y-auto">
      {debateArguments.map((argument) => {
        const participant = getParticipant(argument.participantId);
        if (!participant) return null;

        return (
          <Card key={argument.id} className="p-4">
            <div className="flex items-start gap-3">
              <Avatar className="w-10 h-10 flex-shrink-0">
                <AvatarFallback className={`${participant.color} text-white`}>
                  {participant.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-medium">{participant.name}</span>
                  <Badge 
                    variant={argument.side === 'for' ? 'default' : 'destructive'}
                    className={argument.side === 'for' 
                      ? 'bg-green-100 text-green-800 border-green-200' 
                      : 'bg-red-100 text-red-800 border-red-200'
                    }
                  >
                    {argument.side === 'for' ? '👍 For' : '👎 Against'}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {formatTime(argument.timestamp)}
                  </span>
                </div>
                
                <div className="prose prose-sm max-w-none">
                  <p className="text-foreground leading-relaxed">
                    {argument.text}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}