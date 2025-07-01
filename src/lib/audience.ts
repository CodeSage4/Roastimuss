// Audience bot reactions system
export interface AudienceReaction {
  id: string;
  name: string;
  reaction: string;
  emoji: string;
  type: 'user' | 'ai';
}

const audienceBots = [
  'RoastMaster2000', 'BurnQueen', 'SavageBot', 'FireStarter', 'ComebackKing',
  'RoastGod', 'BurnVictim', 'SizzleExpert', 'FlameWarrior', 'ToastMaster',
  'HeatSeeker', 'BlazeBoss', 'ScorchLord', 'InfernoFan', 'CrispyCritic'
];

const userRoastReactions = {
  high: [
    { reaction: "YOOO THAT WAS BRUTAL! 🔥🔥🔥", emoji: "🔥" },
    { reaction: "SOMEBODY CALL THE FIRE DEPARTMENT! 🚒", emoji: "💀" },
    { reaction: "THAT WAS ABSOLUTELY SAVAGE! 😱", emoji: "😱" },
    { reaction: "RIP AI, you just got DESTROYED! ⚰️", emoji: "⚰️" },
    { reaction: "HOLY MOLY THAT WAS SPICY! 🌶️🌶️", emoji: "🌶️" },
    { reaction: "I FELT THAT FROM HERE! 💥", emoji: "💥" },
    { reaction: "SOMEONE STOP THE FIGHT! 🛑", emoji: "🛑" }
  ],
  medium: [
    { reaction: "Ooh, that's a decent burn! 👏", emoji: "👏" },
    { reaction: "Not bad, not bad at all! 😏", emoji: "😏" },
    { reaction: "That had some heat to it! 🔥", emoji: "🔥" },
    { reaction: "Pretty solid roast there! 👍", emoji: "👍" },
    { reaction: "I see what you did there! 😄", emoji: "😄" },
    { reaction: "That's gonna leave a mark! 😬", emoji: "😬" }
  ],
  low: [
    { reaction: "Eh, you can do better than that! 😐", emoji: "😐" },
    { reaction: "That was... gentle? 🤔", emoji: "🤔" },
    { reaction: "Come on, bring the heat! 🔥", emoji: "🔥" },
    { reaction: "I've seen spicier mayo! 🥄", emoji: "🥄" },
    { reaction: "That tickled more than it burned! 😊", emoji: "😊" },
    { reaction: "Room temperature roast! 🌡️", emoji: "🌡️" }
  ]
};

const aiRoastReactions = {
  high: [
    { reaction: "OH NO THE AI IS LEARNING! 🤖💀", emoji: "🤖" },
    { reaction: "SKYNET IS ROASTING US NOW! 😨", emoji: "😨" },
    { reaction: "THE MACHINES ARE TOO POWERFUL! ⚡", emoji: "⚡" },
    { reaction: "AI JUST ENDED THIS PERSON'S CAREER! 💼", emoji: "💼" },
    { reaction: "BEEP BOOP DESTRUCTION MODE! 🔥🤖", emoji: "🔥" },
    { reaction: "ERROR 404: MERCY NOT FOUND! 💻", emoji: "💻" }
  ],
  medium: [
    { reaction: "The AI's getting good at this! 🤖", emoji: "🤖" },
    { reaction: "Not bad for a robot! 👾", emoji: "👾" },
    { reaction: "AI comeback was solid! 💪", emoji: "💪" },
    { reaction: "The future is now! 🚀", emoji: "🚀" },
    { reaction: "Decent burn from our robot friend! 🔥", emoji: "🔥" }
  ],
  low: [
    { reaction: "AI needs more training! 📚", emoji: "📚" },
    { reaction: "That was very... polite? 🤖😊", emoji: "😊" },
    { reaction: "Come on AI, step it up! ⬆️", emoji: "⬆️" },
    { reaction: "The robot is being too nice! 🤗", emoji: "🤗" },
    { reaction: "AI.exe has stopped working! 💻", emoji: "💻" }
  ]
};

export const generateAudienceReactions = (quality: number, type: 'user' | 'ai'): AudienceReaction[] => {
  const reactions: AudienceReaction[] = [];
  const numReactions = Math.floor(Math.random() * 3) + 2; // 2-4 reactions

  let reactionPool;
  if (type === 'user') {
    if (quality >= 7) reactionPool = [...userRoastReactions.high];
    else if (quality >= 4) reactionPool = [...userRoastReactions.medium];
    else reactionPool = [...userRoastReactions.low];
  } else {
    if (quality >= 7) reactionPool = [...aiRoastReactions.high];
    else if (quality >= 4) reactionPool = [...aiRoastReactions.medium];
    else reactionPool = [...aiRoastReactions.low];
  }

  const usedBots = new Set<string>();
  const usedReactions = new Set<string>();

  for (let i = 0; i < numReactions && reactionPool.length > 0; i++) {
    let botName;
    do {
      botName = audienceBots[Math.floor(Math.random() * audienceBots.length)];
    } while (usedBots.has(botName) && usedBots.size < audienceBots.length);
    usedBots.add(botName);

    // pick a unique reaction
    let reactionIndex;
    do {
      reactionIndex = Math.floor(Math.random() * reactionPool.length);
    } while (usedReactions.has(reactionPool[reactionIndex]?.reaction) && usedReactions.size < reactionPool.length);

    const reactionData = reactionPool.splice(reactionIndex, 1)[0];
    usedReactions.add(reactionData.reaction);

    reactions.push({
      id: `${botName}-${Date.now()}-${i}`,
      name: botName,
      reaction: reactionData.reaction,
      emoji: reactionData.emoji,
      type
    });
  }

  return reactions;
};
