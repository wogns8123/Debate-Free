// src/types/participant.ts
export interface Participant {
    id: string;
    name: string;
    side: 'for' | 'against';
    color: string;
}
