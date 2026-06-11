export type Theme = 'light' | 'dark' | 'neon';

export interface GameSettings {
  theme: Theme;
  intervalSec: number;
  predefinedNumbers: number[];
  ocrNumbers: number[];
  voiceEnabled: boolean;
}

export interface GameState {
  allNumbers: number[];
  calledNumbers: number[];
  currentNumber: number | null;
  isPlaying: boolean;
  isFinished: boolean;
  forcedNextNumber?: number;
}
