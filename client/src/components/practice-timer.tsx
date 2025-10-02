import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, Square } from 'lucide-react';

interface PracticeTimerProps {
  onComplete: (duration: number) => void;
}

export default function PracticeTimer({ onComplete }: PracticeTimerProps) {
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isRunning) {
      interval = setInterval(() => {
        setSeconds(s => s + 1);
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning]);

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = () => setIsRunning(true);
  const handlePause = () => setIsRunning(false);
  
  const handleStop = () => {
    setIsRunning(false);
    if (seconds > 0) {
      onComplete(Math.floor(seconds / 60)); // Convert to minutes
    }
    setSeconds(0);
  };

  return (
    <div className="bg-slate-900 p-6 rounded-lg">
      <div className="text-center mb-4">
        <div className="text-4xl font-mono text-white mb-2">
          {formatTime(seconds)}
        </div>
        <div className="text-slate-400 text-sm">
          {isRunning ? 'Practice in progress...' : 'Ready to practice'}
        </div>
      </div>
      
      <div className="flex gap-3 justify-center">
        {!isRunning ? (
          <Button 
            onClick={handleStart}
            className="bg-green-600 hover:bg-green-500"
          >
            <Play className="w-4 h-4 mr-2" />
            Start
          </Button>
        ) : (
          <Button 
            onClick={handlePause}
            className="bg-yellow-600 hover:bg-yellow-500"
          >
            <Pause className="w-4 h-4 mr-2" />
            Pause
          </Button>
        )}
        
        <Button 
          onClick={handleStop}
          disabled={seconds === 0}
          variant="outline"
          className="border-slate-600 text-slate-300"
        >
          <Square className="w-4 h-4 mr-2" />
          Stop & Save
        </Button>
      </div>
    </div>
  );
}