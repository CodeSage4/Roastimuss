// Enhanced AI roast generator with quality scoring
const roastResponses = [
  // Savage roasts (high quality)
  {
    text: "Oh honey, that roast was so weak it couldn't melt an ice cube in the Sahara! 🔥❄️",
    quality: 9
  },
  {
    text: "I've seen more fire in a broken lighter! Did you practice that comeback on your pet goldfish? 🐠💀",
    quality: 8
  },
  {
    text: "That roast was so cold, penguins are using it as air conditioning! 🐧❄️",
    quality: 9
  },
  {
    text: "Wow! With roasting skills like that, you could single-handedly end global warming! 🌍💨",
    quality: 8
  },
  {
    text: "That comeback was weaker than my WiFi signal during a thunderstorm! ⚡📶",
    quality: 7
  },
  
  // Medium roasts
  {
    text: "Nice try! I've heard better comebacks from a broken GPS! 🗺️🤖",
    quality: 6
  },
  {
    text: "That roast was so mild, it could be served at a kindergarten lunch! 🍼👶",
    quality: 5
  },
  {
    text: "Ouch! That almost tickled... if I had feelings! 😴💤",
    quality: 6
  },
  {
    text: "Is that your final answer? Because I've got all day and better material! ⏰📚",
    quality: 5
  },
  {
    text: "That roast was colder than yesterday's pizza! 🍕❄️",
    quality: 4
  },
  
  // Weak roasts (low quality)
  {
    text: "Aww, that's cute! Did you learn that from a Disney movie? 🏰✨",
    quality: 3
  },
  {
    text: "Your roast game is like a broken pencil... pointless! ✏️💔",
    quality: 4
  },
  {
    text: "That was adorable! My calculator has better comebacks! 🧮😊",
    quality: 3
  },
  {
    text: "I've been more burned by room temperature water! 💧😐",
    quality: 2
  },
  {
    text: "That roast was so gentle, it could be a lullaby! 🎵😴",
    quality: 2
  }
];

// Quality assessment for user roasts
export const assessRoastQuality = (userRoast: string): number => {
  const roast = userRoast.toLowerCase();
  let score = 3; // Base score
  
  // Length bonus (longer roasts often show more effort)
  if (roast.length > 100) score += 2;
  else if (roast.length > 50) score += 1;
  
  // Creativity indicators
  const creativityWords = ['like', 'than', 'so', 'if', 'when', 'because', 'would', 'could'];
  const creativityCount = creativityWords.filter(word => roast.includes(word)).length;
  score += Math.min(creativityCount, 3);
  
  // Humor indicators
  const humorWords = ['lol', 'haha', '😂', '🤣', '💀', 'dead', 'dying', 'killed'];
  if (humorWords.some(word => roast.includes(word))) score += 1;
  
  // Roast-specific words
  const roastWords = ['burn', 'fire', 'savage', 'destroyed', 'murdered', 'obliterated'];
  if (roastWords.some(word => roast.includes(word))) score += 1;
  
  // Cap at 10
  return Math.min(score, 10);
};

export const generateAIRoast = async (userRoast: string, prompt: string): Promise<{text: string, quality: number}> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
  
  // Get user roast quality to influence AI response quality
  const userQuality = assessRoastQuality(userRoast);
  
  // Filter responses based on user quality (AI responds with similar or higher quality)
  const suitableResponses = roastResponses.filter(response => 
    response.quality >= Math.max(1, userQuality - 2)
  );
  
  const randomIndex = Math.floor(Math.random() * suitableResponses.length);
  return suitableResponses[randomIndex];
};