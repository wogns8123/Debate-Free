
export interface ParticipantDto {
    id: string;
    name: string;
    side: 'for' | 'against' | 'none';
    color: string;
}

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
    participantName: string;
    side: 'for' | 'against';
    text: string;
    timestamp: number;
}

export interface Debate {
    id: string;
    topic: string;
    currentPhase: 'waiting' | 'debating' | 'finished' | 'voting' | 'paused';
    timeLimit: number;
    createdAt: number;
    participants: ParticipantDto[];
    arguments: Argument[];
}

export interface User {
    id: string;
    name: string;
}