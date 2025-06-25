export const assessRoastQuality = (userRoast: string): number => {
  const roast = userRoast.toLowerCase();
  let score = 3; // Base score

  if (roast.length > 100) score += 2;
  else if (roast.length > 50) score += 1;

  const creativityWords = ['like', 'than', 'so', 'if', 'when', 'because', 'would', 'could'];
  const creativityCount = creativityWords.filter(word => roast.includes(word)).length;
  score += Math.min(creativityCount, 3);

  const humorWords = ['lol', 'haha', '😂', '🤣', '💀', 'dead', 'dying', 'killed'];
  if (humorWords.some(word => roast.includes(word))) score += 1;

  const roastWords = ['burn', 'fire', 'savage', 'destroyed', 'murdered', 'obliterated'];
  if (roastWords.some(word => roast.includes(word))) score += 1;

  return Math.min(score, 10);
};