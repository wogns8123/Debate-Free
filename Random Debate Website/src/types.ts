export interface ParticipantDto {
    id: string;
    name: string;
    side: 'for' | 'against' | 'none';
    color: string;
}

// 새로 추가될 타입들
export interface ChatMessageDto {
    type: 'CHAT' | 'JOIN' | 'LEAVE' | 'STATUS';
    content: string;
    sender: string;
    roomId: string;
    timestamp: string;
}

export interface DiscussionStatusDto {
    roomId: string;
    type: 'WAITING' | 'STARTED' | 'PAUSED' | 'ENDED' | 'VOTING';
    message: string;
    currentTopic: string;
    startTime: number;
    durationSeconds: number;
}

export interface VoteResultsDto {
    for: number;
    against: number;
}

export interface Argument {
    id: string;
    participantId: string;
    participantName: string; // ArgumentsList.tsx에서는 사용하지 않지만, 유용할 수 있어 남겨둡니다.
    side: 'for' | 'against';

    // 🔴 'content' -> 'text'로 변경
    text: string;

    // 🔴 'string' -> 'number'로 변경
    timestamp: number;
}
