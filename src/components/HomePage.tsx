import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Flame, Trophy, Users } from 'lucide-react';
import { getTopPlayers, getRoastTitle, Player } from '../lib/supabase';
import { useGame } from '../contexts/GameContext';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { gameState, setUsername } = useGame();
  const [inputUsername, setInputUsername] = useState(gameState.username);
  const [topPlayers, setTopPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTopPlayers = async () => {
      const players = await getTopPlayers(3);
      setTopPlayers(players);
    };
    fetchTopPlayers();
  }, []);

  const handleStartBattle = () => {
    if (!inputUsername.trim()) {
      alert('Please enter a username to start roasting!');
      return;
    }
    setUsername(inputUsername.trim());
    navigate('/battle');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-500 via-orange-500 to-yellow-500 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Main Title */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Flame className="text-white w-12 h-12 mr-3" />
            <h1 className="text-5xl font-bold text-white drop-shadow-lg">
              Roast Royale
            </h1>
            <Flame className="text-white w-12 h-12 ml-3" />
          </div>
          <p className="text-white text-xl opacity-90">
            The Ultimate AI Roast Battle Arena! 🔥
          </p>
        </div>

        {/* Game Start Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 mb-8 transform hover:scale-105 transition-transform duration-300">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              Ready to Get Roasted?
            </h2>
            <p className="text-gray-600 text-lg">
              Enter your username and prepare for epic AI comebacks!
            </p>
          </div>

          <div className="space-y-4">
            <input
              type="text"
              placeholder="Enter your roasting username..."
              value={inputUsername}
              onChange={(e) => setInputUsername(e.target.value)}
              className="w-full px-6 py-4 text-lg border-2 border-gray-300 rounded-xl focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all duration-300"
              maxLength={20}
            />
            
            <button
              onClick={handleStartBattle}
              disabled={!inputUsername.trim()}
              className="w-full bg-gradient-to-r from-red-500 to-orange-500 text-white text-xl font-bold py-4 px-8 rounded-xl hover:from-red-600 hover:to-orange-600 disabled:from-gray-400 disabled:to-gray-500 transform hover:scale-105 transition-all duration-300 shadow-lg"
            >
              🔥 Start Roast Battle! 🔥
            </button>
          </div>
        </div>

        {/* Top Players Preview */}
        {topPlayers.length > 0 && (
          <div className="bg-white rounded-2xl shadow-2xl p-6">
            <div className="flex items-center justify-center mb-4">
              <Trophy className="text-yellow-500 w-8 h-8 mr-2" />
              <h3 className="text-2xl font-bold text-gray-800">
                Top Roasters
              </h3>
            </div>
            
            <div className="space-y-3">
              {topPlayers.map((player, index) => (
                <div
                  key={player.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200"
                >
                  <div className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold mr-3 ${
                      index === 0 ? 'bg-yellow-500' : 
                      index === 1 ? 'bg-gray-400' : 'bg-orange-500'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{player.username}</p>
                      <p className="text-sm text-gray-600">{getRoastTitle(player.roast_score)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-red-500 text-lg">{player.roast_score}</p>
                    <p className="text-xs text-gray-500">points</p>
                  </div>
                </div>
              ))}
            </div>
            
            <button
              onClick={() => navigate('/leaderboard')}
              className="w-full mt-4 bg-blue-500 text-white font-semibold py-3 px-6 rounded-xl hover:bg-blue-600 transition-colors duration-300"
            >
              <Users className="inline w-5 h-5 mr-2" />
              View Full Leaderboard
            </button>
          </div>
        )}

        {/* Built with Bolt Badge */}
        <div className="text-center mt-8">
          <p className="text-white opacity-75">
            Built with ⚡ <strong>Bolt.new</strong>
          </p>
        </div>
      </div>
    </div>
  );
};

export default HomePage;