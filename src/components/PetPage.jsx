export default function PetPage() {
    const pet = "🐶"; // Placeholder for your pet image
    const xp = 70; // out of 100
    const streak = 5;
    const coins = 120;
    const mood = "Happy and playful!";
  
    return (
      <div className="p-6 max-w-xl mx-auto bg-white rounded-2xl shadow-lg text-center">
        {/* Pet */}
        <div className="text-6xl mb-4">{pet}</div>
  
        {/* XP Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span>XP</span>
            <span>{xp}/100</span>
          </div>
          <div className="w-full bg-gray-300 rounded-full h-4">
            <div
              className="bg-blue-500 h-4 rounded-full"
              style={{ width: `${xp}%` }}
            ></div>
          </div>
        </div>
  
        {/* Streak and Coins */}
        <div className="flex justify-around mb-4 text-lg">
          <div>🔥 Streak: {streak}</div>
          <div>💰 Coins: {coins}</div>
        </div>
  
        {/* Mood */}
        <div className="text-gray-700 italic">{mood}</div>
      </div>
    );
  }
  