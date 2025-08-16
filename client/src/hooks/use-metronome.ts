import { useState, useRef, useCallback, useEffect } from 'react';
import { audioEngine } from '@/lib/audio';

export interface MetronomeState {
  bpm: number;
  isPlaying: boolean;
  timeSignature: [number, number];
  currentBeat: number;
  volume: number;
  accentEnabled: boolean;
}

export const useMetronome = () => {
  const [state, setState] = useState<MetronomeState>({
    bpm: 120,
    isPlaying: false,
    timeSignature: [4, 4],
    currentBeat: 1,
    volume: 0.7,
    accentEnabled: true
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const nextBeatTimeRef = useRef<number>(0);

  const scheduleBeat = useCallback(() => {
    const now = Date.now();
    const beatInterval = (60 / state.bpm) * 1000;

    while (nextBeatTimeRef.current < now + 100) {
      const isAccent = state.accentEnabled && state.currentBeat === 1;
      
      setTimeout(() => {
        audioEngine.playMetronomeClick(isAccent, state.volume);
      }, nextBeatTimeRef.current - now);

      setState(prev => ({
        ...prev,
        currentBeat: prev.currentBeat >= prev.timeSignature[0] ? 1 : prev.currentBeat + 1
      }));

      nextBeatTimeRef.current += beatInterval;
    }
  }, [state.bpm, state.currentBeat, state.timeSignature, state.volume, state.accentEnabled]);

  const start = useCallback(async () => {
    await audioEngine.resumeContext();
    
    setState(prev => ({ ...prev, isPlaying: true, currentBeat: 1 }));
    nextBeatTimeRef.current = Date.now();
    
    intervalRef.current = setInterval(scheduleBeat, 25);
  }, [scheduleBeat]);

  const stop = useCallback(() => {
    setState(prev => ({ ...prev, isPlaying: false, currentBeat: 1 }));
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const toggle = useCallback(() => {
    if (state.isPlaying) {
      stop();
    } else {
      start();
    }
  }, [state.isPlaying, start, stop]);

  const setBpm = useCallback((bpm: number) => {
    setState(prev => ({ ...prev, bpm: Math.max(60, Math.min(200, bpm)) }));
  }, []);

  const setTimeSignature = useCallback((timeSignature: [number, number]) => {
    setState(prev => ({ 
      ...prev, 
      timeSignature,
      currentBeat: 1
    }));
  }, []);

  const setVolume = useCallback((volume: number) => {
    const normalizedVolume = Math.max(0, Math.min(1, volume));
    setState(prev => ({ ...prev, volume: normalizedVolume }));
    audioEngine.setVolume(normalizedVolume);
  }, []);

  const setAccentEnabled = useCallback((enabled: boolean) => {
    setState(prev => ({ ...prev, accentEnabled: enabled }));
  }, []);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    ...state,
    start,
    stop,
    toggle,
    setBpm,
    setTimeSignature,
    setVolume,
    setAccentEnabled
  };
};
