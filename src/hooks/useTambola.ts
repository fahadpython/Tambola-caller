import { useState, useEffect, useCallback, useRef } from 'react';
import { GameState, GameSettings } from '../types';
import { generateAllNumbers, getAnnounceText } from '../utils';

export function useTambola(settings: GameSettings) {
  const [gameState, setGameState] = useState<GameState>({
    allNumbers: generateAllNumbers(),
    calledNumbers: [],
    currentNumber: null,
    isPlaying: false,
    isFinished: false,
  });

  const timerRef = useRef<number | null>(null);

  const speak = useCallback((num: number) => {
    if (!settings.voiceEnabled || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(getAnnounceText(num));
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  }, [settings.voiceEnabled]);

  const callNextNumber = useCallback(() => {
    setGameState((prev) => {
      if (prev.isFinished) return prev;

      const uncalledNumbers = prev.allNumbers.filter((n) => !prev.calledNumbers.includes(n));
      
      if (uncalledNumbers.length === 0) {
        return { ...prev, isPlaying: false, isFinished: true };
      }

      let nextNum: number | undefined;

      // Check if we need to call from predefined sequence first
      const sequenceIndex = prev.calledNumbers.length;
      if (sequenceIndex < settings.predefinedNumbers.length) {
        const potentialNext = settings.predefinedNumbers[sequenceIndex];
        // Ensure the predefined number is valid and hasn't been called (in case of duplicates)
        if (uncalledNumbers.includes(potentialNext)) {
          nextNum = potentialNext;
        }
      }

      // If no valid predefined number, pick randomly
      if (nextNum === undefined) {
        const randomIndex = Math.floor(Math.random() * uncalledNumbers.length);
        nextNum = uncalledNumbers[randomIndex];
      }

      speak(nextNum);

      return {
        ...prev,
        calledNumbers: [...prev.calledNumbers, nextNum],
        currentNumber: nextNum,
        isFinished: uncalledNumbers.length === 1,
      };
    });
  }, [settings.predefinedNumbers, speak]);

  const togglePlayPause = useCallback(() => {
    setGameState((prev) => {
      if (prev.isFinished) return prev;
      return { ...prev, isPlaying: !prev.isPlaying };
    });
  }, []);

  const resetGame = useCallback(() => {
    setGameState({
      allNumbers: generateAllNumbers(),
      calledNumbers: [],
      currentNumber: null,
      isPlaying: false,
      isFinished: false,
    });
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
    }
    window.speechSynthesis.cancel();
  }, []);

  useEffect(() => {
    if (gameState.isPlaying && !gameState.isFinished) {
      timerRef.current = window.setInterval(callNextNumber, settings.intervalSec * 1000);
    } else if (timerRef.current) {
      window.clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
      }
    };
  }, [gameState.isPlaying, gameState.isFinished, settings.intervalSec, callNextNumber]);

  return {
    gameState,
    callNextNumber,
    togglePlayPause,
    resetGame,
  };
}
