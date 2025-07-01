import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { GameProvider } from './contexts/GameContext';
import HomePage from './components/HomePage';
import BattlePage from './components/BattlePage';
import LeaderboardPage from './components/LeaderboardPage';

function App() {
  return (
    <GameProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/battle" element={<BattlePage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
        </Routes>
      </Router>
    </GameProvider>
  );
}

export default App;