import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader } from 'lucide-react';
import { useGame } from '../contexts/GameContext';
import { generateAIRoast } from '../lib/generateAIRoast';
import { assessRoastQuality } from '../lib/assessRoastQuality';
import { generateAudienceReactions } from '../lib/audience';
import { getRandomPrompt } from '../lib/gameData';
import { updatePlayerScore } from '../lib/supabase';

const BattlePage: React.FC = () => {
  const navigate = useNavigate();
  const { gameState, setGameState } = useGame();
  
  const setUserRoast = (roast: string) => {
    setGameState(prev => ({ ...prev, userRoast: roast }));
  };

  useEffect(() => {
    if (!gameState.username) {
      navigate('/');
      return;
    }
    
    if (!gameState.currentPrompt) {
      startNewRound();
    }
  }, [gameState.username, navigate]);

  const getQualityColor = (quality: number): string => {
    if (quality >= 8) return 'text-green-600 font-bold';
    if (quality >= 6) return 'text-yellow-600 font-bold';
    if (quality >= 4) return 'text-orange-600 font-bold';
    return 'text-red-600 font-bold';
  };

  const getQualityLabel = (quality: number): string => {
    if (quality >= 9) return 'Legendary';
    if (quality >= 8) return 'Epic';
    if (quality >= 7) return 'Great';
    if (quality >= 6) return 'Good';
    if (quality >= 5) return 'Decent';
    if (quality >= 4) return 'Weak';
    return 'Terrible';
  };

  const calculateScore = (userQuality: number, aiQuality: number): number => {
    const diff = userQuality - aiQuality;
    if (diff > 0) return Math.max(1, diff * 10);
    return 0;
  };

  const startNewRound = () => {
    const prompt = getRandomPrompt();
    setGameState(prev => ({
      ...prev,
      currentPrompt: prompt,
      userRoast: '',
      aiResponse: '',
      userQuality: 0,
      aiQuality: 0,
      audienceReactions: [],
      isLoading: false
    }));
  };

  const handleRoast = async () => {
    if (!gameState.userRoast.trim()) return;

    setGameState(prev => ({ ...prev, isLoading: true }));

    try {
      // Assess user roast quality
      const userQuality = await assessRoastQuality(gameState.userRoast, gameState.currentPrompt);
      
      // Generate AI response
      const aiResponse = await generateAIRoast(gameState.currentPrompt, gameState.userRoast);
      const aiQuality = await assessRoastQuality(aiResponse, gameState.currentPrompt);
      
      // Generate audience reactions
      const reactions = generateAudienceReactions(gameState.userRoast, aiResponse, userQuality, aiQuality);

      setGameState(prev => ({
        ...prev,
        userQuality,
        aiResponse,
        aiQuality,
        audienceReactions: reactions,
        isLoading: false
      }));
    } catch (error) {
      console.error('Error during roast battle:', error);
      setGameState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const handleNextRound = () => {
    const roundScore = calculateScore(gameState.userQuality, gameState.aiQuality);
    setGameState(prev => ({
      ...prev,
      totalScore: prev.totalScore + roundScore,
      battleRound: prev.battleRound + 1
    }));
    startNewRound();
  };

  const handleFinishBattle = async () => {
    setGameState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const finalScore = gameState.totalScore + calculateScore(gameState.userQuality, gameState.aiQuality);
      await updatePlayerScore(gameState.username, finalScore);
      
      setGameState(prev => ({
        ...prev,
        totalScore: finalScore,
        isLoading: false
      }));
      
      navigate('/leaderboard');
    } catch (error) {
      console.error('Error saving score:', error);
      setGameState(prev => ({ ...prev, isLoading: false }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-orange-800 to-yellow-700 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-2">🔥 ROAST BATTLE 🔥</h1>
          <div className="flex justify-center items-center gap-8 text-white">
            <div className="text-center">
              <p className="text-sm opacity-80">Player</p>
              <p className="text-2xl font-bold">{gameState.username}</p>
            </div>
            <div className="text-center">
              <p className="text-sm opacity-80">Total Score</p>
              <p className="text-2xl font-bold text-yellow-300">{gameState.totalScore}</p>
            </div>
            <div className="text-center">
              <p className="text-sm opacity-80">Round</p>
              <p className="text-2xl font-bold">{gameState.battleRound}</p>
            </div>
          </div>
        </div>

        {/* Battle Prompt */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">🎯 Round {gameState.battleRound} Challenge</h2>
          <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-r-xl text-gray-700 font-medium">{gameState.currentPrompt}</div>
          <label className="block mt-4">
            <span className="text-gray-700 font-semibold text-lg">🔥 Your Epic Roast:</span>
            <textarea
              value={gameState.userRoast}
              onChange={(e) => setUserRoast(e.target.value)}
              disabled={gameState.isLoading || !!gameState.aiResponse}
              className="w-full px-4 py-3 border-2 rounded-xl focus:ring-2 min-h-[120px]"
              maxLength={500}
            />
            <div className="flex justify-between mt-1">
              <p className="text-sm">{gameState.userRoast.length}/500</p>
              {gameState.userQuality > 0 && (
                <div className={`text-sm ${getQualityColor(gameState.userQuality)}`}>
                  Quality: {getQualityLabel(gameState.userQuality)}
                </div>
              )}
            </div>
          </label>
          {!gameState.aiResponse && (
            <button
              onClick={handleRoast}
              disabled={gameState.isLoading || !gameState.userRoast.trim()}
              className="mt-4 w-full bg-gradient-to-r from-red-500 to-orange-500 text-white py-4 rounded-xl"
            >
              {gameState.isLoading ? (
                <>
                  <Loader className="animate-spin mr-2" />
                  Cooking...
                </>
              ) : (
                <>🔥 ROAST!</>
              )}
            </button>
          )}
        </div>

        {/* AI Response */}
        {gameState.aiResponse && (
          <div className="bg-white rounded-2xl shadow-2xl p-8 mb-8">
            <h3 className="text-2xl font-bold text-center">🤖 AI Comeback</h3>
            <div className={`text-sm text-center ${getQualityColor(gameState.aiQuality)}`}>
              AI Quality: {getQualityLabel(gameState.aiQuality)}
            </div>
            <div className="bg-blue-50 p-6 rounded-xl mt-4 italic">"{gameState.aiResponse}"</div>
            <div className="flex justify-between mt-6">
              <div className="text-center">
                <p>Your Score</p>
                <p className={`text-2xl ${getQualityColor(gameState.userQuality)}`}>{gameState.userQuality}/10</p>
              </div>
              <p className="text-lg font-bold">VS</p>
              <div className="text-center">
                <p>AI Score</p>
                <p className={`text-2xl ${getQualityColor(gameState.aiQuality)}`}>{gameState.aiQuality}/10</p>
              </div>
            </div>
            <p className="text-center mt-4 text-green-600">
              Round Points: +{calculateScore(gameState.userQuality, gameState.aiQuality)}
            </p>
            <div className="flex gap-4 mt-6">
              <button
                onClick={handleNextRound}
                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white py-4 rounded-xl"
              >
                Next Round!
              </button>
              <button
                onClick={handleFinishBattle}
                disabled={gameState.isLoading}
                className="flex-1 bg-gradient-to-r from-green-500 to-teal-500 text-white py-4 rounded-xl"
              >
                {gameState.isLoading ? (
                  <>
                    <Loader className="animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  <>Finish Battle</>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Audience Reactions */}
        {gameState.audienceReactions.length > 0 && (
          <div className="bg-white rounded-2xl shadow-2xl p-6 mb-8">
            <h3 className="text-xl font-bold text-center">Audience Reactions 🎭</h3>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {gameState.audienceReactions.map((r) => (
                <div
                  key={r.id}
                  className={`p-3 rounded-lg ${
                    r.type === 'user' ? 'bg-red-50 border-red-400' : 'bg-blue-50 border-blue-400'
                  }`}
                >
                  <span>{r.emoji}</span> <p>{r.name}: {r.reaction}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BattlePage;