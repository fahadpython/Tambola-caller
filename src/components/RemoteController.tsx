import { useState } from 'react';
import { cn } from '../utils';

interface RemoteControllerProps {
  roomId: string;
  theme: string;
  onExit: () => void;
}

export function RemoteController({ roomId, theme, onExit }: RemoteControllerProps) {
  const [loadingNum, setLoadingNum] = useState<number | null>(null);

  const handleSend = async (num: number) => {
    setLoadingNum(num);
    try {
      await fetch(`/api/room/${roomId}/next`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ number: num })
      });
      // show visual feedback if needed
    } catch(e) {
      console.error(e);
    }
    setTimeout(() => setLoadingNum(null), 500);
  };

  const mainBg = theme === 'neon' ? 'bg-black min-h-screen text-gray-300 border-purple-900'
               : theme === 'dark' ? 'bg-gray-900 min-h-screen text-gray-200'
               : 'bg-gray-50 min-h-screen text-gray-800';

  return (
    <div className={cn("flex flex-col h-screen p-4 md:p-8", mainBg)}>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold">Remote Control</h2>
          <p className="text-sm opacity-70">Room: {roomId}</p>
        </div>
        <button onClick={onExit} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium">
          Exit Remote
        </button>
      </div>
      
      <div className="flex-1 overflow-auto rounded-xl border border-gray-400/20 bg-black/5 p-2">
        <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 h-full content-start">
          {Array.from({ length: 90 }, (_, i) => i + 1).map(num => (
            <button
              key={num}
              disabled={loadingNum !== null}
              onClick={() => handleSend(num)}
              className={cn(
                "aspect-square rounded-lg font-bold text-lg sm:text-xl md:text-2xl transition-all active:scale-95 disabled:opacity-50",
                loadingNum === num ? "bg-fuchsia-600 text-white scale-90" 
                : theme === 'neon' ? "bg-gray-900 border border-gray-800 text-gray-400 hover:text-purple-400 hover:border-purple-600"
                : theme === 'dark' ? "bg-gray-800 border border-gray-700 text-gray-300 hover:bg-gray-700"
                : "bg-white border text-gray-700 hover:bg-gray-100 shadow-sm"
              )}
            >
              {num}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
