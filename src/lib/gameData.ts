export const roastPrompts = [
  "Roast this annoying gym bro who never stops talking about protein shakes! 💪",
  "Roast someone who always says 'I'm not like other people' but is totally basic! 🙄", 
  "Roast that person who takes 50 selfies before posting one! 📸",
  "Roast someone who claims they're 'naturally funny' but tells the worst jokes! 😬",
  "Roast that friend who always shows up late but blames traffic! 🚗"
];

export const getRandomPrompt = (): string => {
  const randomIndex = Math.floor(Math.random() * roastPrompts.length);
  return roastPrompts[randomIndex];
};