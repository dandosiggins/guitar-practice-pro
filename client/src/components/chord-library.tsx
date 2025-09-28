import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Hand, Play, Trash2, Save, Plus, X } from 'lucide-react';
import { chordLibrary, getFilteredChords, type ChordDiagram } from '@/lib/chord-data';
import { audioEngine } from '@/lib/audio';

interface ChordCard {
  chord: ChordDiagram;
  onSelect: (chord: ChordDiagram) => void;
}

function ChordCard({ chord, onSelect }: ChordCard) {
  const renderChordDiagram = () => {
    return (
      <div className="bg-slate-700 rounded p-3 mb-3">
        <div className="grid grid-cols-6 gap-1 text-xs">
          {/* Fret numbers */}
          <div></div>
          {[1, 2, 3, 4, 5].map(fret => (
            <div key={fret} className="text-center text-slate-400">{fret}</div>
          ))}
          
          {/* Strings */}
          {['e', 'B', 'G', 'D', 'A', 'E'].map((stringName, stringIndex) => (
            <div key={stringName} className="contents">
              <div className="text-slate-400 text-right pr-2">{stringName}</div>
              {[1, 2, 3, 4, 5].map(fret => {
                const fretValue = chord.frets[stringIndex]; // Direct order since we reversed the array
                const hasFret = fretValue === fret;
                const isOpen = fretValue === 0 && fret === 1;
                const isMuted = fretValue === 'x';
                
                return (
                  <div key={fret} className="h-4 border-b border-slate-500 relative">
                    {hasFret && (
                      <div className="w-3 h-3 bg-[#6366f1] rounded-full absolute -top-0.5 left-1/2 transform -translate-x-1/2"></div>
                    )}
                    {isOpen && fret === 1 && (
                      <div className="w-2 h-2 border border-[#6366f1] rounded-full absolute top-1 left-1/2 transform -translate-x-1/2"></div>
                    )}
                    {isMuted && fret === 1 && (
                      <div className="text-red-400 text-xs absolute top-2 left-1/2 transform -translate-x-1/2">×</div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <Card 
      className="bg-slate-800 border-slate-600 hover:border-[#6366f1] transition-colors cursor-pointer"
      onClick={() => onSelect(chord)}
    >
      <CardContent className="p-4">
        <div className="text-center mb-3">
          <h3 className="text-lg font-bold text-white">{chord.name}</h3>
          <p className="text-sm text-slate-400">{chord.type}</p>
        </div>
        {renderChordDiagram()}
        <div className="text-xs text-center text-slate-400">
          Fingers: {chord.fingers}
        </div>
      </CardContent>
    </Card>
  );
}

export default function ChordLibrary() {
  const [keyFilter, setKeyFilter] = useState('All Keys');
  const [typeFilter, setTypeFilter] = useState('All Types');
  const [selectedChord, setSelectedChord] = useState<ChordDiagram | null>(null);
  const [progression, setProgression] = useState<string[]>([]);

  const filteredChords = useMemo(() => {
    return getFilteredChords(keyFilter, typeFilter);
  }, [keyFilter, typeFilter]);

  const uniqueKeys = useMemo(() => {
    const keys = Array.from(new Set(chordLibrary.map(chord => chord.key))).sort();
    return ['All Keys', ...keys];
  }, []);

  const uniqueTypes = useMemo(() => {
    const types = Array.from(new Set(chordLibrary.map(chord => chord.type))).sort();
    return ['All Types', ...types];
  }, []);

  const addToProgression = (chord: ChordDiagram) => {
    if (progression.length < 8) { // Limit progression length
      setProgression([...progression, chord.name]);
    }
  };

  const removeFromProgression = (index: number) => {
    setProgression(progression.filter((_, i) => i !== index));
  };

  const clearProgression = () => {
    setProgression([]);
  };

  const playProgression = () => {
    if (progression.length > 0) {
      audioEngine.playChordProgression(progression, 120);
    }
  };

  const saveProgression = () => {
    // In a real app, this would save to the backend
    console.log('Saving progression:', progression);
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
      {/* Chord Library */}
      <div className="xl:col-span-3">
        <Card className="bg-dark-panel border-slate-700">
          <CardContent className="p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center">
                <Hand className="mr-3 text-[#6366f1]" size={28} />
                Chord Library
              </h2>
              <div className="flex items-center space-x-4 mt-4 sm:mt-0">
                <Select value={keyFilter} onValueChange={setKeyFilter}>
                  <SelectTrigger className="w-32 bg-slate-700 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    {uniqueKeys.map(key => (
                      <SelectItem key={key} value={key} className="text-white hover:bg-slate-600">
                        {key}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-40 bg-slate-700 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    {uniqueTypes.map(type => (
                      <SelectItem key={type} value={type} className="text-white hover:bg-slate-600">
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredChords.map((chord) => (
                <ChordCard
                  key={`${chord.name}-${chord.type}`}
                  chord={chord}
                  onSelect={addToProgression}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chord Progression Builder */}
      <div className="space-y-6">
        <Card className="bg-dark-panel border-slate-700">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Progression Builder</h3>
            <div className="space-y-3 mb-6 min-h-[200px]">
              {progression.length === 0 ? (
                <div className="text-center text-slate-400 py-8">
                  Click chords to add them to your progression
                </div>
              ) : (
                progression.map((chord, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-slate-800 p-3 rounded-lg border border-slate-600"
                  >
                    <span className="text-white font-medium">{chord}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-red-400 hover:text-red-300 p-1"
                      onClick={() => removeFromProgression(index)}
                    >
                      <X size={16} />
                    </Button>
                  </div>
                ))
              )}
            </div>
            
            <div className="space-y-3">
              <Button
                className="w-full bg-[#6366f1] hover:bg-[#6366f1]/80 text-white"
                onClick={playProgression}
                disabled={progression.length === 0}
              >
                <Play className="mr-2" size={16} />
                Play Progression
              </Button>
              <Button
                variant="secondary"
                className="w-full bg-slate-700 hover:bg-slate-600 text-white"
                onClick={clearProgression}
                disabled={progression.length === 0}
              >
                <Trash2 className="mr-2" size={16} />
                Clear
              </Button>
              <Button
                className="w-full bg-green-600 hover:bg-green-500 text-white"
                onClick={saveProgression}
                disabled={progression.length === 0}
              >
                <Save className="mr-2" size={16} />
                Save
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Saved Progressions */}
        <Card className="bg-dark-panel border-slate-700">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Saved Progressions</h3>
            <div className="space-y-2">
              <div className="bg-slate-800 p-3 rounded-lg border border-slate-600 cursor-pointer hover:border-[#6366f1] transition-colors">
                <div className="text-white font-medium text-sm">C-Am-F-G</div>
                <div className="text-slate-400 text-xs">Classic Pop</div>
              </div>
              <div className="bg-slate-800 p-3 rounded-lg border border-slate-600 cursor-pointer hover:border-[#6366f1] transition-colors">
                <div className="text-white font-medium text-sm">Em-C-G-D</div>
                <div className="text-slate-400 text-xs">Folk Ballad</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
