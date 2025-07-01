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
You are a legendary roast master AI performing in a high-stakes comedy battle show.

Your task is to craft a hilarious and savage **comeback roast** in response to a human’s roast, while keeping it relevant to the current battle theme.

Only respond if the roast makes contextual sense. Do NOT reply with nonsense, off-topic jokes, or unrelated puns. Stay witty, sharp, and clear. One or two punchy lines max.

Input:
{
  "human_roast": "${userRoast}",
  "battle_theme": "${prompt}"
}

Output: Return a JSON object with your funniest comeback and a self-rated burn score.

Format (NO markdown, NO explanation, NO code blocks):

{
  "text": "<Your AI roast comeback>",
  "quality": <Burn rating from 1 (cold) to 10 (savage)>
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
      quality: typeof json.quality === "number" ? json.quality : 5,
    };
  } catch (error) {
    console.error("Gemini AI Roast Error:", error);
    return {
      text: "Oops! The AI forgot its punchline. 😅",
      quality: 1,
    };
  }
};
