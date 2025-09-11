import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { User, Users } from 'lucide-react';
import { Debate, ParticipantDto } from '../types';
import { User as UserType } from './AuthModal';

type JoinDebateModalProps = {
  isOpen: boolean;
  onClose: () => void;
  debate: Debate | null;
  user: UserType | null;
  onJoinDebate: (debate: Debate, participant: ParticipantDto) => void;
};

const PARTICIPANT_COLORS = [
  'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 
  'bg-pink-500', 'bg-indigo-500', 'bg-teal-500', 'bg-red-500'
];

export function JoinDebateModal({ isOpen, onClose, debate, user, onJoinDebate }: JoinDebateModalProps) {
  const [guestName, setGuestName] = useState('');
  const [selectedSide, setSelectedSide] = useState<'for' | 'against' | null>(null);

  const handleJoin = () => {
    if (!debate || !selectedSide) return;
    if (!user && !guestName.trim()) return;

    // 이미 참여하고 있는지 확인
    if (user && debate.participants.some(p => p.id === user.id)) {
      // 이미 참여 중이면 그냥 입장
      onJoinDebate(debate, debate.participants.find(p => p.id === user.id)!);
      onClose();
      return;
    }

    // 새 참여자 생성
    const participant: ParticipantDto = {
      id: user ? user.id : `guest-${Date.now()}`,
      name: user ? user.name : guestName,
      side: selectedSide,
      color: PARTICIPANT_COLORS[debate.participants.length % PARTICIPANT_COLORS.length]
    };

    const updatedDebate: Debate = {
      ...debate,
      participants: [...debate.participants, participant]
    };

    onJoinDebate(updatedDebate, participant);
    onClose();
  };

  const resetForm = () => {
    setGuestName('');
    setSelectedSide(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!debate) return null;

  const forCount = debate.participants.filter(p => p.side === 'for').length;
  const againstCount = debate.participants.filter(p => p.side === 'against').length;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>토론방 참여</DialogTitle>
          <DialogDescription>
            토론방에 참여하기 위한 정보를 입력하세요
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* 토론 주제 */}
          <div className="p-4 bg-muted/50 rounded-lg">
            <h4 className="mb-2">토론 주제</h4>
            <p className="text-sm text-muted-foreground">{debate.topic}</p>
          </div>

          {/* 현재 참여자 현황 */}
          <div className="space-y-2">
            <h4>현재 참여자 ({debate.participants.length}명)</h4>
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                👍 찬성 ({forCount})
              </Badge>
              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                👎 반대 ({againstCount})
              </Badge>
            </div>
          </div>

          {/* 사용자 정보 */}
          {user ? (
            <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2 text-blue-700 dark:text-blue-200">
                <Badge variant="secondary">회원</Badge>
                <span><strong>{user.name}</strong>님으로 참여</span>
              </div>
            </div>
          ) : (
            <div>
              <Label htmlFor="guestName">게스트 이름</Label>
              <Input
                id="guestName"
                placeholder="토론에 사용할 이름을 입력하세요"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
              />
            </div>
          )}

          {/* 입장 선택 */}
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

          {/* 참여 버튼 */}
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleClose} className="flex-1">
              취소
            </Button>
            <Button 
              onClick={handleJoin}
              disabled={!selectedSide || (!user && !guestName.trim())}
              className="flex-1"
            >
              <Users className="w-4 h-4 mr-2" />
              참여하기
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}