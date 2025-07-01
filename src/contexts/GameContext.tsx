import React, { createContext, useContext, useState, ReactNode } from 'react';
import { AudienceReaction } from '../lib/audience';

interface GameState {
  username: string;
  currentScore: number;
  totalScore: number;
  currentPrompt: string;
  userRoast: string;
  aiResponse: string;
  isLoading: boolean;
  battleRound: number;
  userQuality: number;
  aiQuality: number;
  audienceReactions: AudienceReaction[];
  totalBattles: number;
  usedPromptIndices: number[];
}

interface GameContextType {
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
  setUsername: (username: string) => void;
  setCurrentScore: (score: number) => void;
  setCurrentPrompt: (prompt: string) => void;
  setUserRoast: (roast: string) => void;
  setAiResponse: (response: string) => void;
  setIsLoading: (loading: boolean) => void;
  setBattleRound: (round: number) => void;
  setUserQuality: (quality: number) => void;
  setAiQuality: (quality: number) => void;
  setAudienceReactions: (reactions: AudienceReaction[]) => void;
  addAudienceReactions: (reactions: AudienceReaction[]) => void;
  setTotalBattles: (battles: number) => void;
  resetBattle: () => void;
  resetGame: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

const initialGameState: GameState = {
  username: '',
  currentScore: 0,
  totalScore: 0,
  currentPrompt: '',
  userRoast: '',
  aiResponse: '',
  isLoading: false,
  battleRound: 1,
  userQuality: 0,
  aiQuality: 0,
  audienceReactions: [],
  totalBattles: 0,
  usedPromptIndices: [],
};

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [gameState, setGameState] = useState<GameState>(initialGameState);

  const setUsername = (username: string) => {
    setGameState(prev => ({ ...prev, username }));
  };

  const setCurrentScore = (currentScore: number) => {
    setGameState(prev => ({ ...prev, currentScore }));
  };

  const setCurrentPrompt = (currentPrompt: string) => {
    setGameState(prev => ({ ...prev, currentPrompt }));
  };

  const setUserRoast = (userRoast: string) => {
    setGameState(prev => ({ ...prev, userRoast }));
  };

  const setAiResponse = (aiResponse: string) => {
    setGameState(prev => ({ ...prev, aiResponse }));
  };

  const setIsLoading = (isLoading: boolean) => {
    setGameState(prev => ({ ...prev, isLoading }));
  };

  const setBattleRound = (battleRound: number) => {
    setGameState(prev => ({ ...prev, battleRound }));
  };

  const setUserQuality = (userQuality: number) => {
    setGameState(prev => ({ ...prev, userQuality }));
  };

  const setAiQuality = (aiQuality: number) => {
    setGameState(prev => ({ ...prev, aiQuality }));
  };

  const setAudienceReactions = (audienceReactions: AudienceReaction[]) => {
    setGameState(prev => ({ ...prev, audienceReactions }));
  };

  const addAudienceReactions = (reactions: AudienceReaction[]) => {
    setGameState(prev => ({ 
      ...prev, 
      audienceReactions: [...prev.audienceReactions, ...reactions] 
    }));
  };

  const setTotalBattles = (totalBattles: number) => {
    setGameState(prev => ({ ...prev, totalBattles }));
  };

  const resetBattle = () => {
    setGameState(prev => ({ 
      ...prev,
      currentPrompt: '',
      userRoast: '',
      aiResponse: '',
      userQuality: 0,
      aiQuality: 0,
      audienceReactions: [],
      battleRound: 1,
      usedPromptIndices: []
    }));
  };

  const resetGame = () => {
    setGameState(prev => ({ 
      ...initialGameState, 
      username: prev.username,
      currentScore: prev.currentScore,
      totalBattles: prev.totalBattles
    }));
  };

  return (
    <GameContext.Provider
      value={{
        gameState,
        setGameState,
        setUsername,
        setCurrentScore,
        setCurrentPrompt,
        setUserRoast,
        setAiResponse,
        setIsLoading,
        setBattleRound,
        setUserQuality,
        setAiQuality,
        setAudienceReactions,
        addAudienceReactions,
        setTotalBattles,
        resetBattle,
        resetGame,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};