import React, { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ChatMessageDto } from '../types';

interface ChatSectionProps {
  messages: ChatMessageDto[];
  onSendMessage: (content: string) => void;
}

export const ChatSection: React.FC<ChatSectionProps> = ({ messages, onSendMessage }) => {
  const [newMessage, setNewMessage] = useState('');
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // 새 메시지가 도착할 때마다 스크롤을 맨 아래로 이동
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      onSendMessage(newMessage);
      setNewMessage('');
    }
  };

  const renderMessage = (msg: ChatMessageDto, index: number) => {
    // 시스템 메시지 (입장, 퇴장 등) 스타일링
    if (msg.type === 'JOIN' || msg.type === 'LEAVE' || msg.type === 'STATUS') {
      return (
        <div key={index} className="text-center my-2">
          <span className="text-xs text-gray-400 bg-gray-700 px-2 py-1 rounded-full">
            {msg.content}
          </span>
        </div>
      );
    }

    // 일반 채팅 메시지
    return (
      <div key={index} className="flex flex-col items-start mb-2">
        <span className="text-sm font-semibold text-gray-300 ml-1">{msg.sender}</span>
        <div className="bg-blue-600 rounded-lg px-3 py-2 max-w-xs break-words">
          <p>{msg.content}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full mx-auto p-4 bg-gray-800 text-white rounded-lg shadow-lg flex flex-col h-[500px]">
      <h2 className="text-xl font-bold text-center mb-4 border-b border-gray-700 pb-2">실시간 채팅</h2>
      <div ref={chatContainerRef} className="flex-grow overflow-y-auto pr-2">
        {messages.length > 0 ? (
          messages.map(renderMessage)
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            아직 메시지가 없습니다.
          </div>
        )}
      </div>
      <form onSubmit={handleSendMessage} className="mt-4 flex gap-2">
        <Input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="메시지를 입력하세요..."
          className="flex-grow bg-gray-700 border-gray-600 text-white"
        />
        <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
          전송
        </Button>
      </form>
    </div>
  );
};