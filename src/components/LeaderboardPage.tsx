import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Medal, Award, Home, RotateCcw, Users, Crown } from 'lucide-react';
import { getTopPlayers, getRoastTitle, Player } from '../lib/supabase';
import { useGame } from '../contexts/GameContext';

const LeaderboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { gameState, resetGame, setCurrentScore } = useGame();
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlayers = async () => {
      setLoading(true);
      const topPlayers = await getTopPlayers(10);
      setPlayers(topPlayers);
      setLoading(false);
    };
    fetchPlayers();
  }, []);

  const handlePlayAgain = () => {
    resetGame();
    setCurrentScore(0); // Ensure current score is reset before going to home
    setTimeout(() => {
      navigate('/');
    }, 50);
  };

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0: return <Crown className="w-6 h-6 text-yellow-500" />;
      case 1: return <Medal className="w-6 h-6 text-gray-400" />;
      case 2: return <Award className="w-6 h-6 text-orange-500" />;
      default: return <div className="w-6 h-6 flex items-center justify-center text-gray-500 font-bold">#{index + 1}</div>;
    }
  };

  const getRankBg = (index: number) => {
    switch (index) {
      case 0: return 'bg-gradient-to-r from-yellow-100 to-yellow-200 border-yellow-300';
      case 1: return 'bg-gradient-to-r from-gray-100 to-gray-200 border-gray-300';
      case 2: return 'bg-gradient-to-r from-orange-100 to-orange-200 border-orange-300';
      default: return 'bg-white border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-500 to-teal-500 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
          <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-500 to-teal-500 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8 pt-8">
          <div className="flex items-center justify-center mb-4">
            <Trophy className="text-yellow-400 w-12 h-12 mr-3" />
            <h1 className="text-5xl font-bold text-white drop-shadow-lg">
              Leaderboard
            </h1>
            <Trophy className="text-yellow-400 w-12 h-12 ml-3" />
          </div>
          <p className="text-white text-xl opacity-90">
            Hall of Fame - Top Roast Masters! 🔥
          </p>
        </div>

        {gameState.username && (
          <div className="bg-white rounded-2xl shadow-2xl p-6 mb-8 border-4 border-blue-300">
            <div className="text-center">
              <Users className="w-10 h-10 text-blue-500 mx-auto mb-2" />
              <h2 className="text-2xl font-bold text-gray-800 mb-1">Your Stats</h2>
              <div className="flex items-center justify-center space-x-6">
                <div>
                  <p className="text-3xl font-bold text-blue-600">{gameState.currentScore}</p>
                  <p className="text-sm text-gray-600">Total Points</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-semibold text-gray-800">{gameState.username}</p>
                  <p className="text-sm text-blue-600">{getRoastTitle(gameState.currentScore)}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-center">
            <h2 className="text-3xl font-bold text-white mb-2">🏆 Top Roasters 🏆</h2>
            <p className="text-purple-100">The ultimate roast battle champions</p>
          </div>

          <div className="p-6">
            {players.length === 0 ? (
              <div className="text-center py-12">
                <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-xl">No players yet!</p>
                <p className="text-gray-400">Be the first to claim the throne! 👑</p>
              </div>
            ) : (
              <div className="space-y-4">
                {players.map((player, index) => (
                  <div
                    key={player.id}
                    className={`p-4 rounded-xl border-2 transform hover:scale-105 transition-all duration-300 ${getRankBg(index)} ${
                      player.username === gameState.username ? 'ring-4 ring-blue-300' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center justify-center">
                          {getRankIcon(index)}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-800 flex items-center">
                            {player.username}
                            {player.username === gameState.username && (
                              <span className="ml-2 text-sm bg-blue-500 text-white px-2 py-1 rounded-full">
                                You!
                              </span>
                            )}
                          </h3>
                          <p className="text-gray-600 font-medium">{getRoastTitle(player.roast_score)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold text-purple-600">{player.roast_score}</p>
                        <p className="text-sm text-gray-500">points</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handlePlayAgain}
            className="bg-gradient-to-r from-green-500 to-blue-500 text-white text-xl font-bold py-4 px-8 rounded-xl hover:from-green-600 hover:to-blue-600 transform hover:scale-105 transition-all duration-300 shadow-lg flex items-center justify-center"
          >
            <RotateCcw className="w-6 h-6 mr-2" />
            🔥 Play Again! 🔥
          </button>

          <button
            onClick={() => navigate('/')}
            className="bg-gradient-to-r from-gray-500 to-gray-600 text-white text-xl font-bold py-4 px-8 rounded-xl hover:from-gray-600 hover:to-gray-700 transform hover:scale-105 transition-all duration-300 shadow-lg flex items-center justify-center"
          >
            <Home className="w-6 h-6 mr-2" />
            Home
          </button>
        </div>

        <div className="text-center mt-8">
          <p className="text-white opacity-75">
            Built with ⚡ <strong>Bolt.new</strong>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardPage;
