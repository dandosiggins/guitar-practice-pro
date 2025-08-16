import { useState, useRef, useCallback, useEffect } from 'react';
import { audioEngine } from '@/lib/audio';

export interface TunerState {
  isListening: boolean;
  detectedNote: string;
  frequency: number;
  cents: number; // deviation from target frequency
  accuracy: 'sharp' | 'flat' | 'in-tune';
  referencePitch: number; // A4 frequency
}

const NOTE_FREQUENCIES: { [key: string]: number } = {
  'E2': 82.41,   // 6th string
  'A2': 110.00,  // 5th string
  'D3': 146.83,  // 4th string
  'G3': 196.00,  // 3rd string
  'B3': 246.94,  // 2nd string
  'E4': 329.63   // 1st string
};

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export const useTuner = () => {
  const [state, setState] = useState<TunerState>({
    isListening: false,
    detectedNote: 'A',
    frequency: 440,
    cents: 0,
    accuracy: 'in-tune',
    referencePitch: 440
  });

  const mediaStreamRef = useRef<MediaStream | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const frequencyToNote = useCallback((frequency: number): { note: string; cents: number } => {
    const A4 = state.referencePitch;
    const C0 = A4 * Math.pow(2, -4.75);
    
    const noteIndex = Math.round(12 * Math.log2(frequency / C0));
    const noteName = NOTE_NAMES[noteIndex % 12];
    const octave = Math.floor(noteIndex / 12);
    
    const expectedFrequency = C0 * Math.pow(2, noteIndex / 12);
    const cents = Math.round(1200 * Math.log2(frequency / expectedFrequency));
    
    return { note: `${noteName}${octave}`, cents };
  }, [state.referencePitch]);

  const getAccuracy = useCallback((cents: number): 'sharp' | 'flat' | 'in-tune' => {
    if (Math.abs(cents) <= 5) return 'in-tune';
    return cents > 0 ? 'sharp' : 'flat';
  }, []);

  const analyzeAudio = useCallback(() => {
    if (!analyserRef.current) return;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Float32Array(bufferLength);
    analyserRef.current.getFloatFrequencyData(dataArray);

    // Simple peak detection for fundamental frequency
    let maxIndex = 0;
    let maxValue = -Infinity;
    
    for (let i = 0; i < bufferLength; i++) {
      if (dataArray[i] > maxValue) {
        maxValue = dataArray[i];
        maxIndex = i;
      }
    }

    if (maxValue > -50) { // Threshold for signal detection
      const frequency = (maxIndex * 44100) / (2 * bufferLength);
      
      if (frequency > 75 && frequency < 400) { // Guitar frequency range
        const { note, cents } = frequencyToNote(frequency);
        const accuracy = getAccuracy(cents);
        
        setState(prev => ({
          ...prev,
          detectedNote: note,
          frequency: Math.round(frequency * 10) / 10,
          cents,
          accuracy
        }));
      }
    }

    if (state.isListening) {
      animationFrameRef.current = requestAnimationFrame(analyzeAudio);
    }
  }, [state.isListening, frequencyToNote, getAccuracy]);

  const startListening = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      
      analyser.fftSize = 4096;
      analyser.smoothingTimeConstant = 0.8;
      
      source.connect(analyser);
      analyserRef.current = analyser;

      setState(prev => ({ ...prev, isListening: true }));
      analyzeAudio();
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  }, [analyzeAudio]);

  const stopListening = useCallback(() => {
    setState(prev => ({ ...prev, isListening: false }));
    
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    analyserRef.current = null;
  }, []);

  const toggleListening = useCallback(() => {
    if (state.isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [state.isListening, startListening, stopListening]);

  const playReference = useCallback((noteName: string) => {
    const frequency = NOTE_FREQUENCIES[noteName];
    if (frequency) {
      audioEngine.playReferenceTone(frequency);
    }
  }, []);

  const setReferencePitch = useCallback((pitch: number) => {
    setState(prev => ({ ...prev, referencePitch: pitch }));
  }, []);

  useEffect(() => {
    return () => {
      stopListening();
    };
  }, [stopListening]);

  return {
    ...state,
    startListening,
    stopListening,
    toggleListening,
    playReference,
    setReferencePitch,
    noteFrequencies: NOTE_FREQUENCIES
  };
};
