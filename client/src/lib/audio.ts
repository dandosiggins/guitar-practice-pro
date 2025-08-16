export class AudioEngine {
  private audioContext: AudioContext | null = null;
  private metronomeGain: GainNode | null = null;
  private isPlaying = false;

  constructor() {
    this.initializeAudioContext();
  }

  private initializeAudioContext() {
    if (typeof window !== 'undefined') {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.metronomeGain = this.audioContext.createGain();
      this.metronomeGain.connect(this.audioContext.destination);
    }
  }

  async resumeContext() {
    if (this.audioContext?.state === 'suspended') {
      await this.audioContext.resume();
    }
  }

  // Metronome functionality
  playMetronomeClick(isAccent = false, volume = 0.7) {
    if (!this.audioContext || !this.metronomeGain) return;

    const oscillator = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();

    oscillator.connect(gain);
    gain.connect(this.metronomeGain);

    // Different frequencies for accent vs regular beats
    oscillator.frequency.setValueAtTime(
      isAccent ? 1200 : 800,
      this.audioContext.currentTime
    );

    gain.gain.setValueAtTime(volume, this.audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.1);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + 0.1);
  }

  // Reference tone for tuner
  playReferenceTone(frequency: number, duration = 2) {
    if (!this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();

    oscillator.connect(gain);
    gain.connect(this.audioContext.destination);

    oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
    oscillator.type = 'sine';

    gain.gain.setValueAtTime(0, this.audioContext.currentTime);
    gain.gain.linearRampToValueAtTime(0.3, this.audioContext.currentTime + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration);
  }

  // Chord progression playback
  playChordProgression(chords: string[], bpm = 120) {
    if (!this.audioContext) return;

    const chordDuration = 60 / bpm * 4; // 4 beats per chord
    const startTime = this.audioContext.currentTime;

    chords.forEach((chord, index) => {
      const chordTime = startTime + (index * chordDuration);
      this.playChord(chord, chordTime, chordDuration);
    });
  }

  private playChord(chordName: string, startTime: number, duration: number) {
    if (!this.audioContext) return;

    const chordFrequencies = this.getChordFrequencies(chordName);
    
    chordFrequencies.forEach(frequency => {
      const oscillator = this.audioContext!.createOscillator();
      const gain = this.audioContext!.createGain();

      oscillator.connect(gain);
      gain.connect(this.audioContext!.destination);

      oscillator.frequency.setValueAtTime(frequency, startTime);
      oscillator.type = 'triangle';

      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.1, startTime + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

      oscillator.start(startTime);
      oscillator.stop(startTime + duration);
    });
  }

  private getChordFrequencies(chordName: string): number[] {
    // Simplified chord frequency mapping
    const chordMap: { [key: string]: number[] } = {
      'C': [261.63, 329.63, 392.00],
      'Am': [220.00, 261.63, 329.63],
      'F': [174.61, 220.00, 261.63, 349.23],
      'G': [196.00, 246.94, 293.66],
      'Em': [164.81, 196.00, 246.94],
      'D': [146.83, 185.00, 233.08],
      'Dm': [146.83, 174.61, 220.00]
    };

    return chordMap[chordName] || chordMap['C'];
  }

  setVolume(volume: number) {
    if (this.metronomeGain) {
      this.metronomeGain.gain.value = volume;
    }
  }

  destroy() {
    if (this.audioContext) {
      this.audioContext.close();
    }
  }
}

export const audioEngine = new AudioEngine();
