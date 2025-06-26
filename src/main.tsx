import { Devvit, useState } from '@devvit/public-api';

// Configure the app
Devvit.configure({
  redditAPI: true,
  redis: true,
});

// Add menu action for moderators to install the app
Devvit.addMenuItem({
  label: 'Install Roast Royale',
  location: 'subreddit',
  forUserType: 'moderator',
  onPress: async (_event, context) => {
    const { reddit, ui } = context;
    ui.showToast('Roast Royale installed! Users can now start battles.');
  },
});

// Roast prompts
const ROAST_PROMPTS = [
  "Roast this annoying gym bro who never stops talking about protein shakes! 💪",
  "Roast someone who always says 'I'm not like other people' but is totally basic! 🙄", 
  "Roast that person who takes 50 selfies before posting one! 📸",
  "Roast someone who claims they're 'naturally funny' but tells the worst jokes! 😬",
  "Roast that friend who always shows up late but blames traffic! 🚗"
];

// AI Roast responses with quality scores
const AI_ROASTS = [
  { text: "Oh honey, that roast was so weak it couldn't melt an ice cube in the Sahara! 🔥❄️", quality: 9 },
  { text: "I've seen more fire in a broken lighter! Did you practice that comeback on your pet goldfish? 🐠💀", quality: 8 },
  { text: "That roast was so cold, penguins are using it as air conditioning! 🐧❄️", quality: 9 },
  { text: "Wow! With roasting skills like that, you could single-handedly end global warming! 🌍💨", quality: 8 },
  { text: "That comeback was weaker than my WiFi signal during a thunderstorm! ⚡📶", quality: 7 },
  { text: "Nice try! I've heard better comebacks from a broken GPS! 🗺️🤖", quality: 6 },
  { text: "That roast was so mild, it could be served at a kindergarten lunch! 🍼👶", quality: 5 },
  { text: "Ouch! That almost tickled... if I had feelings! 😴💤", quality: 6 },
  { text: "Is that your final answer? Because I've got all day and better material! ⏰📚", quality: 5 },
  { text: "That roast was colder than yesterday's pizza! 🍕❄️", quality: 4 },
];

// Audience reactions
const AUDIENCE_REACTIONS = {
  high: [
    "🔥🔥🔥 THAT WAS BRUTAL!",
    "💀 SOMEBODY CALL THE FIRE DEPARTMENT!",
    "😱 ABSOLUTELY SAVAGE!",
    "⚰️ RIP, YOU JUST GOT DESTROYED!",
    "🌶️🌶️ HOLY MOLY THAT WAS SPICY!"
  ],
  medium: [
    "👏 Ooh, that's a decent burn!",
    "😏 Not bad, not bad at all!",
    "🔥 That had some heat to it!",
    "👍 Pretty solid roast there!",
    "😄 I see what you did there!"
  ],
  low: [
    "😐 Eh, you can do better than that!",
    "🤔 That was... gentle?",
    "🔥 Come on, bring the heat!",
    "🥄 I've seen spicier mayo!",
    "😊 That tickled more than it burned!"
  ]
};

// Quality assessment function
function assessRoastQuality(roast: string): number {
  const text = roast.toLowerCase();
  let score = 3;
  
  if (text.length > 100) score += 2;
  else if (text.length > 50) score += 1;
  
  const creativityWords = ['like', 'than', 'so', 'if', 'when', 'because', 'would', 'could'];
  const creativityCount = creativityWords.filter(word => text.includes(word)).length;
  score += Math.min(creativityCount, 3);
  
  const humorWords = ['lol', 'haha', '😂', '🤣', '💀', 'dead', 'dying', 'killed'];
  if (humorWords.some(word => text.includes(word))) score += 1;
  
  const roastWords = ['burn', 'fire', 'savage', 'destroyed', 'murdered', 'obliterated'];
  if (roastWords.some(word => text.includes(word))) score += 1;
  
  return Math.min(score, 10);
}

// Calculate battle score
function calculateBattleScore(userQuality: number, aiQuality: number, round: number): number {
  let score = userQuality;
  if (userQuality > aiQuality) score += 5;
  else if (userQuality === aiQuality) score += 2;
  const roundMultiplier = 1 + (round - 1) * 0.2;
  return Math.max(1, Math.floor(score * roundMultiplier));
}

// Get roast title based on score
function getRoastTitle(score: number): string {
  if (score >= 200) return 'Roast Deity 🔥👑';
  if (score >= 150) return 'Inferno Master 🔥🔥🔥';
  if (score >= 100) return 'Roast Legend 🔥🔥';
  if (score >= 80) return 'Burn King 👑';
  if (score >= 60) return 'Sizzle Expert 🌶️';
  if (score >= 40) return 'Hot Mouth 🔥';
  if (score >= 20) return 'Roast Rookie 🚀';
  return 'Newbie Toaster 🍞';
}

// Main app component
Devvit.addCustomPostType({
  name: 'Roast Royale',
  height: 'tall',
  render: (context) => {
    const { useState, redis, ui } = context;
    
    // Game state
    const [gameState, setGameState] = useState('home'); // 'home', 'battle', 'leaderboard'
    const [username, setUsername] = useState('');
    const [currentPrompt, setCurrentPrompt] = useState('');
    const [userRoast, setUserRoast] = useState('');
    const [aiResponse, setAiResponse] = useState('');
    const [currentScore, setCurrentScore] = useState(0);
    const [battleRound, setBattleRound] = useState(1);
    const [userQuality, setUserQuality] = useState(0);
    const [aiQuality, setAiQuality] = useState(0);
    const [audienceReactions, setAudienceReactions] = useState<string[]>([]);
    const [leaderboard, setLeaderboard] = useState<Array<{username: string, score: number}>>([]);
    const [showBattleResult, setShowBattleResult] = useState(false);

    // Load leaderboard
    const loadLeaderboard = async () => {
      try {
        const keys = await redis.zRange('roast_leaderboard', 0, 9, { reverse: true, withScores: true });
        const board = [];
        for (let i = 0; i < keys.length; i += 2) {
          board.push({ username: keys[i], score: keys[i + 1] });
        }
        setLeaderboard(board);
      } catch (error) {
        console.error('Error loading leaderboard:', error);
      }
    };

    // Start battle
    const startBattle = () => {
      if (!username.trim()) {
        ui.showToast('Please enter a username!');
        return;
      }
      const randomPrompt = ROAST_PROMPTS[Math.floor(Math.random() * ROAST_PROMPTS.length)];
      setCurrentPrompt(randomPrompt);
      setGameState('battle');
      setBattleRound(1);
      setCurrentScore(0);
      setShowBattleResult(false);
    };

    // Submit roast
    const submitRoast = async () => {
      if (!userRoast.trim()) {
        ui.showToast('Please enter your roast!');
        return;
      }

      // Assess user roast quality
      const userQ = assessRoastQuality(userRoast);
      setUserQuality(userQ);

      // Generate AI response
      const aiRoast = AI_ROASTS[Math.floor(Math.random() * AI_ROASTS.length)];
      setAiResponse(aiRoast.text);
      setAiQuality(aiRoast.quality);

      // Generate audience reactions
      const userReactionLevel = userQ >= 7 ? 'high' : userQ >= 4 ? 'medium' : 'low';
      const aiReactionLevel = aiRoast.quality >= 7 ? 'high' : aiRoast.quality >= 4 ? 'medium' : 'low';
      
      const reactions = [
        `👤 ${AUDIENCE_REACTIONS[userReactionLevel][Math.floor(Math.random() * AUDIENCE_REACTIONS[userReactionLevel].length)]}`,
        `🤖 ${AUDIENCE_REACTIONS[aiReactionLevel][Math.floor(Math.random() * AUDIENCE_REACTIONS[aiReactionLevel].length)]}`
      ];
      setAudienceReactions(reactions);

      setShowBattleResult(true);
    };

    // Next round
    const nextRound = () => {
      const roundScore = calculateBattleScore(userQuality, aiQuality, battleRound);
      setCurrentScore(currentScore + roundScore);
      setBattleRound(battleRound + 1);
      
      const randomPrompt = ROAST_PROMPTS[Math.floor(Math.random() * ROAST_PROMPTS.length)];
      setCurrentPrompt(randomPrompt);
      setUserRoast('');
      setAiResponse('');
      setUserQuality(0);
      setAiQuality(0);
      setAudienceReactions([]);
      setShowBattleResult(false);
    };

    // Finish battle
    const finishBattle = async () => {
      const roundScore = calculateBattleScore(userQuality, aiQuality, battleRound);
      const finalScore = currentScore + roundScore;
      
      try {
        // Update leaderboard in Redis
        await redis.zAdd('roast_leaderboard', { member: username, score: finalScore });
        setCurrentScore(finalScore);
        await loadLeaderboard();
        setGameState('leaderboard');
      } catch (error) {
        console.error('Error updating leaderboard:', error);
        ui.showToast('Error saving score!');
      }
    };

    // Home Page
    if (gameState === 'home') {
      return (
        <vstack height="100%" padding="large" alignment="center middle" gap="medium">
          <text size="xxlarge" weight="bold" color="red">🔥 ROAST ROYALE 🔥</text>
          <text size="large" color="neutral-content-weak">The Ultimate AI Roast Battle!</text>
          
          <vstack gap="medium" width="100%" maxWidth="400px">
            <text size="medium" weight="bold">Enter Your Username:</text>
            <textField
              placeholder="Your roasting name..."
              value={username}
              onTextChange={setUsername}
            />
            <button size="large" appearance="primary" onPress={startBattle}>
              🔥 Start Roast Battle! 🔥
            </button>
          </vstack>

          <vstack gap="small" width="100%" maxWidth="400px">
            <text size="medium" weight="bold">🏆 Top Roasters</text>
            <button appearance="secondary" onPress={() => { loadLeaderboard(); setGameState('leaderboard'); }}>
              View Leaderboard
            </button>
          </vstack>
        </vstack>
      );
    }

    // Battle Page
    if (gameState === 'battle') {
      return (
        <vstack height="100%" padding="large" gap="medium">
          <hstack alignment="center middle" gap="medium">
            <text size="large" weight="bold">🔥 Battle Arena 🔥</text>
          </hstack>
          
          <hstack alignment="space-between">
            <text size="medium" weight="bold">{username}</text>
            <text size="medium" weight="bold">Round {battleRound}</text>
            <text size="medium" weight="bold" color="green">Score: {currentScore}</text>
          </hstack>

          <vstack gap="medium" padding="medium" backgroundColor="neutral-background-weak" cornerRadius="medium">
            <text size="medium" weight="bold">🎯 Challenge:</text>
            <text size="medium">{currentPrompt}</text>
          </vstack>

          {!showBattleResult && (
            <vstack gap="medium">
              <text size="medium" weight="bold">🔥 Your Epic Roast:</text>
              <textField
                placeholder="Type your roast here..."
                value={userRoast}
                onTextChange={setUserRoast}
                multiline
              />
              <button size="large" appearance="primary" onPress={submitRoast}>
                🔥 ROAST! 🔥
              </button>
            </vstack>
          )}

          {showBattleResult && (
            <vstack gap="medium">
              <vstack gap="small" padding="medium" backgroundColor="blue-background-weak" cornerRadius="medium">
                <text size="medium" weight="bold">🤖 AI Comeback:</text>
                <text size="medium">"{aiResponse}"</text>
              </vstack>

              <hstack alignment="space-between">
                <vstack alignment="center">
                  <text size="small">Your Score</text>
                  <text size="large" weight="bold" color="red">{userQuality}/10</text>
                </vstack>
                <text size="large" weight="bold">VS</text>
                <vstack alignment="center">
                  <text size="small">AI Score</text>
                  <text size="large" weight="bold" color="blue">{aiQuality}/10</text>
                </vstack>
              </hstack>

              <text size="medium" weight="bold" color="green">
                Round Points: +{calculateBattleScore(userQuality, aiQuality, battleRound)}
              </text>

              {audienceReactions.length > 0 && (
                <vstack gap="small" padding="medium" backgroundColor="neutral-background-weak" cornerRadius="medium">
                  <text size="medium" weight="bold">🎭 Audience Reactions:</text>
                  {audienceReactions.map((reaction, index) => (
                    <text key={index} size="small">{reaction}</text>
                  ))}
                </vstack>
              )}

              <hstack gap="medium">
                <button appearance="primary" onPress={nextRound}>
                  Next Round!
                </button>
                <button appearance="secondary" onPress={finishBattle}>
                  Finish Battle
                </button>
              </hstack>
            </vstack>
          )}

          <button appearance="plain" onPress={() => setGameState('home')}>
            ← Back to Home
          </button>
        </vstack>
      );
    }

    // Leaderboard Page
    if (gameState === 'leaderboard') {
      return (
        <vstack height="100%" padding="large" gap="medium">
          <text size="xxlarge" weight="bold" color="gold">🏆 LEADERBOARD 🏆</text>
          <text size="large">Hall of Fame - Top Roast Masters!</text>

          {currentScore > 0 && (
            <vstack gap="small" padding="medium" backgroundColor="blue-background-weak" cornerRadius="medium">
              <text size="medium" weight="bold">Your Final Stats:</text>
              <hstack alignment="space-between">
                <text size="medium">{username}</text>
                <text size="medium" weight="bold" color="blue">{currentScore} points</text>
              </hstack>
              <text size="small" color="neutral-content-weak">{getRoastTitle(currentScore)}</text>
            </vstack>
          )}

          <vstack gap="small" width="100%">
            <text size="large" weight="bold">🏆 Top Roasters</text>
            {leaderboard.length === 0 ? (
              <text size="medium" color="neutral-content-weak">No players yet! Be the first!</text>
            ) : (
              leaderboard.map((player, index) => (
                <hstack key={index} alignment="space-between" padding="medium" backgroundColor="neutral-background-weak" cornerRadius="medium">
                  <hstack gap="medium">
                    <text size="medium" weight="bold">#{index + 1}</text>
                    <vstack>
                      <text size="medium" weight="bold">{player.username}</text>
                      <text size="small" color="neutral-content-weak">{getRoastTitle(player.score)}</text>
                    </vstack>
                  </hstack>
                  <text size="large" weight="bold" color="red">{player.score}</text>
                </hstack>
              ))
            )}
          </vstack>

          <hstack gap="medium">
            <button appearance="primary" onPress={() => {
              setGameState('home');
              setCurrentScore(0);
              setBattleRound(1);
              setUserRoast('');
              setAiResponse('');
              setShowBattleResult(false);
            }}>
              🔥 Play Again! 🔥
            </button>
            <button appearance="secondary" onPress={() => setGameState('home')}>
              Home
            </button>
          </hstack>
        </vstack>
      );
    }

    return <text>Loading...</text>;
  },
});

export default Devvit;