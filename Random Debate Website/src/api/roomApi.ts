import axios from 'axios';
import { DiscussionStatus } from '../types';

// 프록시 설정 덕분에 전체 URL을 적지 않아도 됩니다.
const API_URL = '/api/rooms';

export const createRoom = async (): Promise<DiscussionStatus> => {
    const response = await axios.post<DiscussionStatus>(`${API_URL}/create`);
    return response.data;
};

export const getRoomStatus = async (roomId: string): Promise<DiscussionStatus> => {
    const response = await axios.get<DiscussionStatus>(`${API_URL}/${roomId}/status`);
    return response.data;
};