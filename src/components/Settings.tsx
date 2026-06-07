import { useState } from 'react';
import { Volume2, VolumeX, Settings as SettingsIcon, ShieldAlert } from 'lucide-react';
import { GameSettings, Theme } from '../types';
import { cn } from '../utils';

interface SettingsProps {
  settings: GameSettings;
  onUpdate: (newSettings: GameSettings) => void;
  disabled: boolean;
  onInjectNextNumber: (num: number) => void;
}

export function Settings({ settings, onUpdate, disabled, onInjectNextNumber }: SettingsProps) {
  const { theme, intervalSec, predefinedNumbers, voiceEnabled } = settings;
  const [predefinedText, setPredefinedText] = useState(predefinedNumbers.join(', '));
  const [showHostMode, setShowHostMode] = useState(false);
  const [nextNumberInput, setNextNumberInput] = useState('');

  const handleThemeChange = (t: Theme) => {
    onUpdate({ ...settings, theme: t });
  };

  const handlePredefinedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPredefinedText(e.target.value);
  };

  const handlePredefinedBlur = () => {
    const nums = predefinedText.split(',')
      .map(s => parseInt(s.trim(), 10))
      .filter(n => !isNaN(n) && n >= 1 && n <= 90);
    const uniqueNums = Array.from(new Set(nums));
    onUpdate({ ...settings, predefinedNumbers: uniqueNums });
    setPredefinedText(uniqueNums.join(', '));
  };

  const handleInject = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseInt(nextNumberInput, 10);
    if (!isNaN(num) && num >= 1 && num <= 90) {
      onInjectNextNumber(num);
      setNextNumberInput('');
    }
  };

  const containerClass = theme === 'neon' ? 'bg-black border border-purple-800 shadow-[0_0_15px_rgba(168,85,247,0.2)] text-gray-300'
                       : theme === 'dark' ? 'bg-gray-800 border-gray-700 text-gray-200'
                       : 'bg-white border-gray-200 text-gray-700 shadow-sm';
                       
  const inputClass = theme === 'neon' ? 'bg-gray-900 border-purple-800 text-purple-100 focus:border-purple-500 focus:ring-purple-500/50'
                   : theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white focus:border-teal-500 focus:ring-teal-500'
                   : 'bg-gray-50 border-gray-300 text-gray-900 focus:border-teal-500 focus:ring-teal-500';

  return (
    <div className={cn('p-5 rounded-2xl border', containerClass)}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2 text-lg font-semibold cursor-pointer" onDoubleClick={() => setShowHostMode(v => !v)}>
          <SettingsIcon className="w-5 h-5" />
          <h3>Game Settings</h3>
        </div>
        {/* Subtle toggle for host mode */}
        <button 
          onClick={() => setShowHostMode(v => !v)} 
          className={cn('p-1.5 rounded opacity-20 hover:opacity-100 transition-opacity', showHostMode && 'opacity-100')}
          title="Toggle Host Mode"
        >
          <ShieldAlert className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-5">
        {/* Theme Selection */}
        <div>
          <label className="block text-sm font-medium mb-2">Theme</label>
          <div className="flex gap-2">
            {(['light', 'dark', 'neon'] as Theme[]).map((t) => (
              <button
                key={t}
                onClick={() => handleThemeChange(t)}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors border',
                  theme === t 
                    ? (t === 'neon' ? 'bg-purple-900/50 border-purple-500 text-purple-300' 
                       : t === 'dark' ? 'bg-teal-900/50 border-teal-500 text-teal-300' 
                       : 'bg-teal-50 border-teal-500 text-teal-700')
                    : (t === 'neon' ? 'bg-black border-gray-800 text-gray-500 hover:border-purple-800'
                       : t === 'dark' ? 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-500'
                       : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300')
                )}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Interval Setting */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Auto-Call Delay (Seconds)
          </label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="2"
              max="15"
              step="1"
              value={intervalSec}
              onChange={(e) => onUpdate({ ...settings, intervalSec: Number(e.target.value) })}
              className="flex-1 accent-teal-500"
            />
            <span className="w-12 text-center font-mono font-medium">{intervalSec}s</span>
          </div>
        </div>

        {/* Voice Announcement */}
        <div className="flex items-center justify-between py-2 border-b border-gray-200/20 mb-4">
          <label className="text-sm font-medium">Voice Announcements</label>
          <button
            onClick={() => onUpdate({ ...settings, voiceEnabled: !voiceEnabled })}
            className={cn(
              'p-2 rounded-full transition-colors',
              voiceEnabled 
                ? (theme === 'neon' ? 'bg-purple-900/50 text-purple-400' : theme === 'dark' ? 'bg-teal-900/50 text-teal-400' : 'bg-teal-100 text-teal-700')
                : (theme === 'neon' ? 'bg-gray-900 text-gray-600' : theme === 'dark' ? 'bg-gray-800 text-gray-500' : 'bg-gray-100 text-gray-400')
            )}
          >
            {voiceEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>
        </div>

        {/* Hidden Host Mode */}
        {showHostMode && (
          <div className={cn('p-4 rounded-xl space-y-4 border', theme === 'neon' ? 'bg-purple-950/20 border-purple-900/50' : theme === 'dark' ? 'bg-gray-900/50 border-gray-700/50' : 'bg-gray-100/50 border-gray-200/50')}>
            <h4 className="text-xs font-bold uppercase tracking-wider opacity-60">Host Controls</h4>
            
            {/* Predefined Numbers */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Priority Sequence
              </label>
              <p className="text-xs opacity-70 mb-2">
                Comma separated (e.g. 7, 14, 21). Called first automatically.
              </p>
              <input
                type="text"
                placeholder="e.g. 7, 14, 21"
                value={predefinedText}
                onChange={handlePredefinedChange}
                onBlur={handlePredefinedBlur}
                disabled={disabled}
                className={cn('w-full px-3 py-2 text-sm rounded-lg border focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed', inputClass)}
              />
            </div>

            {/* Inject Next Number */}
            <form onSubmit={handleInject}>
              <label className="block text-sm font-medium mb-1">
                Force Next Number
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="1"
                  max="90"
                  placeholder="e.g. 42"
                  value={nextNumberInput}
                  onChange={(e) => setNextNumberInput(e.target.value)}
                  className={cn('w-full px-3 py-2 text-sm rounded-lg border focus:outline-none focus:ring-2', inputClass)}
                />
                <button
                  type="submit"
                  disabled={!nextNumberInput}
                  className="px-4 py-2 text-sm font-medium bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 transition-colors"
                >
                  Inject
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
