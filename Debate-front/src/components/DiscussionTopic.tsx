import React, { useState, useEffect } from 'react';
import { DiscussionStatusDto } from '../types';

interface DiscussionTopicProps {
  status: DiscussionStatusDto | null;
}

export const DiscussionTopic: React.FC<DiscussionTopicProps> = ({ status }) => {
  const [remainingTime, setRemainingTime] = useState(0);

  useEffect(() => {
    if (status?.type === 'STARTED' && status.startTime > 0) {
      const interval = setInterval(() => {
        const elapsedSeconds = Math.floor((Date.now() - status.startTime) / 1000);
        const timeLeft = status.durationSeconds - elapsedSeconds;
        setRemainingTime(timeLeft > 0 ? timeLeft : 0);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [status]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!status) return null;

  return (
    <div className="w-full mx-auto p-4 bg-gray-800 text-white rounded-lg shadow-lg mb-4">
      <h2 className="text-2xl font-bold text-center mb-2">토론 주제</h2>
      <p className="text-lg text-center mb-3">"{status.currentTopic}"</p>
      <div className="flex justify-center items-center gap-2 text-sm">
        <span className={`px-3 py-1 rounded-full ${
          status.type === 'STARTED' ? 'bg-green-500' :
          status.type === 'VOTING' ? 'bg-purple-500' :
          status.type === 'ENDED' ? 'bg-gray-500' :
          'bg-yellow-500'
        }`}>
          {status.type === 'WAITING' && '대기 중'}
          {status.type === 'STARTED' && '토론 중'}
          {status.type === 'VOTING' && '투표 중'}
          {status.type === 'ENDED' && '종료됨'}
          {status.type === 'PAUSED' && '일시 정지'}
        </span>
        {status.type === 'STARTED' && (
          <span className="px-3 py-1 rounded-full bg-blue-700">
            남은 시간: {formatTime(remainingTime)}
          </span>
        )}
      </div>
    </div>
  );
};