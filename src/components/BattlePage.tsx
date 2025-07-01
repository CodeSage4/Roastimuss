{/* Battle Prompt */}
<div className="bg-white rounded-2xl shadow-2xl p-8 mb-8">
  <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">🎯 Round {gameState.battleRound} Challenge</h2>
  <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-r-xl text-gray-700 font-medium">{gameState.currentPrompt}</div>
  <label className="block mt-4">
    <span className="text-gray-700 font-semibold text-lg">🔥 Your Epic Roast:</span>
    <textarea
      value={gameState.userRoast}
      onChange={(e) => setUserRoast(e.target.value)}
      disabled={gameState.isLoading || !!gameState.aiResponse}
      className="w-full px-4 py-3 border-2 rounded-xl focus:ring-2 min-h-[120px]"
      maxLength={500}
    />
    <div className="flex justify-between mt-1">
      <p className="text-sm">{gameState.userRoast.length}/500</p>
      {gameState.userQuality > 0 && (
        <div className={`text-sm ${getQualityColor(gameState.userQuality)}`}>
          Quality: {getQualityLabel(gameState.userQuality)}
        </div>
      )}
    </div>
  </label>
  {!gameState.aiResponse && (
    <button
      onClick={handleRoast}
      disabled={gameState.isLoading || !gameState.userRoast.trim()}
      className="mt-4 w-full bg-gradient-to-r from-red-500 to-orange-500 text-white py-4 rounded-xl"
    >
      {gameState.isLoading ? (
        <>
          <Loader className="animate-spin mr-2" />
          Cooking...
        </>
      ) : (
        <>🔥 ROAST!</>
      )}
    </button>
  )}
</div>

{/* AI Response */}
{gameState.aiResponse && (
  <div className="bg-white rounded-2xl shadow-2xl p-8 mb-8">
    <h3 className="text-2xl font-bold text-center">🤖 AI Comeback</h3>
    <div className={`text-sm text-center ${getQualityColor(gameState.aiQuality)}`}>
      AI Quality: {getQualityLabel(gameState.aiQuality)}
    </div>
    <div className="bg-blue-50 p-6 rounded-xl mt-4 italic">"{gameState.aiResponse}"</div>
    <div className="flex justify-between mt-6">
      <div className="text-center">
        <p>Your Score</p>
        <p className={`text-2xl ${getQualityColor(gameState.userQuality)}`}>{gameState.userQuality}/10</p>
      </div>
      <p className="text-lg font-bold">VS</p>
      <div className="text-center">
        <p>AI Score</p>
        <p className={`text-2xl ${getQualityColor(gameState.aiQuality)}`}>{gameState.aiQuality}/10</p>
      </div>
    </div>
    <p className="text-center mt-4 text-green-600">
      Round Points: +{calculateScore(gameState.userQuality, gameState.aiQuality)}
    </p>
    <div className="flex gap-4 mt-6">
      <button
        onClick={handleNextRound}
        className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white py-4 rounded-xl"
      >
        Next Round!
      </button>
      <button
        onClick={handleFinishBattle}
        disabled={gameState.isLoading}
        className="flex-1 bg-gradient-to-r from-green-500 to-teal-500 text-white py-4 rounded-xl"
      >
        {gameState.isLoading ? (
          <>
            <Loader className="animate-spin mr-2" />
            Saving...
          </>
        ) : (
          <>Finish Battle</>
        )}
      </button>
    </div>
  </div>
)}

{/* Audience Reactions */}
{gameState.audienceReactions.length > 0 && (
  <div className="bg-white rounded-2xl shadow-2xl p-6 mb-8">
    <h3 className="text-xl font-bold text-center">Audience Reactions 🎭</h3>
    <div className="space-y-3 max-h-60 overflow-y-auto">
      {gameState.audienceReactions.map((r) => (
        <div
          key={r.id}
          className={`p-3 rounded-lg ${
            r.type === 'user' ? 'bg-red-50 border-red-400' : 'bg-blue-50 border-blue-400'
          }`}
        >
          <span>{r.emoji}</span> <p>{r.name}: {r.reaction}</p>
        </div>
      ))}
    </div>
  </div>
)}
export default BattlePage;
