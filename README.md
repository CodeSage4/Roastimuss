# Roast Royale - Reddit Devvit App 🔥

A Reddit-native roast battle game where users compete against AI in epic roasting competitions!

## 🎮 Game Features

- **Multi-Round Battles**: Continue roasting through multiple rounds with increasing difficulty
- **Quality-Based Scoring**: Dynamic scoring system based on roast creativity and humor
- **Audience Reactions**: AI bots react to both user and AI roasts
- **Persistent Leaderboard**: Global rankings stored in Redis
- **Roast Titles**: Earn titles based on your total score (from "Newbie Toaster" to "Roast Deity")

## 🚀 Deployment Instructions

### Prerequisites
1. Install the Devvit CLI:
   ```bash
   npm install -g @devvit/cli
   ```

2. Login to your Reddit account:
   ```bash
   devvit login
   ```

### Build & Deploy

1. **Build the app:**
   ```bash
   npm run build
   ```

2. **Test locally (optional):**
   ```bash
   npm run dev
   ```

3. **Upload to Reddit:**
   ```bash
   npm run upload
   ```

4. **Deploy to a subreddit:**
   ```bash
   npm run deploy
   ```

### Installation on Reddit

1. **For Moderators**: Use the "Install Roast Royale" menu action in your subreddit
2. **For Users**: Look for "Roast Royale" custom posts in participating subreddits

## 🎯 How to Play

1. **Enter Username**: Start by entering your roasting name
2. **Battle Arena**: Receive a random roast prompt
3. **Write Your Roast**: Craft your best comeback
4. **AI Response**: Watch the AI fire back with its own roast
5. **Scoring**: Get scored on creativity, humor, and roast quality
6. **Continue**: Battle through multiple rounds or finish to save your score
7. **Leaderboard**: Compete for the top spot and earn roast titles!

## 🏆 Scoring System

- **Base Score**: 1-10 points based on roast quality
- **Victory Bonus**: +5 points for beating the AI
- **Tie Bonus**: +2 points for matching the AI
- **Round Multiplier**: Scores increase by 20% each round
- **Leaderboard**: Global rankings with fun roast titles

## 🔧 Technical Details

- **Framework**: Reddit Devvit
- **Storage**: Redis for leaderboard persistence
- **UI**: Native Devvit components
- **Deployment**: Direct to Reddit subreddits

Ready to become the ultimate roast master? 🔥👑