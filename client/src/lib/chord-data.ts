export interface ChordDiagram {
  name: string;
  fullName: string;
  type: 'Major' | 'Minor' | '7th' | 'Minor 7th' | 'Major 7th' | 'Suspended' | 'Diminished';
  key: string;
  frets: (number | 'x')[];  // 6 strings, x for muted
  fingers: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

export const chordLibrary: ChordDiagram[] = [
  // C Chords
  {
    name: 'C',
    fullName: 'C Major',
    type: 'Major',
    key: 'C',
    frets: [0, 1, 0, 2, 3, 'x'],
    fingers: '3-2-1',
    difficulty: 'Easy'
  },
  {
    name: 'Cm',
    fullName: 'C Minor',
    type: 'Minor',
    key: 'C',
    frets: [3, 1, 0, 1, 3, 'x'],
    fingers: '3-1-1-4',
    difficulty: 'Medium'
  },
  
  // G Chords
  {
    name: 'G',
    fullName: 'G Major',
    type: 'Major',
    key: 'G',
    frets: [3, 3, 0, 0, 2, 3],
    fingers: '3-1-4-4',
    difficulty: 'Easy'
  },
  
  // A Chords
  {
    name: 'Am',
    fullName: 'A Minor',
    type: 'Minor',
    key: 'A',
    frets: [0, 1, 2, 2, 0, 'x'],
    fingers: '2-3-1',
    difficulty: 'Easy'
  },
  {
    name: 'A',
    fullName: 'A Major',
    type: 'Major',
    key: 'A',
    frets: [0, 2, 2, 2, 0, 'x'],
    fingers: '1-2-3',
    difficulty: 'Easy'
  },
  
  // F Chords
  {
    name: 'F',
    fullName: 'F Major',
    type: 'Major',
    key: 'F',
    frets: [1, 1, 2, 3, 3, 1],
    fingers: '1-3-4-2-1-1',
    difficulty: 'Hard'
  },
  
  // E Chords
  {
    name: 'Em',
    fullName: 'E Minor',
    type: 'Minor',
    key: 'E',
    frets: [0, 0, 0, 2, 2, 0],
    fingers: '2-3',
    difficulty: 'Easy'
  },
  {
    name: 'E',
    fullName: 'E Major',
    type: 'Major',
    key: 'E',
    frets: [0, 0, 1, 2, 2, 0],
    fingers: '2-3-1',
    difficulty: 'Easy'
  },
  
  // D Chords
  {
    name: 'D',
    fullName: 'D Major',
    type: 'Major',
    key: 'D',
    frets: [2, 3, 2, 0, 'x', 'x'],
    fingers: '1-3-2',
    difficulty: 'Easy'
  },
  {
    name: 'Dm',
    fullName: 'D Minor',
    type: 'Minor',
    key: 'D',
    frets: [1, 3, 2, 0, 'x', 'x'],
    fingers: '2-3-1',
    difficulty: 'Easy'
  },
  
  // B Chords
  {
    name: 'Bm',
    fullName: 'B Minor',
    type: 'Minor',
    key: 'B',
    frets: [2, 3, 4, 4, 2, 'x'],
    fingers: '1-3-4-2-1',
    difficulty: 'Medium'
  },
  {
    name: 'B',
    fullName: 'B Major',
    type: 'Major',
    key: 'B',
    frets: [2, 4, 4, 4, 2, 'x'],
    fingers: '1-3-4-4-1',
    difficulty: 'Hard'
  },
  {
    name: 'B7',
    fullName: 'B Dominant 7th',
    type: '7th',
    key: 'B',
    frets: [2, 0, 2, 1, 2, 'x'],
    fingers: '2-1-3-4',
    difficulty: 'Medium'
  },

  // 7th Chords
  {
    name: 'A7',
    fullName: 'A Dominant 7th',
    type: '7th',
    key: 'A',
    frets: [0, 2, 0, 2, 0, 'x'],
    fingers: '2-3',
    difficulty: 'Easy'
  },
  {
    name: 'D7',
    fullName: 'D Dominant 7th',
    type: '7th',
    key: 'D',
    frets: [2, 1, 2, 0, 'x', 'x'],
    fingers: '2-1-3',
    difficulty: 'Easy'
  },
  {
    name: 'E7',
    fullName: 'E Dominant 7th',
    type: '7th',
    key: 'E',
    frets: [0, 0, 1, 0, 2, 0],
    fingers: '2-1',
    difficulty: 'Easy'
  },
  {
    name: 'G7',
    fullName: 'G Dominant 7th',
    type: '7th',
    key: 'G',
    frets: [1, 0, 0, 0, 2, 3],
    fingers: '3-2-1',
    difficulty: 'Easy'
  },
  {
    name: 'C7',
    fullName: 'C Dominant 7th',
    type: '7th',
    key: 'C',
    frets: [0, 1, 3, 2, 3, 'x'],
    fingers: '3-2-4-1',
    difficulty: 'Medium'
  },

  // Minor 7th Chords
  {
    name: 'Am7',
    fullName: 'A Minor 7th',
    type: 'Minor 7th',
    key: 'A',
    frets: [0, 1, 0, 2, 0, 'x'],
    fingers: '2-1',
    difficulty: 'Easy'
  },
  {
    name: 'Dm7',
    fullName: 'D Minor 7th',
    type: 'Minor 7th',
    key: 'D',
    frets: [1, 1, 2, 0, 'x', 'x'],
    fingers: '2-1-1',
    difficulty: 'Easy'
  },
  {
    name: 'Em7',
    fullName: 'E Minor 7th',
    type: 'Minor 7th',
    key: 'E',
    frets: [0, 3, 0, 2, 2, 0],
    fingers: '2-3-4',
    difficulty: 'Easy'
  },
  {
    name: 'Gm7',
    fullName: 'G Minor 7th',
    type: 'Minor 7th',
    key: 'G',
    frets: [3, 3, 3, 3, 5, 3],
    fingers: '1-3-1-1-1-1',
    difficulty: 'Hard'
  },

  // Major 7th Chords
  {
    name: 'Cmaj7',
    fullName: 'C Major 7th',
    type: 'Major 7th',
    key: 'C',
    frets: [0, 0, 0, 2, 3, 'x'],
    fingers: '3-2',
    difficulty: 'Easy'
  },
  {
    name: 'Dmaj7',
    fullName: 'D Major 7th',
    type: 'Major 7th',
    key: 'D',
    frets: [2, 2, 2, 0, 'x', 'x'],
    fingers: '1-2-3',
    difficulty: 'Easy'
  },
  {
    name: 'Gmaj7',
    fullName: 'G Major 7th',
    type: 'Major 7th',
    key: 'G',
    frets: [2, 0, 0, 0, 2, 3],
    fingers: '3-1-2',
    difficulty: 'Easy'
  },
  {
    name: 'Amaj7',
    fullName: 'A Major 7th',
    type: 'Major 7th',
    key: 'A',
    frets: [0, 2, 1, 2, 0, 'x'],
    fingers: '2-1-3',
    difficulty: 'Easy'
  },

  // Suspended Chords
  {
    name: 'Dsus4',
    fullName: 'D Suspended 4th',
    type: 'Suspended',
    key: 'D',
    frets: [3, 3, 2, 0, 'x', 'x'],
    fingers: '1-2-3',
    difficulty: 'Easy'
  },
  {
    name: 'Asus4',
    fullName: 'A Suspended 4th',
    type: 'Suspended',
    key: 'A',
    frets: [0, 3, 2, 2, 0, 'x'],
    fingers: '1-2-3',
    difficulty: 'Easy'
  },
  {
    name: 'Esus4',
    fullName: 'E Suspended 4th',
    type: 'Suspended',
    key: 'E',
    frets: [0, 0, 2, 2, 2, 0],
    fingers: '2-3-4',
    difficulty: 'Easy'
  },
  {
    name: 'Gsus4',
    fullName: 'G Suspended 4th',
    type: 'Suspended',
    key: 'G',
    frets: [3, 1, 0, 0, 3, 3],
    fingers: '3-4-1-3',
    difficulty: 'Medium'
  },

  // Additional Major/Minor Chords
  {
    name: 'F#m',
    fullName: 'F# Minor',
    type: 'Minor',
    key: 'F#',
    frets: [2, 2, 2, 4, 4, 2],
    fingers: '1-3-4-1-1-1',
    difficulty: 'Hard'
  },
  {
    name: 'Bb',
    fullName: 'Bb Major',
    type: 'Major',
    key: 'Bb',
    frets: [1, 3, 3, 3, 1, 'x'],
    fingers: '1-2-3-4-1',
    difficulty: 'Hard'
  },
  {
    name: 'Eb',
    fullName: 'Eb Major',
    type: 'Major',
    key: 'Eb',
    frets: [3, 4, 3, 1, 'x', 'x'],
    fingers: '1-2-4-3',
    difficulty: 'Medium'
  },
  {
    name: 'Gm',
    fullName: 'G Minor',
    type: 'Minor',
    key: 'G',
    frets: [3, 3, 3, 5, 5, 3],
    fingers: '1-3-4-1-1-1',
    difficulty: 'Hard'
  },
  {
    name: 'Fm',
    fullName: 'F Minor',
    type: 'Minor',
    key: 'F',
    frets: [1, 1, 1, 3, 3, 1],
    fingers: '1-3-4-1-1-1',
    difficulty: 'Hard'
  },

  // Add9 Chords
  {
    name: 'Cadd9',
    fullName: 'C Add 9',
    type: 'Major',
    key: 'C',
    frets: [0, 3, 0, 2, 3, 'x'],
    fingers: '2-1-3',
    difficulty: 'Easy'
  },
  {
    name: 'Gadd9',
    fullName: 'G Add 9',
    type: 'Major',
    key: 'G',
    frets: [3, 0, 0, 0, 0, 3],
    fingers: '3-4',
    difficulty: 'Easy'
  },
  {
    name: 'Dadd9',
    fullName: 'D Add 9',
    type: 'Major',
    key: 'D',
    frets: [0, 3, 2, 0, 'x', 'x'],
    fingers: '1-2',
    difficulty: 'Easy'
  },

  // Diminished Chords
  {
    name: 'Bdim',
    fullName: 'B Diminished',
    type: 'Diminished',
    key: 'B',
    frets: [1, 3, 1, 3, 2, 'x'],
    fingers: '2-3-1-4-1',
    difficulty: 'Hard'
  },
  {
    name: 'C#dim',
    fullName: 'C# Diminished',
    type: 'Diminished',
    key: 'C#',
    frets: [3, 2, 3, 2, 'x', 'x'],
    fingers: '1-2-1-3',
    difficulty: 'Medium'
  }
];

export const getChordsByKey = (key: string) => {
  if (key === 'All Keys') return chordLibrary;
  return chordLibrary.filter(chord => chord.key === key);
};

export const getChordsByType = (type: string) => {
  if (type === 'All Types') return chordLibrary;
  return chordLibrary.filter(chord => chord.type === type);
};

export const getFilteredChords = (key: string, type: string) => {
  let filtered = chordLibrary;
  
  if (key !== 'All Keys') {
    filtered = filtered.filter(chord => chord.key === key);
  }
  
  if (type !== 'All Types') {
    filtered = filtered.filter(chord => chord.type === type);
  }
  
  return filtered;
};
