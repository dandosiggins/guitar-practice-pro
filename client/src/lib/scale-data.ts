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

// Convert semitone intervals to scale degree numbers
export const intervalsToScaleDegrees = (intervals: number[]): string[] => {
  return intervals.map((interval, index) => {
    if (index === 0) return '1';
    return (index + 1).toString();
  });
};

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

// Calculate fret positions for any scale in any key
export const calculateScalePosition = (root: string, scaleType: string, position: number): ScalePosition => {
  const scale = scaleTypes[scaleType];
  if (!scale) return cMajorPosition1;
  
  const rootIndex = noteNames.findIndex(note => note.includes(root));
  if (rootIndex === -1) return cMajorPosition1;
  
  // Define fret ranges for each position (guitar scale box patterns)
  const positionRanges: { [pos: number]: { start: number; end: number } } = {
    1: { start: 0, end: 4 },   // Open position to 4th fret
    2: { start: 2, end: 6 },   // 2nd to 6th fret  
    3: { start: 4, end: 8 },   // 4th to 8th fret
    4: { start: 7, end: 11 },  // 7th to 11th fret
    5: { start: 9, end: 13 }   // 9th to 13th fret
  };
  
  const range = positionRanges[position] || positionRanges[1];
  
  // Standard guitar tuning from 6th string (low E) to 1st string (high E)
  const stringTuning = [4, 9, 2, 7, 11, 4]; // E A D G B E (semitones from C)
  
  const scalePositions: { [string: number]: number[] } = {};
  const rootNotes: { string: number; fret: number }[] = [];
  
  // Calculate positions for each string within the position range
  for (let stringNum = 1; stringNum <= 6; stringNum++) {
    const stringOpenNote = stringTuning[stringNum - 1];
    const positions: number[] = [];
    
    // Check only frets within the position range
    for (let fret = range.start; fret <= range.end; fret++) {
      const fretNote = (stringOpenNote + fret) % 12;
      
      // Check if this fret contains any note from our scale
      scale.intervals.forEach((interval, noteIndex) => {
        const scaleNoteIndex = (rootIndex + interval) % 12;
        if (fretNote === scaleNoteIndex) {
          positions.push(fret);
          // Mark root notes
          if (interval === 0) {
            rootNotes.push({ string: stringNum, fret });
          }
        }
      });
    }
    
    scalePositions[stringNum] = Array.from(new Set(positions)).sort((a, b) => a - b);
  }
  
  return {
    position,
    frets: scalePositions,
    rootNotes
  };
};

export const getScalePosition = (root: string, scaleType: string, position: number): ScalePosition => {
  return calculateScalePosition(root, scaleType, position);
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
