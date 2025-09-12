import { useState, useEffect } from 'react';
import { nanoid } from 'nanoid';
import { QuickPreset, InsertQuickPreset, quickPresetSchema } from '@shared/schema';

const STORAGE_KEY = 'quickPresets';

const defaultPresets: QuickPreset[] = [
  {
    id: 'warmup-default',
    title: '5-Minute Warm-up',
    description: 'Basic stretches and scales',
    exercises: [
      { title: 'Finger Stretches', duration: 2, type: 'warmup' },
      { title: 'Chromatic Exercise', duration: 3, type: 'warmup' }
    ]
  },
  {
    id: 'chords-default',
    title: '15-Minute Chord Practice',
    description: 'Focus on chord changes',
    exercises: [
      { title: 'Open Chord Practice', duration: 5, type: 'chords' },
      { title: 'Chord Transitions', duration: 5, type: 'chords' },
      { title: 'Strumming Patterns', duration: 5, type: 'chords' }
    ]
  },
  {
    id: 'scales-default',
    title: '20-Minute Scale Session',
    description: 'Scale patterns and exercises',
    exercises: [
      { title: 'C Major Scale - Position 1', duration: 7, type: 'scales' },
      { title: 'Scale Sequences', duration: 7, type: 'scales' },
      { title: 'Scale Applications', duration: 6, type: 'scales' }
    ]
  },
  {
    id: 'technique-default',
    title: '30-Minute Technique',
    description: 'Advanced techniques and exercises',
    exercises: [
      { title: 'Alternate Picking', duration: 8, type: 'technique' },
      { title: 'Legato Practice', duration: 7, type: 'technique' },
      { title: 'String Skipping', duration: 8, type: 'technique' },
      { title: 'Vibrato Exercise', duration: 7, type: 'technique' }
    ]
  },
  {
    id: 'theory-default',
    title: '25-Minute Theory Study',
    description: 'Music theory concepts and analysis',
    exercises: [
      { title: 'Circle of Fifths Study', duration: 10, type: 'theory' },
      { title: 'Interval Recognition', duration: 8, type: 'theory' },
      { title: 'Scale Modes Analysis', duration: 7, type: 'theory' }
    ]
  }
];

export function useQuickPresets() {
  const [presets, setPresets] = useState<QuickPreset[]>([]);

  // Load presets from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setPresets(parsed);
      } catch (error) {
        console.error('Failed to parse stored presets:', error);
        setPresets(defaultPresets);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultPresets));
      }
    } else {
      // First time - seed with defaults
      setPresets(defaultPresets);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultPresets));
    }
  }, []);

  // Save presets to localStorage whenever they change
  useEffect(() => {
    if (presets.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(presets));
    }
  }, [presets]);

  const createPreset = (data: InsertQuickPreset): QuickPreset => {
    const newPreset: QuickPreset = {
      id: nanoid(),
      ...data
    };

    // Validate before adding
    const result = quickPresetSchema.safeParse(newPreset);
    if (!result.success) {
      throw new Error('Invalid preset data: ' + result.error.message);
    }

    setPresets(prev => [...prev, newPreset]);
    return newPreset;
  };

  const updatePreset = (id: string, updates: Partial<InsertQuickPreset>): QuickPreset => {
    const existingPreset = presets.find(p => p.id === id);
    if (!existingPreset) {
      throw new Error('Preset not found');
    }

    const updatedPreset = { ...existingPreset, ...updates };
    
    // Validate before updating
    const result = quickPresetSchema.safeParse(updatedPreset);
    if (!result.success) {
      throw new Error('Invalid preset data: ' + result.error.message);
    }

    setPresets(prev => prev.map(p => p.id === id ? updatedPreset : p));
    return updatedPreset;
  };

  const deletePreset = (id: string): void => {
    setPresets(prev => prev.filter(p => p.id !== id));
  };

  const getPreset = (id: string): QuickPreset | undefined => {
    return presets.find(p => p.id === id);
  };

  const duplicatePreset = (id: string): QuickPreset => {
    const preset = getPreset(id);
    if (!preset) {
      throw new Error('Preset not found');
    }

    return createPreset({
      title: `${preset.title} (Copy)`,
      description: preset.description,
      exercises: [...preset.exercises]
    });
  };

  return {
    presets,
    createPreset,
    updatePreset,
    deletePreset,
    getPreset,
    duplicatePreset
  };
}