export interface Scale {
  name: string;
  intervals: number[];  // semitones from root
  pattern: string;      // W = whole step, H = half step
  notes?: string[];     // calculated notes for specific key
}

export interface ScalePosition {
  position: number;
  frets: { [string: number]: number[] };  // string -> fret positions
  rootNotes: { string: number; fret: number }[];
}

export const scaleTypes: { [key: string]: Scale } = {
  'major': {
    name: 'Major',
    intervals: [0, 2, 4, 5, 7, 9, 11],
    pattern: 'W W H W W W H'
  },
  'natural_minor': {
    name: 'Natural Minor',
    intervals: [0, 2, 3, 5, 7, 8, 10],
    pattern: 'W H W W H W W'
  },
  'harmonic_minor': {
    name: 'Harmonic Minor',
    intervals: [0, 2, 3, 5, 7, 8, 11],
    pattern: 'W H W W H W+H H'
  },
  'melodic_minor': {
    name: 'Melodic Minor',
    intervals: [0, 2, 3, 5, 7, 9, 11],
    pattern: 'W H W W W W H'
  },
  'dorian': {
    name: 'Dorian',
    intervals: [0, 2, 3, 5, 7, 9, 10],
    pattern: 'W H W W W H W'
  },
  'phrygian': {
    name: 'Phrygian',
    intervals: [0, 1, 3, 5, 7, 8, 10],
    pattern: 'H W W W H W W'
  },
  'lydian': {
    name: 'Lydian',
    intervals: [0, 2, 4, 6, 7, 9, 11],
    pattern: 'W W W H W W H'
  },
  'mixolydian': {
    name: 'Mixolydian',
    intervals: [0, 2, 4, 5, 7, 9, 10],
    pattern: 'W W H W W H W'
  },
  'locrian': {
    name: 'Locrian',
    intervals: [0, 1, 3, 5, 6, 8, 10],
    pattern: 'H W W H W W W'
  },
  'pentatonic_major': {
    name: 'Pentatonic Major',
    intervals: [0, 2, 4, 7, 9],
    pattern: 'W W W+H W W+H'
  },
  'pentatonic_minor': {
    name: 'Pentatonic Minor',
    intervals: [0, 3, 5, 7, 10],
    pattern: 'W+H W W W+H W'
  },
  'blues': {
    name: 'Blues',
    intervals: [0, 3, 5, 6, 7, 10],
    pattern: 'W+H W H H W+H W'
  }
};

export const noteNames = ['C', 'C#/Db', 'D', 'D#/Eb', 'E', 'F', 'F#/Gb', 'G', 'G#/Ab', 'A', 'A#/Bb', 'B'];

export const generateScaleNotes = (root: string, scaleType: string): string[] => {
  const rootIndex = noteNames.findIndex(note => note.includes(root));
  const scale = scaleTypes[scaleType];
  
  if (rootIndex === -1 || !scale) return [];
  
  return scale.intervals.map(interval => {
    const noteIndex = (rootIndex + interval) % 12;
    return noteNames[noteIndex];
  });
};

// Guitar fretboard positions for C Major Scale - Position 1
export const cMajorPosition1: ScalePosition = {
  position: 1,
  frets: {
    1: [0, 3, 5, 7, 8, 10, 12], // High E string
    2: [1, 3, 5, 6, 8, 10, 12], // B string  
    3: [0, 2, 4, 5, 7, 9, 10, 12], // G string
    4: [0, 2, 3, 5, 7, 9, 10, 12], // D string
    5: [0, 2, 3, 5, 7, 8, 10, 12], // A string
    6: [0, 3, 5, 7, 8, 10, 12] // Low E string
  },
  rootNotes: [
    { string: 1, fret: 8 },   // High E - C
    { string: 2, fret: 1 },   // B - C  
    { string: 3, fret: 5 },   // G - C
    { string: 4, fret: 10 },  // D - C
    { string: 5, fret: 3 },   // A - C
    { string: 6, fret: 8 }    // Low E - C
  ]
};

export const getScalePosition = (root: string, scaleType: string, position: number): ScalePosition => {
  // For now, return the C major position 1 as template
  // In a full implementation, this would calculate positions for all keys/scales
  return cMajorPosition1;
};

export const getScaleFrequencies = (root: string, scaleType: string): number[] => {
  const notes = generateScaleNotes(root, scaleType);
  const baseFrequencies: { [key: string]: number } = {
    'C': 261.63, 'C#/Db': 277.18, 'D': 293.66, 'D#/Eb': 311.13,
    'E': 329.63, 'F': 349.23, 'F#/Gb': 369.99, 'G': 392.00,
    'G#/Ab': 415.30, 'A': 440.00, 'A#/Bb': 466.16, 'B': 493.88
  };
  
  return notes.map(note => baseFrequencies[note] || 440);
};
