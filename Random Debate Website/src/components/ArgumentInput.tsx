import { useState } from 'react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Label } from './ui/label';
import { Send } from 'lucide-react';
import { Participant } from '../App';
import { User } from './AuthModal';
import { KeyboardEvent } from "react";

type ArgumentInputProps = {
  onAddArgument: (text: string, participantId: string) => void;
  participants: Participant[];
  disabled?: boolean;
  currentUser: User | null;
};

export function ArgumentInput({ onAddArgument, participants, disabled = false, currentUser }: ArgumentInputProps) {
  const [argumentText, setArgumentText] = useState('');
  const [selectedParticipant, setSelectedParticipant] = useState<string>('');
  
  // 현재 사용자의 참여자 정보 찾기
  const userParticipant = currentUser ? participants.find(p => p.id === currentUser.id) : null;

  const handleSubmit = () => {
    const participantId = userParticipant ? userParticipant.id : selectedParticipant;
    if (!argumentText.trim() || (!userParticipant && !selectedParticipant)) return;
    
    onAddArgument(argumentText.trim(), participantId);
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
        <div className="bg-muted/50 p-3 rounded-lg">
          <Label>발언자</Label>
          <div className="flex items-center gap-2 mt-1">
            <div className={`w-3 h-3 rounded-full ${userParticipant.color}`} />
            <span>{userParticipant.name} ({userParticipant.side === 'for' ? '👍 찬성' : '👎 반대'})</span>
          </div>
        </div>
      ) : (
        <div>
          <Label htmlFor="participant-select">발언자 선택</Label>
          <Select value={selectedParticipant} onValueChange={setSelectedParticipant}>
            <SelectTrigger>
              <SelectValue placeholder="참여자를 선택하세요" />
            </SelectTrigger>
            <SelectContent>
              {participants.map(participant => (
                <SelectItem key={participant.id} value={participant.id}>
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${participant.color}`} />
                    {participant.name} ({participant.side === 'for' ? '👍 찬성' : '👎 반대'})
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div>
        <Label htmlFor="argument-text">의견</Label>
        <Textarea
          id="argument-text"
          placeholder="의견을 입력하세요... (Ctrl/Cmd + Enter로 제출)"
          value={argumentText}
          onChange={(e) => setArgumentText(e.target.value)}
          onKeyDown={handleKeyPress}
          disabled={disabled}
          rows={4}
          className="resize-none"
        />
        <div className="flex justify-between items-center mt-2">
          <p className="text-sm text-muted-foreground">
            {argumentText.length}/1000 글자
          </p>
          <p className="text-sm text-muted-foreground">
            Ctrl/Cmd + Enter로 제출
          </p>
        </div>
      </div>

      <Button 
        onClick={handleSubmit}
        disabled={!argumentText.trim() || (!userParticipant && !selectedParticipant) || disabled}
        className="w-full"
        size="lg"
      >
        <Send className="w-4 h-4 mr-2" />
        의견 제출
      </Button>
    </div>
  );
}