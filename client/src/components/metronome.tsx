import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Clock, Play, Pause, Square, Minus, Plus } from 'lucide-react';
import { useMetronome } from '@/hooks/use-metronome';

export default function Metronome() {
  const {
    bpm,
    isPlaying,
    timeSignature,
    currentBeat,
    volume,
    accentEnabled,
    start,
    stop,
    toggle,
    setBpm,
    setTimeSignature,
    setVolume,
    setAccentEnabled
  } = useMetronome();

  const [practiceTime, setPracticeTime] = useState(0);
  const [practiceTimer, setPracticeTimer] = useState<NodeJS.Timeout | null>(null);
  const [pulseClass, setPulseClass] = useState('');

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startPracticeTimer = () => {
    if (practiceTimer) return;
    
    const timer = setInterval(() => {
      setPracticeTime(prev => prev + 1);
    }, 1000);
    
    setPracticeTimer(timer);
  };

  const resetPracticeTimer = () => {
    if (practiceTimer) {
      clearInterval(practiceTimer);
      setPracticeTimer(null);
    }
    setPracticeTime(0);
  };

  const timeSignatures: [number, number][] = [
    [4, 4], [3, 4], [2, 4], [6, 8]
  ];

  // Add visual pulse effect when metronome plays
  useEffect(() => {
    if (isPlaying) {
      setPulseClass('metronome-pulse');
      const timeout = setTimeout(() => setPulseClass(''), 100);
      return () => clearTimeout(timeout);
    }
  }, [currentBeat, isPlaying]);

  useEffect(() => {
    return () => {
      if (practiceTimer) {
        clearInterval(practiceTimer);
      }
    };
  }, [practiceTimer]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Metronome Control */}
      <div className="lg:col-span-2">
        <Card className="bg-dark-panel border-slate-700">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              <Clock className="mr-3 text-[#6366f1]" size={28} />
              Metronome
            </h2>
            
            {/* BPM Display */}
            <div className="text-center mb-8">
              <div className={`inline-flex items-center justify-center w-32 h-32 rounded-full border-4 border-[#6366f1] bg-gradient-to-r from-[#6366f1]/20 to-[#f59e0b]/20 mb-4 ${pulseClass}`}>
                <div className="text-center">
                  <div className="text-4xl font-bold text-white">{bpm}</div>
                  <div className="text-sm text-slate-400">BPM</div>
                </div>
              </div>
            </div>

            {/* BPM Controls */}
            <div className="flex items-center justify-center space-x-4 mb-8">
              <Button
                size="sm"
                variant="secondary"
                className="w-12 h-12 rounded-full bg-slate-700 hover:bg-slate-600"
                onClick={() => setBpm(bpm - 1)}
              >
                <Minus size={16} />
              </Button>
              <div className="flex-1 max-w-md">
                <Slider
                  value={[bpm]}
                  onValueChange={([value]) => setBpm(value)}
                  min={60}
                  max={200}
                  step={1}
                  className="slider"
                />
              </div>
              <Button
                size="sm"
                variant="secondary"
                className="w-12 h-12 rounded-full bg-slate-700 hover:bg-slate-600"
                onClick={() => setBpm(bpm + 1)}
              >
                <Plus size={16} />
              </Button>
            </div>

            {/* Play/Pause Controls */}
            <div className="flex items-center justify-center space-x-4">
              <Button
                size="lg"
                className="bg-[#6366f1] hover:bg-[#6366f1]/80 text-white px-8 py-4 font-semibold text-lg"
                onClick={toggle}
              >
                {isPlaying ? (
                  <>
                    <Pause className="mr-3" size={20} />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="mr-3" size={20} />
                    Start
                  </>
                )}
              </Button>
              <Button
                variant="secondary"
                size="lg"
                className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-4 font-semibold"
                onClick={stop}
              >
                <Square size={16} />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Settings & Timer */}
      <div className="space-y-6">
        {/* Time Signature */}
        <Card className="bg-dark-panel border-slate-700">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Time Signature</h3>
            <div className="grid grid-cols-2 gap-2">
              {timeSignatures.map((sig) => (
                <Button
                  key={`${sig[0]}/${sig[1]}`}
                  variant={timeSignature[0] === sig[0] && timeSignature[1] === sig[1] ? "default" : "secondary"}
                  className={`p-3 font-semibold transition-colors ${
                    timeSignature[0] === sig[0] && timeSignature[1] === sig[1]
                      ? 'bg-[#6366f1] text-white'
                      : 'bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white'
                  }`}
                  onClick={() => setTimeSignature(sig)}
                >
                  {sig[0]}/{sig[1]}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Sound Settings */}
        <Card className="bg-dark-panel border-slate-700">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Sound</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Volume</span>
                <div className="w-24">
                  <Slider
                    value={[volume * 100]}
                    onValueChange={([value]) => setVolume(value / 100)}
                    min={0}
                    max={100}
                    step={1}
                    className="slider"
                  />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Accent Beat</span>
                <Switch
                  checked={accentEnabled}
                  onCheckedChange={setAccentEnabled}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Practice Timer */}
        <Card className="bg-dark-panel border-slate-700">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Practice Timer</h3>
            <div className="text-center">
              <div className="text-2xl font-mono text-[#f59e0b] mb-3">
                {formatTime(practiceTime)}
              </div>
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  className="flex-1 bg-green-600 hover:bg-green-500 text-white"
                  onClick={startPracticeTimer}
                  disabled={!!practiceTimer}
                >
                  <Play className="mr-1" size={14} />
                  Start
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white"
                  onClick={resetPracticeTimer}
                >
                  Reset
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Beat Indicator */}
        <Card className="bg-dark-panel border-slate-700">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Current Beat</h3>
            <div className="flex justify-center space-x-2">
              {Array.from({ length: timeSignature[0] }, (_, i) => (
                <div
                  key={i}
                  className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-semibold transition-colors ${
                    currentBeat === i + 1
                      ? 'border-[#6366f1] bg-[#6366f1] text-white'
                      : 'border-slate-600 text-slate-400'
                  }`}
                >
                  {i + 1}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
