import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Radio, Mic, MicOff, Play } from 'lucide-react';
import { useTuner } from '@/hooks/use-tuner';

const GUITAR_STRINGS = [
  { name: 'E', fullName: 'E4', frequency: 329.6, string: '1st String' },
  { name: 'B', fullName: 'B3', frequency: 246.9, string: '2nd String' },
  { name: 'G', fullName: 'G3', frequency: 196.0, string: '3rd String' },
  { name: 'D', fullName: 'D3', frequency: 146.8, string: '4th String' },
  { name: 'A', fullName: 'A2', frequency: 110.0, string: '5th String' },
  { name: 'E', fullName: 'E2', frequency: 82.4, string: '6th String' }
];

const REFERENCE_PITCHES = [
  { label: 'A4 = 440 Hz', value: 440 },
  { label: 'A4 = 438 Hz', value: 438 },
  { label: 'A4 = 442 Hz', value: 442 },
  { label: 'A4 = 444 Hz', value: 444 }
];

export default function Tuner() {
  const {
    isListening,
    detectedNote,
    frequency,
    cents,
    accuracy,
    referencePitch,
    toggleListening,
    playReference,
    setReferencePitch
  } = useTuner();

  const getNeedlePosition = () => {
    // Convert cents to position (-50 to +50 cents = -40% to +40% position)
    const maxCents = 50;
    const percentage = Math.max(-40, Math.min(40, (cents / maxCents) * 40));
    return percentage;
  };

  const getAccuracyColor = () => {
    switch (accuracy) {
      case 'in-tune': return 'text-green-400';
      case 'sharp': return 'text-red-400';
      case 'flat': return 'text-blue-400';
      default: return 'text-slate-400';
    }
  };

  const getAccuracyText = () => {
    switch (accuracy) {
      case 'in-tune': return 'In Tune';
      case 'sharp': return 'Sharp';
      case 'flat': return 'Flat';
      default: return 'Play a note';
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="bg-dark-panel border-slate-700">
        <CardContent className="p-8">
          <h2 className="text-2xl font-bold text-white mb-8 text-center flex items-center justify-center">
            <Radio className="mr-3 text-[#6366f1]" size={28} />
            Guitar Tuner
          </h2>

          {/* Tuning Display */}
          <div className="text-center mb-8">
            <Card className="bg-slate-800 border-slate-600 mb-6">
              <CardContent className="p-8">
                <div className="text-6xl font-bold text-[#f59e0b] mb-2">
                  {detectedNote}
                </div>
                <div className="text-xl text-slate-400 mb-4">
                  {frequency.toFixed(1)} Hz
                </div>
                
                {/* Tuning Indicator */}
                <div className="flex items-center justify-center mb-6">
                  <div className="w-80 h-4 bg-slate-700 rounded-full relative">
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded"></div>
                    {/* Tuning needle */}
                    <div 
                      className="absolute top-1/2 transform -translate-y-1/2 w-4 h-4 bg-[#6366f1] rounded-full transition-all duration-200"
                      style={{ 
                        left: `calc(50% + ${getNeedlePosition()}%)`,
                        marginLeft: '-8px'
                      }}
                    ></div>
                  </div>
                </div>
                
                <div className="flex justify-between text-sm text-slate-400 max-w-xs mx-auto">
                  <span>Flat</span>
                  <span className={`font-semibold ${getAccuracyColor()}`}>
                    {getAccuracyText()}
                  </span>
                  <span>Sharp</span>
                </div>
              </CardContent>
            </Card>

            {/* Microphone Control */}
            <Button
              size="lg"
              className="bg-[#6366f1] hover:bg-[#6366f1]/80 text-white px-8 py-4 font-semibold text-lg mb-6"
              onClick={toggleListening}
            >
              {isListening ? (
                <>
                  <MicOff className="mr-3" size={20} />
                  Stop Listening
                </>
              ) : (
                <>
                  <Mic className="mr-3" size={20} />
                  Start Listening
                </>
              )}
            </Button>

            <p className="text-slate-400 text-sm">
              {isListening 
                ? 'Listening... Play a note on your guitar' 
                : 'Click "Start Listening" and play a note on your guitar'
              }
            </p>
          </div>

          {/* String Reference */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
            {GUITAR_STRINGS.map((string, index) => (
              <Card
                key={index}
                className="bg-slate-800 border-slate-600 hover:border-[#6366f1] transition-colors cursor-pointer"
              >
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-[#f59e0b] mb-1">
                    {string.name}
                  </div>
                  <div className="text-sm text-slate-400 mb-2">
                    {string.frequency} Hz
                  </div>
                  <div className="text-xs text-slate-500 mb-2">
                    {string.string}
                  </div>
                  <Button
                    size="sm"
                    className="bg-[#6366f1] hover:bg-[#6366f1]/80 text-white px-3 py-1 text-xs"
                    onClick={() => playReference(string.fullName)}
                  >
                    <Play className="mr-1" size={12} />
                    Play
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Tuning Options */}
          <Card className="bg-slate-800 border-slate-600">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
                <div className="flex items-center space-x-4">
                  <label className="text-slate-300 text-sm">Reference Pitch:</label>
                  <Select 
                    value={referencePitch.toString()} 
                    onValueChange={(value) => setReferencePitch(parseInt(value))}
                  >
                    <SelectTrigger className="w-40 bg-slate-700 border-slate-600 text-white text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-700 border-slate-600">
                      {REFERENCE_PITCHES.map(pitch => (
                        <SelectItem 
                          key={pitch.value} 
                          value={pitch.value.toString()}
                          className="text-white hover:bg-slate-600"
                        >
                          {pitch.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center space-x-2">
                  <label className="text-slate-300 text-sm">Sensitivity:</label>
                  <Slider
                    value={[5]}
                    onValueChange={() => {}}
                    min={1}
                    max={10}
                    step={1}
                    className="w-20 slider"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}
