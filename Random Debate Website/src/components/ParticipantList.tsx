import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Participant } from '../App';

type ParticipantListProps = {
  participants: Participant[];
};

export function ParticipantList({ participants }: ParticipantListProps) {
  const forParticipants = participants.filter(p => p.side === 'for');
  const againstParticipants = participants.filter(p => p.side === 'against');

  const ParticipantItem = ({ participant }: { participant: Participant }) => (
    <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
      <Avatar className="w-8 h-8">
        <AvatarFallback className={`${participant.color} text-white text-sm`}>
          {participant.name.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <p className="font-medium text-sm">{participant.name}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* For Side */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
            👍 For ({forParticipants.length})
          </Badge>
        </div>
        <div className="space-y-2">
          {forParticipants.length > 0 ? (
            forParticipants.map(participant => (
              <ParticipantItem key={participant.id} participant={participant} />
            ))
          ) : (
            <div className="text-muted-foreground text-sm text-center py-2">
              No participants yet
            </div>
          )}
        </div>
      </div>

      {/* Against Side */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="destructive" className="bg-red-100 text-red-800 border-red-200">
            👎 Against ({againstParticipants.length})
          </Badge>
        </div>
        <div className="space-y-2">
          {againstParticipants.length > 0 ? (
            againstParticipants.map(participant => (
              <ParticipantItem key={participant.id} participant={participant} />
            ))
          ) : (
            <div className="text-muted-foreground text-sm text-center py-2">
              No participants yet
            </div>
          )}
        </div>
      </div>

      {participants.length === 0 && (
        <div className="text-center py-4 text-muted-foreground">
          <p>Waiting for participants to join...</p>
        </div>
      )}
    </div>
  );
}