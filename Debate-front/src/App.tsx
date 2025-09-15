import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage'; 
import DiscussionRoomPage from './pages/DiscussionRoomPage'; // 새로 만들 페이지
import './styles/globals.css';

function App() {
    return (
        <Router>
            <div className="bg-gray-900 text-white min-h-screen">
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/room/:roomId" element={<DiscussionRoomPage />} />
                </Routes>
            </div>
        </Router>
    );
}
export default App;