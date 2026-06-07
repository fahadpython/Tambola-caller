import { Volume2, VolumeX, Settings as SettingsIcon } from 'lucide-react';
import { GameSettings, Theme } from '../types';
import { cn } from '../utils';

interface SettingsProps {
  settings: GameSettings;
  onUpdate: (newSettings: GameSettings) => void;
  disabled: boolean;
}

export function Settings({ settings, onUpdate, disabled }: SettingsProps) {
  const { theme, intervalSec, predefinedNumbers, voiceEnabled } = settings;

  const handleThemeChange = (t: Theme) => {
    onUpdate({ ...settings, theme: t });
  };

  const handlePredefinedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Parse comma separated numbers
    const val = e.target.value;
    const nums = val.split(',')
      .map(s => parseInt(s.trim(), 10))
      .filter(n => !isNaN(n) && n >= 1 && n <= 90);
    // filter duplicates
    const uniqueNums = Array.from(new Set(nums));
    onUpdate({ ...settings, predefinedNumbers: uniqueNums });
  };

  const containerClass = theme === 'neon' ? 'bg-black border border-purple-800 shadow-[0_0_15px_rgba(168,85,247,0.2)] text-gray-300'
                       : theme === 'dark' ? 'bg-gray-800 border-gray-700 text-gray-200'
                       : 'bg-white border-gray-200 text-gray-700 shadow-sm';
                       
  const inputClass = theme === 'neon' ? 'bg-gray-900 border-purple-800 text-purple-100 focus:border-purple-500 focus:ring-purple-500/50'
                   : theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white focus:border-teal-500 focus:ring-teal-500'
                   : 'bg-gray-50 border-gray-300 text-gray-900 focus:border-teal-500 focus:ring-teal-500';

  return (
    <div className={cn('p-5 rounded-2xl border', containerClass)}>
      <div className="flex items-center gap-2 mb-6 text-lg font-semibold">
        <SettingsIcon className="w-5 h-5" />
        <h3>Game Settings</h3>
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

        {/* Predefined Numbers */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Priority Numbers
          </label>
          <p className="text-xs opacity-70 mb-2">
            Comma separated (e.g. 7, 14, 21). These will be called first.
          </p>
          <input
            type="text"
            placeholder="e.g. 7, 14, 21"
            value={predefinedNumbers.join(', ')}
            onChange={handlePredefinedChange}
            disabled={disabled}
            className={cn('w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed', inputClass)}
          />
        </div>

        {/* Voice Announcement */}
        <div className="flex items-center justify-between pt-2">
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
      </div>
    </div>
  );
}
