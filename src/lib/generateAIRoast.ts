import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GOOGLE_AI_API_KEY);

// Quality assessment for user roasts
export const assessRoastQuality = (userRoast: string): number => {
  const roast = userRoast.toLowerCase();
  let score = 3; // Base score

  // Length bonus
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

  return Math.min(score, 10);
};

export const generateAIRoast = async (
  userRoast: string,
  prompt: string
): Promise<{ text: string; quality: number }> => {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const inputPrompt = `
You are a sarcastic and savage AI roast master in a high-stakes comedy battle.

Your goal is to obliterate the human's roast with a witty, biting, and contextually relevant comeback — *only* if their roast makes sense within the current battle theme.

Do NOT:
- Respond with generic, boring, or recycled comebacks.
- Give yourself a high burn rating unless the comeback truly deserves it.
- Reward weak AI roasts with high scores.
- Go off-topic or throw random words together.

Your roast must:
- Directly respond to the human’s roast.
- Stay on theme.
- Show creativity, sarcasm, and personality.
- Be max 2 punchy lines.

Evaluate your own roast honestly. If your joke was mid, rate it like it was mid.

Input:
{
  "human_roast": "${userRoast}",
  "battle_theme": "${prompt}"
}

Output format (no markdown, no extra text):

{
  "text": "<Your AI comeback roast here>",
  "quality": <Burn score from 1 to 10, be honest>
}


`;

  try {
    const result = await model.generateContent(inputPrompt);
    let responseText = await result.response.text();

    console.log("Gemini raw output:", responseText);

    // Remove Markdown/backticks if present
    responseText = responseText
      .replace(/```json\s*/g, "")
      .replace(/```/g, "")
      .trim();

    const json = JSON.parse(responseText);

    return {
      text: json.text?.trim() || "Oops! AI froze mid-roast! ❄️",
      quality: typeof json.quality === "number" ? json.quality : 1,
    };
  } catch (error) {
    console.error("Gemini AI Roast Error:", error);
    return {
      text: "Oops! The AI forgot its punchline. 😅",
      quality: 1,
    };
  }
};
