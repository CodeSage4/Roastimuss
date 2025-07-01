import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Player {
  id: string;
  username: string;
  roast_score: number;
  total_battles: number;
  created_at: string;
  updated_at: string;
}

export const getTopPlayers = async (limit: number = 10): Promise<Player[]> => {
  const { data, error } = await supabase
    .from('players')
    .select('*')
    .order('roast_score', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching players:', error);
    return [];
  }

  return data || [];
};

export const updatePlayerScore = async (username: string, scoreIncrease: number = 10): Promise<Player | null> => {
  // First, try to get existing player
  const { data: existingPlayer } = await supabase
    .from('players')
    .select('*')
    .eq('username', username)
    .maybeSingle();

  if (existingPlayer) {
    // Update existing player
    const { data, error } = await supabase
      .from('players')
      .update({ 
        roast_score: existingPlayer.roast_score + scoreIncrease,
        total_battles: existingPlayer.total_battles + 1,
        updated_at: new Date().toISOString()
      })
      .eq('username', username)
      .select()
      .maybeSingle();

    if (error) {
      console.error('Error updating player:', error);
      return null;
    }

    return data;
  } else {
    // Create new player
    const { data, error } = await supabase
      .from('players')
      .insert({ 
        username,
        roast_score: scoreIncrease,
        total_battles: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .maybeSingle();

    if (error) {
      console.error('Error creating player:', error);
      return null;
    }

    return data;
  }
};

export const getRoastTitle = (score: number): string => {
  if (score >= 200) return 'Roast Deity 🔥👑';
  if (score >= 150) return 'Inferno Master 🔥🔥🔥';
  if (score >= 100) return 'Roast Legend 🔥🔥';
  if (score >= 80) return 'Burn King 👑';
  if (score >= 60) return 'Sizzle Expert 🌶️';
  if (score >= 40) return 'Hot Mouth 🔥';
  if (score >= 20) return 'Roast Rookie 🚀';
  return 'Newbie Toaster 🍞';
};