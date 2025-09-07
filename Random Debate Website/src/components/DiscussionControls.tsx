import React from 'react';
import { Button } from './ui/button'; // Gist에 있는 Button 컴포넌트
import { DiscussionStatusDto, VoteResultsDto } from '../types';

interface DiscussionControlsProps {
  currentStatus: DiscussionStatusDto['type'];
  onStartDiscussion: () => void;
  onEndDiscussion: () => void;
  onStartVoting: () => void;
  onVote: (side: 'for' | 'against') => void;
  voteResults: VoteResultsDto | null;
}

export const DiscussionControls: React.FC<DiscussionControlsProps> = ({
  currentStatus,
  onStartDiscussion,
  onEndDiscussion,
  onStartVoting,
  onVote,
  voteResults,
}) => {
  const totalVotes = voteResults ? voteResults.for + voteResults.against : 0;
  const forPercentage = totalVotes > 0 ? ((voteResults!.for / totalVotes) * 100).toFixed(1) : 0;
  const againstPercentage = totalVotes > 0 ? ((voteResults!.against / totalVotes) * 100).toFixed(1) : 0;
  
  return (
    <div className="w-full mx-auto p-4 bg-gray-800 text-white rounded-lg shadow-lg mb-4">
      <h2 className="text-xl font-bold text-center mb-4">토론 제어 및 투표</h2>
      <div className="flex justify-center space-x-4 mb-4">
        {currentStatus === 'WAITING' && (
          <Button onClick={onStartDiscussion} className="bg-blue-600 hover:bg-blue-700">
            토론 시작
          </Button>
        )}
        {currentStatus === 'STARTED' && (
          <Button onClick={onStartVoting} className="bg-purple-600 hover:bg-purple-700">
            투표 시작
          </Button>
        )}
        {(currentStatus === 'STARTED' || currentStatus === 'VOTING') && (
          <Button onClick={onEndDiscussion} className="bg-red-600 hover:bg-red-700">
            토론 종료
          </Button>
        )}
      </div>

      {currentStatus === 'VOTING' && (
        <div className="mb-4 text-center">
          <p className="text-lg font-semibold mb-2">당신의 의견에 투표하세요!</p>
          <div className="flex justify-center space-x-4">
            <Button onClick={() => onVote('for')} className="bg-green-600 hover:bg-green-700">
              찬성 👍
            </Button>
            <Button onClick={() => onVote('against')} className="bg-red-600 hover:bg-red-700">
              반대 👎
            </Button>
          </div>
        </div>
      )}

      {voteResults && totalVotes > 0 && (
        <div className="mt-4">
            <h3 className="text-center font-semibold mb-2">실시간 투표 현황</h3>
            <div className="flex w-full h-8 bg-gray-700 rounded-full overflow-hidden">
                <div 
                    className="bg-green-500 flex items-center justify-center text-sm font-bold" 
                    style={{ width: `${forPercentage}%` }}
                >
                   {forPercentage}%
                </div>
                <div 
                    className="bg-red-500 flex items-center justify-center text-sm font-bold" 
                    style={{ width: `${againstPercentage}%` }}
                >
                    {againstPercentage}%
                </div>
            </div>
            <div className="flex justify-between text-sm mt-1 px-2">
                <span>찬성: {voteResults.for}표</span>
                <span>반대: {voteResults.against}표</span>
            </div>
        </div>
      )}
    </div>
  );
};