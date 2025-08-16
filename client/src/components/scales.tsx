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
  cMajorPosition1,
  getScaleFrequencies
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

  const renderFretboard = () => {
    const position = cMajorPosition1; // Using C Major position 1 as template
    const strings = [1, 2, 3, 4, 5, 6]; // High E to Low E
    const frets = Array.from({ length: 12 }, (_, i) => i + 1);

    return (
      <div className="bg-gradient-to-r from-amber-900 to-amber-800 rounded-lg p-6 mb-6">
        <div className="text-center mb-4">
          <h3 className="text-white font-semibold">
            {selectedRoot} {currentScale.name} Scale - Position {selectedPosition}
          </h3>
        </div>
        
        <div className="bg-amber-900/50 rounded p-4">
          <div className="grid grid-cols-13 gap-1 text-xs">
            {/* Fret markers */}
            <div></div>
            {frets.map(fret => (
              <div key={fret} className={`text-center ${[3, 5, 7, 9, 12].includes(fret) ? 'text-amber-200 opacity-70' : ''}`}>
                {[3, 5, 7, 9, 12].includes(fret) ? fret : ''}
              </div>
            ))}

            {/* Strings */}
            {strings.map(stringNum => {
              const stringName = ['e', 'B', 'G', 'D', 'A', 'E'][stringNum - 1];
              const stringFrets = position.frets[stringNum] || [];
              const rootNotes = position.rootNotes.filter(note => note.string === stringNum);
              
              return (
                <div key={stringNum} className="contents">
                  <div className="text-amber-200 text-right pr-2 font-mono">{stringName}</div>
                  {frets.map(fret => {
                    const hasNote = stringFrets.includes(fret);
                    const isRoot = rootNotes.some(root => root.fret === fret);
                    
                    return (
                      <div key={fret} className={`h-6 relative ${stringNum < 6 ? 'border-b-2 border-amber-600' : ''}`}>
                        {hasNote && (
                          <div className={`w-4 h-4 rounded-full absolute -top-2 left-1/2 transform -translate-x-1/2 ${
                            isRoot ? 'bg-[#f59e0b]' : 'bg-[#6366f1]'
                          }`}></div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="flex justify-center mt-4 space-x-6">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-[#f59e0b] rounded-full"></div>
            <span className="text-amber-100 text-sm">Root Note</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-[#6366f1] rounded-full"></div>
            <span className="text-amber-100 text-sm">Scale Note</span>
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
            <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0 sm:space-x-4">
              <Button
                size="lg"
                className="bg-[#6366f1] hover:bg-[#6366f1]/80 text-white px-6 py-3 font-semibold"
                onClick={playScale}
              >
                <Play className="mr-2" size={20} />
                Play Scale
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
                  {currentScale.intervals.map((interval, index) => 
                    index === 0 ? '1' : `${interval + 1}`
                  ).join(' ')}
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
