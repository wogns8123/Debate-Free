import { useState } from 'react';
import { LandingPage } from './components/LandingPage';
import { DebateRoom } from './components/DebateRoom';
import { Header } from './components/Header';
import { AuthModal, User } from './components/AuthModal';
import { JoinDebateModal } from './components/JoinDebateModal';
import { Toaster } from './components/ui/sonner';

export type Debate = {
  id: string;
  topic: string;
  participants: Participant[];
  arguments: Argument[];
  timeLimit: number;
  currentPhase: 'waiting' | 'debating' | 'finished';
  createdAt: number;
};

export type Participant = {
  id: string;
  name: string;
  side: 'for' | 'against';
  color: string;
};

export type Argument = {
  id: string;
  participantId: string;
  text: string;
  timestamp: number;
  side: 'for' | 'against';
};

export default function App() {
  const [currentView, setCurrentView] = useState<'landing' | 'debate'>('landing');
  const [currentDebate, setCurrentDebate] = useState<Debate | null>(null);
  const [allDebates, setAllDebates] = useState<Debate[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [selectedDebateToJoin, setSelectedDebateToJoin] = useState<Debate | null>(null);

  const handleJoinDebateRequest = (debate: Debate) => {
    // 이미 참여한 토론방이거나 데모 토론방인 경우 바로 입장
    if (debate.id === 'demo' || (user && debate.participants.some(p => p.id === user.id))) {
      setCurrentDebate(debate);
      setCurrentView('debate');
      return;
    }
    
    // 새로 참여하는 경우 모달 열기
    setSelectedDebateToJoin(debate);
    setIsJoinModalOpen(true);
  };

  const handleJoinDebate = (updatedDebate: Debate, participant: Participant) => {
    setAllDebates(prev => 
      prev.map(debate => 
        debate.id === updatedDebate.id ? updatedDebate : debate
      )
    );
    setCurrentDebate(updatedDebate);
    setCurrentView('debate');
  };

  const handleCreateDebate = (debate: Debate) => {
    setAllDebates(prev => [...prev, debate]);
    setCurrentDebate(debate);
    setCurrentView('debate');
  };

  const handleLeaveDebate = () => {
    setCurrentDebate(null);
    setCurrentView('landing');
  };

  const handleUpdateDebate = (updatedDebate: Debate) => {
    setCurrentDebate(updatedDebate);
    setAllDebates(prev => 
      prev.map(debate => 
        debate.id === updatedDebate.id ? updatedDebate : debate
      )
    );
  };

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    setIsAuthModalOpen(false);
  };

  const handleRegister = (registeredUser: User) => {
    setUser(registeredUser);
    setIsAuthModalOpen(false);
  };

  const handleLogout = () => {
    setUser(null);
    // TODO: SpringBoot API 호출로 교체
    // await fetch('/api/auth/logout', { method: 'POST' });
  };

  const handleOpenAuthModal = () => {
    setIsAuthModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header 
        user={user}
        onLogin={handleOpenAuthModal}
        onLogout={handleLogout}
      />
      
      <main>
        {currentView === 'landing' ? (
          <LandingPage 
            onJoinDebate={handleJoinDebateRequest}
            onCreateDebate={handleCreateDebate}
            allDebates={allDebates}
            user={user}
          />
        ) : (
          <DebateRoom 
            debate={currentDebate!} 
            onLeaveDebate={handleLeaveDebate}
            onUpdateDebate={handleUpdateDebate}
            user={user}
          />
        )}
      </main>

      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLogin={handleLogin}
        onRegister={handleRegister}
      />

      <JoinDebateModal 
        isOpen={isJoinModalOpen}
        onClose={() => setIsJoinModalOpen(false)}
        debate={selectedDebateToJoin}
        user={user}
        onJoinDebate={handleJoinDebate}
      />

      <Toaster />
    </div>
  );
}