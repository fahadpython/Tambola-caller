import { useState, useEffect } from 'react';
import { TambolaBoard } from './components/TambolaBoard';
import { CurrentNumber } from './components/CurrentNumber';
import { Controls } from './components/Controls';
import { Settings } from './components/Settings';
import { RemoteController } from './components/RemoteController';
import { useTambola } from './hooks/useTambola';
import { GameSettings } from './types';
import { cn } from './utils';

export default function App() {
  const [settings, setSettings] = useState<GameSettings>({
    theme: 'light',
    intervalSec: 4,
    predefinedNumbers: [],
    ocrNumbers: [],
    voiceEnabled: true,
  });

  const [roomId, setRoomId] = useState<string | null>(null);
  const [isRemoteClient, setIsRemoteClient] = useState(false);

  const { gameState, callNextNumber, togglePlayPause, resetGame, injectNextNumber } = useTambola(settings);

  // Poll for remote injected numbers if we are the host and have a roomId
  useEffect(() => {
    if (!roomId) return;
    if (isRemoteClient) return; // Client doesn't poll for next number

    const intervalId = setInterval(async () => {
      try {
        const res = await fetch(`/api/room/${roomId}`);
        if (!res.ok) return;
        const data = await res.json();
        if (data.nextNumber) {
          injectNextNumber(data.nextNumber);
        }
      } catch (e) {
        console.error(e);
      }
    }, 2000);

    return () => clearInterval(intervalId);
  }, [roomId, isRemoteClient, injectNextNumber]);

  const handleCreateRoom = async () => {
    try {
      const res = await fetch('/api/room', { method: 'POST' });
      const data = await res.json();
      setRoomId(data.roomId);
    } catch (e) {
      console.error(e);
    }
  };

  const handleJoinRoom = (id: string) => {
    setRoomId(id);
    setIsRemoteClient(true);
  };

  if (isRemoteClient && roomId) {
    return (
      <RemoteController 
        roomId={roomId} 
        theme={settings.theme} 
        onExit={() => { setRoomId(null); setIsRemoteClient(false); }} 
      />
    );
  }

  const mainBg = settings.theme === 'neon' ? 'bg-black min-h-screen' 
               : settings.theme === 'dark' ? 'bg-gray-900 min-h-screen text-gray-100' 
               : 'bg-gray-50 min-h-screen text-gray-900';

  const titleClass = settings.theme === 'neon' ? 'text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-purple-600 drop-shadow-[0_0_10px_rgba(217,70,239,0.5)]'
                   : settings.theme === 'dark' ? 'text-white'
                   : 'text-gray-900';

  return (
    <div className={cn("transition-colors duration-500 font-sans p-4 md:p-8", mainBg)}>
      <div className="max-w-6xl mx-auto space-y-8">
        
        <header className="text-center mb-8">
          <h1 className={cn("text-4xl md:text-5xl font-extrabold tracking-tight mb-2", titleClass)}>
            Tambola Caller
          </h1>
          <p className={settings.theme === 'neon' ? 'text-purple-400/80' : 'text-gray-500'}>
            The ultimate bingo number generator
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Game Area */}
          <div className="lg:col-span-8 flex flex-col gap-8">
            <CurrentNumber 
              number={gameState.currentNumber} 
              theme={settings.theme} 
            />
            
            <Controls 
              isPlaying={gameState.isPlaying}
              isFinished={gameState.isFinished}
              onPlayPause={togglePlayPause}
              onNext={callNextNumber}
              onReset={resetGame}
              theme={settings.theme}
            />

            <TambolaBoard 
              allNumbers={gameState.allNumbers}
              calledNumbers={gameState.calledNumbers}
              currentNumber={gameState.currentNumber}
              theme={settings.theme}
            />
          </div>

          {/* Sidebar Area */}
          <div className="lg:col-span-4 space-y-6">
            <Settings 
              settings={settings}
              onUpdate={setSettings}
              disabled={gameState.calledNumbers.length > 0} 
              onInjectNextNumber={injectNextNumber}
              roomId={roomId}
              onCreateRoom={handleCreateRoom}
              onJoinRoom={handleJoinRoom}
            />

            {/* Stats Card */}
            <div className={cn(
              'p-5 rounded-2xl border',
              settings.theme === 'neon' ? 'bg-black border-purple-800 shadow-[0_0_15px_rgba(168,85,247,0.2)]' :
              settings.theme === 'dark' ? 'bg-gray-800 border-gray-700' :
              'bg-white border-gray-200 shadow-sm'
            )}>
              <h3 className={cn("text-lg font-semibold mb-4 flex items-center gap-2", 
                settings.theme === 'neon' ? 'text-gray-300' : ''
              )}>
                Game Stats
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className={cn("p-4 rounded-xl", 
                  settings.theme === 'neon' ? 'bg-gray-900' :
                  settings.theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
                )}>
                  <div className={cn("text-sm mb-1", settings.theme === 'neon' ? 'text-gray-500' : 'text-gray-500')}>Called</div>
                  <div className={cn("text-2xl font-bold", settings.theme === 'neon' ? 'text-purple-400' : 'text-teal-600')}>
                    {gameState.calledNumbers.length}
                  </div>
                </div>
                <div className={cn("p-4 rounded-xl", 
                  settings.theme === 'neon' ? 'bg-gray-900' :
                  settings.theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
                )}>
                  <div className={cn("text-sm mb-1", settings.theme === 'neon' ? 'text-gray-500' : 'text-gray-500')}>Remaining</div>
                  <div className={cn("text-2xl font-bold", settings.theme === 'neon' ? 'text-gray-300' : 'text-gray-700')}>
                    {90 - gameState.calledNumbers.length}
                  </div>
                </div>
              </div>

              {gameState.calledNumbers.length > 0 && (
                <div className="mt-6">
                  <div className={cn("text-sm mb-2", settings.theme === 'neon' ? 'text-gray-500' : 'text-gray-500')}>
                    Last 5 Numbers
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {gameState.calledNumbers.slice(-6, -1).reverse().map((num, i) => (
                      <span key={i} className={cn(
                        "w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium",
                        settings.theme === 'neon' ? 'bg-purple-900/40 text-purple-300 border border-purple-700' :
                        settings.theme === 'dark' ? 'bg-gray-600 text-gray-200' :
                        'bg-teal-50 text-teal-700 border border-teal-100'
                      )}>
                        {num}
                      </span>
                    ))}
                    {gameState.calledNumbers.length === 1 && (
                      <span className="text-sm opacity-50 italic">None yet</span>
                    )}
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

