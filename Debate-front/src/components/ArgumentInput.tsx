import { useState, KeyboardEvent } from 'react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Send } from 'lucide-react';
import { ParticipantDto } from '../types';

type ArgumentInputProps = {
  onAddArgument: (text: string) => void; // participantId는 DiscussionRoomPage에서 주입
  currentUser: ParticipantDto | null;
  disabled?: boolean;
};

export function ArgumentInput({ onAddArgument, currentUser, disabled = false }: ArgumentInputProps) {
  const [argumentText, setArgumentText] = useState('');

  const userParticipant = currentUser;

  const handleSubmit = () => {
    if (!argumentText.trim() || !userParticipant || disabled) return;
    if (userParticipant.side === 'none') {
        console.warn("Cannot add argument: Participant has no assigned side.");
        return;
    }
    
    onAddArgument(argumentText.trim()); // participantId는 이미 상위에서 처리됨
    setArgumentText('');
  };

  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="space-y-4">
      {userParticipant ? (
        <div className="bg-muted/50 p-3 rounded-lg text-white">
          <Label htmlFor="current-participant-display" className="text-gray-400">발언자</Label>
          <div id="current-participant-display" className="flex items-center gap-2 mt-1">
            <div className={`w-3 h-3 rounded-full ${userParticipant.color}`} />
            <span>{userParticipant.name} ({userParticipant.side === 'for' ? '👍 찬성' : '👎 반대'})</span>
          </div>
        </div>
      ) : (
        <div className="text-center text-gray-400 py-4">
            토론에 참여하려면 먼저 진영을 선택하고 방에 참여해야 합니다.
        </div>
      )}

      {userParticipant && (
          <div>
            <Label htmlFor="argument-text" className="text-gray-400">의견</Label>
            <Textarea
              id="argument-text"
              placeholder="의견을 입력하세요... (Ctrl/Cmd + Enter로 제출)"
              value={argumentText}
              onChange={(e) => setArgumentText(e.target.value)}
              onKeyDown={handleKeyPress}
              disabled={disabled || userParticipant.side === 'none'}
              rows={4}
              className="resize-none bg-gray-700 border-gray-600 text-white placeholder-gray-400 mt-2"
            />
            <div className="flex justify-between items-center mt-2 text-gray-400">
              <p className="text-sm">
                {argumentText.length}/1000 글자
              </p>
              <p className="text-sm">
                Ctrl/Cmd + Enter로 제출
              </p>
            </div>
          </div>
      )}

      {userParticipant && (
          <Button
            onClick={handleSubmit}
            disabled={!argumentText.trim() || disabled || userParticipant.side === 'none'}
            className="w-full bg-blue-600 hover:bg-blue-700"
            size="lg"
          >
            <Send className="w-4 h-4 mr-2" />
            의견 제출
          </Button>
      )}
    </div>
  );
}