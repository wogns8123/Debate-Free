import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from '@/pages/HomePage';
import DiscussionRoomPage from '@/pages/DiscussionRoomPage';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/room/:roomId" element={<DiscussionRoomPage />} />
            </Routes>
        </Router>
    );
}

export default App;