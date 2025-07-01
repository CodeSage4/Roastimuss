import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Flame, Send, ArrowRight, Loader, Users, Trophy } from 'lucide-react';
import { getRandomPrompt } from '../lib/gameData';
//import { generateAIRoast, assessRoastQuality } from '../lib/ai';
import { assessRoastQuality } from "../lib/assessRoastQuality";
import { generateAIRoast } from '../lib/generateAIRoast';
import { generateAudienceReactions } from '../lib/audience';
import { supabase } from '../lib/supabase'; // Assuming correct import
import { useGame } from '../contexts/GameContext';

const BattlePage: React.FC = () => {
  const navigate = useNavigate();
  const {
    gameState,
    setCurrentPrompt,
    setUserRoast,
    setAiResponse,
    setIsLoading,
    setCurrentScore,
    setBattleRound,
    setUserQuality,
    setAiQuality,
    addAudienceReactions,
    setAudienceReactions,
    setTotalBattles
  } = useGame();

  useEffect(() => {
    if (!gameState.username) navigate('/');
    if (!gameState.currentPrompt) setCurrentPrompt(getRandomPrompt());
  }, [gameState.username, gameState.currentPrompt, navigate, setCurrentPrompt]);

  const calculateScore = (userQuality: number, aiQuality: number): number => {
    let score = userQuality;
    if (userQuality > aiQuality) score += 5;
    else if (userQuality === aiQuality) score += 2;
    const roundMultiplier = 1 + (gameState.battleRound - 1) * 0.2;
    return Math.max(1, Math.floor(score * roundMultiplier));
  };

  const handleRoast = async () => {
    if (!gameState.userRoast.trim()) return alert('Please enter your roast first!');
    setIsLoading(true);
    try {
      const userQuality = assessRoastQuality(gameState.userRoast);
      setUserQuality(userQuality);
      addAudienceReactions(generateAudienceReactions(userQuality, 'user'));
      const aiResponse = await generateAIRoast(gameState.userRoast, gameState.currentPrompt);
      setAiResponse(aiResponse.text);
      setAiQuality(aiResponse.quality);
      setTimeout(() => addAudienceReactions(generateAudienceReactions(aiResponse.quality, 'ai')), 1500);
    } catch (error) {
      console.error('AI roast error:', error);
      setAiResponse("Oops! AI messed up.");
      setAiQuality(1);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNextRound = () => {
    const roundScore = calculateScore(gameState.userQuality, gameState.aiQuality);
    setCurrentScore(gameState.currentScore + roundScore);
    setBattleRound(gameState.battleRound + 1);
    setCurrentPrompt(getRandomPrompt());
    setUserRoast('');
    setAiResponse('');
    setUserQuality(0);
    setAiQuality(0);
    setAudienceReactions([]);
  };

 const handleFinishBattle = async () => {
  setIsLoading(true);
  try {
    const roundScore = calculateScore(gameState.userQuality, gameState.aiQuality);
    const totalLocalScore = gameState.currentScore + roundScore;

    // Fetch existing player
    let { data: existingPlayer, error: fetchError } = await supabase
      .from('players')
      .select('roast_score, total_battles')
      .eq('username', gameState.username)
      .maybeSingle();

    if (fetchError) throw fetchError;

    // If player does NOT exist, insert them first
    if (!existingPlayer) {
      const { error: insertError } = await supabase
        .from('players')
        .insert([{ username: gameState.username, roast_score: 0, total_battles: 0 }]);

      if (insertError) throw insertError;

      // Set default values after insert
      existingPlayer = { roast_score: 0, total_battles: 0 };
    }

    const existingScore = existingPlayer.roast_score;
    const existingBattles = existingPlayer.total_battles;
    const newTotalScore = existingScore + totalLocalScore;

    // Update the player's score
    const { data: updatedPlayer, error: updateError } = await supabase
      .from('players')
      .update({
        roast_score: newTotalScore,
        total_battles: existingBattles + 1
      })
      .eq('username', gameState.username)
      .select()
      .maybeSingle();

    if (updateError) throw updateError;

    if (updatedPlayer) setCurrentScore(updatedPlayer.roast_score);

    navigate('/leaderboard');
  } catch (error) {
    console.error('Error updating score:', error);
  } finally {
    setIsLoading(false);
  }
};


  const getQualityColor = (q: number) => q >= 8 ? 'text-red-600 font-bold' : q >= 6 ? 'text-orange-600 font-semibold' : q >= 4 ? 'text-yellow-600' : 'text-gray-600';
  const getQualityLabel = (q: number) => q >= 9 ? 'LEGENDARY 🔥🔥🔥' : q >= 8 ? 'SAVAGE 🔥🔥' : q >= 6 ? 'SPICY 🔥' : q >= 4 ? 'WARM 🌶️' : q >= 2 ? 'MILD 😐' : 'COLD ❄️';

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-red-500 to-orange-500 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 pt-8">
          <div className="flex items-center justify-center mb-4">
            <Flame className="text-white w-10 h-10 mr-2" />
            <h1 className="text-4xl font-bold text-white">Battle Arena</h1>
            <Flame className="text-white w-10 h-10 ml-2" />
          </div>
          <div className="flex items-center justify-center space-x-6 text-white">
            <div className="text-center">
              <p className="text-2xl font-bold">{gameState.username}</p>
              <p className="text-sm opacity-90">Round {gameState.battleRound}</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-300">{gameState.currentScore}</p>
              <p className="text-sm opacity-90">Total Score</p>
            </div>
          </div>
        </div>

        {/* Battle Prompt */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">🎯 Round {gameState.battleRound} Challenge</h2>
          <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-r-xl text-gray-700 font-medium">{gameState.currentPrompt}</div>
          <label className="block mt-4">
            <span className="text-gray-700 font-semibold text-lg">🔥 Your Epic Roast:</span>
            <textarea value={gameState.userRoast} onChange={(e) => setUserRoast(e.target.value)} disabled={gameState.isLoading || !!gameState.aiResponse} className="w-full px-4 py-3 border-2 rounded-xl focus:ring-2 min-h-[120px]" maxLength={500} />
            <div className="flex justify-between mt-1">
              <p className="text-sm">{gameState.userRoast.length}/500</p>
              {gameState.userQuality > 0 && <div className={text-sm ${getQualityColor(gameState.userQuality)}}>Quality: {getQualityLabel(gameState.userQuality)}</div>}
            </div>
          </label>
          {!gameState.aiResponse && <button onClick={handleRoast} disabled={gameState.isLoading || !gameState.userRoast.trim()} className="mt-4 w-full bg-gradient-to-r from-red-500 to-orange-500 text-white py-4 rounded-xl">{gameState.isLoading ? <><Loader className="animate-spin mr-2" />Cooking...</> : <>🔥 ROAST!</>}</button>}
        </div>

        {/* AI Response */}
        {gameState.aiResponse && (
          <div className="bg-white rounded-2xl shadow-2xl p-8 mb-8">
            <h3 className="text-2xl font-bold text-center">🤖 AI Comeback</h3>
            <div className={text-sm text-center ${getQualityColor(gameState.aiQuality)}}>AI Quality: {getQualityLabel(gameState.aiQuality)}</div>
            <div className="bg-blue-50 p-6 rounded-xl mt-4 italic">"{gameState.aiResponse}"</div>
            <div className="flex justify-between mt-6">
              <div className="text-center"><p>Your Score</p><p className={text-2xl ${getQualityColor(gameState.userQuality)}}>{gameState.userQuality}/10</p></div>
              <p className="text-lg font-bold">VS</p>
              <div className="text-center"><p>AI Score</p><p className={text-2xl ${getQualityColor(gameState.aiQuality)}}>{gameState.aiQuality}/10</p></div>
            </div>
            <p className="text-center mt-4 text-green-600">Round Points: +{calculateScore(gameState.userQuality, gameState.aiQuality)}</p>
            <div className="flex gap-4 mt-6">
              <button onClick={handleNextRound} className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white py-4 rounded-xl">Next Round!</button>
              <button onClick={handleFinishBattle} disabled={gameState.isLoading} className="flex-1 bg-gradient-to-r from-green-500 to-teal-500 text-white py-4 rounded-xl">{gameState.isLoading ? <><Loader className="animate-spin mr-2" />Saving...</> : <>Finish Battle</>}</button>
            </div>
          </div>
        )}

        {/* Audience Reactions */}
        {gameState.audienceReactions.length > 0 && (
          <div className="bg-white rounded-2xl shadow-2xl p-6 mb-8">
            <h3 className="text-xl font-bold text-center">Audience Reactions 🎭</h3>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {gameState.audienceReactions.map(r => (
                <div key={r.id} className={p-3 rounded-lg ${r.type === 'user' ? 'bg-red-50 border-red-400' : 'bg-blue-50 border-blue-400'}}> <span>{r.emoji}</span> <p>{r.name}: {r.reaction}</p></div>
              ))}
            </div>
          </div>
        )}

        <div className="text-center">
          <button onClick={() => navigate('/')} className="text-white underline">← Back to Home</button>
        </div>
      </div>
    </div>
  );
};

export default BattlePage;