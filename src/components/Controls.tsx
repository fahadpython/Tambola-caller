import { Play, Pause, SkipForward, RotateCcw } from 'lucide-react';
import { cn } from '../utils';

interface ControlsProps {
  isPlaying: boolean;
  isFinished: boolean;
  onPlayPause: () => void;
  onNext: () => void;
  onReset: () => void;
  theme: string;
}

export function Controls({ isPlaying, isFinished, onPlayPause, onNext, onReset, theme }: ControlsProps) {
  const btnBase = "flex items-center justify-center gap-2 px-6 py-3 rounded-full font-semibold transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:pointer-events-none";
  
  const primaryBtn = theme === 'neon' 
    ? 'bg-fuchsia-600 text-white hover:bg-fuchsia-500 shadow-[0_0_15px_rgba(217,70,239,0.5)]'
    : theme === 'dark'
    ? 'bg-teal-600 text-white hover:bg-teal-500'
    : 'bg-teal-600 text-white hover:bg-teal-700 shadow-md';

  const secondaryBtn = theme === 'neon'
    ? 'bg-gray-900 border border-purple-500 text-purple-400 hover:bg-purple-900/30'
    : theme === 'dark'
    ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
    : 'bg-gray-100 text-gray-700 hover:bg-gray-200';

  const dangerBtn = theme === 'neon'
    ? 'bg-transparent border border-red-500 text-red-500 hover:bg-red-950/30'
    : theme === 'dark'
    ? 'bg-gray-800 border border-red-900 text-red-400 hover:bg-gray-700'
    : 'bg-white border border-red-200 text-red-600 hover:bg-red-50';

  return (
    <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4 mt-6">
      <button
        onClick={onReset}
        className={cn(btnBase, dangerBtn)}
        title="Reset Game"
      >
        <RotateCcw className="w-5 h-5" />
        <span className="hidden sm:inline">Reset</span>
      </button>

      <button
        onClick={onPlayPause}
        disabled={isFinished}
        className={cn(btnBase, 'w-32 md:w-40', primaryBtn)}
      >
        {isPlaying ? (
          <>
            <Pause className="w-6 h-6 fill-current" />
            <span>Pause</span>
          </>
        ) : (
          <>
            <Play className="w-6 h-6 fill-current" />
            <span>Auto Play</span>
          </>
        )}
      </button>

      <button
        onClick={onNext}
        disabled={isPlaying || isFinished}
        className={cn(btnBase, secondaryBtn)}
      >
        <span className="hidden sm:inline">Next</span>
        <SkipForward className="w-5 h-5" />
      </button>
    </div>
  );
}
