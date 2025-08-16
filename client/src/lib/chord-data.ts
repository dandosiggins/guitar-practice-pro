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
    frets: ['x', 3, 2, 0, 1, 0],
    fingers: '3-2-1',
    difficulty: 'Easy'
  },
  {
    name: 'Cm',
    fullName: 'C Minor',
    type: 'Minor',
    key: 'C',
    frets: ['x', 3, 1, 0, 1, 3],
    fingers: '3-1-1-4',
    difficulty: 'Medium'
  },
  
  // G Chords
  {
    name: 'G',
    fullName: 'G Major',
    type: 'Major',
    key: 'G',
    frets: [3, 2, 0, 0, 3, 3],
    fingers: '3-1-4-4',
    difficulty: 'Easy'
  },
  
  // A Chords
  {
    name: 'Am',
    fullName: 'A Minor',
    type: 'Minor',
    key: 'A',
    frets: ['x', 0, 2, 2, 1, 0],
    fingers: '2-3-1',
    difficulty: 'Easy'
  },
  {
    name: 'A',
    fullName: 'A Major',
    type: 'Major',
    key: 'A',
    frets: ['x', 0, 2, 2, 2, 0],
    fingers: '1-2-3',
    difficulty: 'Easy'
  },
  
  // F Chords
  {
    name: 'F',
    fullName: 'F Major',
    type: 'Major',
    key: 'F',
    frets: [1, 3, 3, 2, 1, 1],
    fingers: '1-3-4-2-1-1',
    difficulty: 'Hard'
  },
  
  // E Chords
  {
    name: 'Em',
    fullName: 'E Minor',
    type: 'Minor',
    key: 'E',
    frets: [0, 2, 2, 0, 0, 0],
    fingers: '2-3',
    difficulty: 'Easy'
  },
  {
    name: 'E',
    fullName: 'E Major',
    type: 'Major',
    key: 'E',
    frets: [0, 2, 2, 1, 0, 0],
    fingers: '2-3-1',
    difficulty: 'Easy'
  },
  
  // D Chords
  {
    name: 'D',
    fullName: 'D Major',
    type: 'Major',
    key: 'D',
    frets: ['x', 'x', 0, 2, 3, 2],
    fingers: '1-3-2',
    difficulty: 'Easy'
  },
  {
    name: 'Dm',
    fullName: 'D Minor',
    type: 'Minor',
    key: 'D',
    frets: ['x', 'x', 0, 2, 3, 1],
    fingers: '2-3-1',
    difficulty: 'Easy'
  },
  
  // B Chords
  {
    name: 'Bm',
    fullName: 'B Minor',
    type: 'Minor',
    key: 'B',
    frets: ['x', 2, 4, 4, 3, 2],
    fingers: '1-3-4-2-1',
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
