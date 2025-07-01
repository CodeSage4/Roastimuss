import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Flame, Send, ArrowRight, Loader, Users, Trophy } from 'lucide-react';
import { getRandomPrompt } from '../lib/gameData';
import { assessRoastQuality } from "../lib/assessRoastQuality";
import { generateAIRoast } from '../lib/generateAIRoast';
import { generateAudienceReactions } from '../lib/audience';
import { supabase } from '../lib/supabase';
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
    setUsedPromptIndices,
    setTotalBattles
  } = useGame();

  useEffect(() => {
    if (!gameState.username) navigate('/');
    if (!gameState.currentPrompt) {
      const { prompt, index } = getRandomPrompt(gameState.usedPromptIndices);
      setCurrentPrompt(prompt);
      setUsedPromptIndices([...gameState.usedPromptIndices, index]);
    }
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
    const { prompt, index } = getRandomPrompt(gameState.usedPromptIndices);
    setCurrentPrompt(prompt);
    setUsedPromptIndices([...gameState.usedPromptIndices, index]);
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

      let { data: existingPlayer, error: fetchError } = await supabase
        .from('players')
        .select('roast_score, total_battles')
        .eq('username', gameState.username)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (!existingPlayer) {
        const { error: insertError } = await supabase
          .from('players')
          .insert([{ username: gameState.username, roast_score: 0, total_battles: 0 }]);

        if (insertError) throw insertError;
        existingPlayer = { roast_score: 0, total_battles: 0 };
      }

      const existingScore = existingPlayer.roast_score;
      const existingBattles = existingPlayer.total_battles;
      const newTotalScore = existingScore + totalLocalScore;

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
    // ... unchanged JSX ...
  );
};

export default BattlePage;
