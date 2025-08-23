import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Music, Play } from 'lucide-react';
import { 
  scaleTypes, 
  noteNames, 
  generateScaleNotes, 
  getScalePosition,
  getScaleFrequencies,
  intervalsToScaleDegrees
} from '@/lib/scale-data';
import { audioEngine } from '@/lib/audio';

export default function Scales() {
  const [selectedRoot, setSelectedRoot] = useState('C');
  const [selectedScale, setSelectedScale] = useState('major');
  const [selectedPosition, setSelectedPosition] = useState(1);
  const [playbackSpeed, setPlaybackSpeed] = useState(80);

  const currentScale = useMemo(() => {
    return scaleTypes[selectedScale];
  }, [selectedScale]);

  const scaleNotes = useMemo(() => {
    return generateScaleNotes(selectedRoot, selectedScale);
  }, [selectedRoot, selectedScale]);

  const currentPosition = useMemo(() => {
    return getScalePosition(selectedRoot, selectedScale, selectedPosition);
  }, [selectedRoot, selectedScale, selectedPosition]);

  const renderFretboard = () => {
    const position = currentPosition;
    const strings = [1, 2, 3, 4, 5, 6]; // High E to Low E
    const frets = Array.from({ length: 12 }, (_, i) => i);

    return (
      <div className="bg-gradient-to-r from-amber-900 to-amber-800 rounded-lg p-6 mb-6">
        <div className="text-center mb-4">
          <h3 className="text-white font-semibold text-lg">
            {selectedRoot} {currentScale.name} Scale - Position {selectedPosition}
          </h3>
          <p className="text-amber-200 text-sm mt-1">
            One connected scale pattern across all 6 strings
          </p>
        </div>
        
        {/* Instructions */}
        <div className="bg-amber-900/30 rounded p-3 mb-4">
          <p className="text-amber-100 text-sm text-center">
            <strong>This is ONE scale pattern</strong> that connects across all strings. 
            Play the marked notes in sequence to hear the scale.
          </p>
        </div>
        
        <div className="bg-amber-900/50 rounded p-4 overflow-x-auto">
          {/* Fret markers */}
          <div className="flex items-center mb-2">
            <div className="w-20 text-amber-200 text-xs text-right pr-3">Strings:</div>
            {frets.slice(0, 12).map(fret => (
              <div key={fret} className="w-12 text-center text-amber-200 font-mono text-xs">
                {fret === 0 ? '0' : fret}
              </div>
            ))}
          </div>

          {/* Guitar strings as one connected pattern */}
          <div className="relative">
            {strings.map(stringNum => {
              const stringNames = ['E', 'B', 'G', 'D', 'A', 'E'];
              const stringName = stringNames[stringNum - 1];
              const stringFrets = position.frets[stringNum] || [];
              const rootNotes = position.rootNotes.filter(note => note.string === stringNum);
              
              return (
                <div key={stringNum} className="flex items-center mb-1">
                  <div className="w-20 text-amber-200 text-xs text-right pr-3 font-bold">
                    {stringName}
                  </div>
                  <div className="flex relative">
                    {/* String line */}
                    <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-amber-600 transform -translate-y-1/2"></div>
                    
                    {frets.slice(0, 12).map(fret => {
                      const hasNote = stringFrets.includes(fret);
                      const isRoot = rootNotes.some(root => root.fret === fret);
                      
                      return (
                        <div key={fret} className="w-12 h-8 relative flex items-center justify-center">
                          {/* Fret marker */}
                          {fret > 0 && (
                            <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-amber-700"></div>
                          )}
                          
                          {hasNote && (
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold relative z-10 ${
                              isRoot ? 'bg-[#f59e0b] border-2 border-amber-300' : 'bg-[#6366f1] border-2 border-blue-300'
                            }`}>
                              {isRoot ? selectedRoot : '•'}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Fret position markers */}
          <div className="flex items-center mt-2">
            <div className="w-20 text-xs text-right pr-3"></div>
            {[3, 5, 7, 9, 12].map(fretMarker => (
              <div key={fretMarker} className="absolute" style={{left: `${fretMarker * 48 + 80}px`}}>
                <div className="w-2 h-2 bg-amber-500 rounded-full opacity-50"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Legend and instructions */}
        <div className="mt-4 space-y-3">
          <div className="flex justify-center space-x-8">
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 bg-[#f59e0b] border-2 border-amber-300 rounded-full flex items-center justify-center text-white text-xs font-bold">
                {selectedRoot}
              </div>
              <span className="text-amber-100 text-sm">Root Note</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 bg-[#6366f1] border-2 border-blue-300 rounded-full flex items-center justify-center text-white text-xs font-bold">•</div>
              <span className="text-amber-100 text-sm">Scale Notes</span>
            </div>
          </div>
          
          <div className="bg-amber-900/30 rounded p-3">
            <p className="text-amber-100 text-xs text-center">
              <strong>How to play:</strong> This shows one complete scale pattern. Start from any root note (orange) 
              and play through the connected notes to create the full scale sound.
            </p>
          </div>
        </div>
      </div>
    );
  };

  const playScale = () => {
    const frequencies = getScaleFrequencies(selectedRoot, selectedScale);
    const noteInterval = (60 / playbackSpeed) * 1000; // ms per note

    frequencies.forEach((frequency, index) => {
      setTimeout(() => {
        audioEngine.playReferenceTone(frequency, 0.5);
      }, index * noteInterval);
    });
  };

  const startExercise = (exerciseType: string) => {
    console.log(`Starting ${exerciseType} exercise`);
    // Implementation would depend on exercise type
    playScale();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Fretboard Visualization */}
      <div className="lg:col-span-2">
        <Card className="bg-dark-panel border-slate-700">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              <Music className="mr-3 text-[#6366f1]" size={28} />
              Scale Practice
            </h2>

            {renderFretboard()}

            {/* Scale Controls */}
            <div className="bg-slate-800 rounded-lg p-4">
              <h4 className="text-white font-medium mb-3">Practice Tools</h4>
              <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0 sm:space-x-4">
                <Button
                  size="lg"
                  className="bg-[#6366f1] hover:bg-[#6366f1]/80 text-white px-6 py-3 font-semibold"
                  onClick={playScale}
                >
                  <Play className="mr-2" size={20} />
                  Play Scale Audio
                </Button>
                <div className="flex items-center space-x-2">
                  <label className="text-slate-300">Speed:</label>
                  <Slider
                    value={[playbackSpeed]}
                    onValueChange={([value]) => setPlaybackSpeed(value)}
                    min={60}
                    max={140}
                    step={10}
                    className="w-24 slider"
                  />
                  <span className="text-slate-300 text-sm w-16">{playbackSpeed} BPM</span>
                </div>
              </div>
              <p className="text-slate-400 text-xs mt-2">
                Click "Play Scale Audio" to hear how the scale should sound
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Scale Selection & Info */}
      <div className="space-y-6">
        {/* Scale Selection */}
        <Card className="bg-dark-panel border-slate-700">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Scale Selection</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-slate-300 text-sm mb-2">Root Note</label>
                <Select value={selectedRoot} onValueChange={setSelectedRoot}>
                  <SelectTrigger className="w-full bg-slate-700 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    {noteNames.map(note => (
                      <SelectItem key={note} value={note.split('/')[0]} className="text-white hover:bg-slate-600">
                        {note}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-slate-300 text-sm mb-2">Scale Type</label>
                <Select value={selectedScale} onValueChange={setSelectedScale}>
                  <SelectTrigger className="w-full bg-slate-700 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    {Object.entries(scaleTypes).map(([key, scale]) => (
                      <SelectItem key={key} value={key} className="text-white hover:bg-slate-600">
                        {scale.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-slate-300 text-sm mb-2">Position</label>
                <div className="grid grid-cols-5 gap-1">
                  {[1, 2, 3, 4, 5].map(pos => (
                    <Button
                      key={pos}
                      variant={selectedPosition === pos ? "default" : "secondary"}
                      className={`p-2 font-medium text-sm ${
                        selectedPosition === pos
                          ? 'bg-[#6366f1] text-white'
                          : 'bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white'
                      }`}
                      onClick={() => setSelectedPosition(pos)}
                    >
                      {pos}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Scale Information */}
        <Card className="bg-dark-panel border-slate-700">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Scale Info</h3>
            <div className="space-y-3">
              <div>
                <span className="text-slate-400 text-sm">Notes:</span>
                <div className="text-white font-mono mt-1">
                  {scaleNotes.join(' ')}
                </div>
              </div>
              <div>
                <span className="text-slate-400 text-sm">Pattern:</span>
                <div className="text-white font-mono mt-1">
                  {currentScale.pattern}
                </div>
              </div>
              <div>
                <span className="text-slate-400 text-sm">Intervals:</span>
                <div className="text-white font-mono mt-1">
                  {intervalsToScaleDegrees(currentScale.intervals).join(' ')}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Practice Exercises */}
        <Card className="bg-dark-panel border-slate-700">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Practice Exercises</h3>
            <div className="space-y-2">
              {[
                { id: 'ascending', title: 'Ascending Scale', description: 'Play from lowest to highest note' },
                { id: 'descending', title: 'Descending Scale', description: 'Play from highest to lowest note' },
                { id: 'intervals', title: 'Interval Practice', description: 'Practice thirds, fourths, fifths' },
                { id: 'random', title: 'Random Notes', description: 'Random scale notes for ear training' }
              ].map(exercise => (
                <Button
                  key={exercise.id}
                  variant="ghost"
                  className="w-full text-left p-3 bg-slate-800 hover:bg-slate-700 border border-slate-600 hover:border-[#6366f1] transition-colors"
                  onClick={() => startExercise(exercise.id)}
                >
                  <div>
                    <div className="text-white font-medium">{exercise.title}</div>
                    <div className="text-slate-400 text-sm">{exercise.description}</div>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
