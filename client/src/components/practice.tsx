import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  ClipboardList, 
  Play, 
  Pause, 
  Square,
  Check,
  RotateCcw,
  Plus,
  Clock,
  Target,
  Lightbulb
} from 'lucide-react';

interface Exercise {
  id: string;
  title: string;
  duration: number;
  status: 'completed' | 'active' | 'pending';
  type: string;
}

const mockExercises: Exercise[] = [
  {
    id: '1',
    title: 'Chord Changes - C-Am-F-G',
    duration: 10,
    status: 'completed',
    type: 'chords'
  },
  {
    id: '2', 
    title: 'Strumming Pattern Practice',
    duration: 15,
    status: 'completed',
    type: 'rhythm'
  },
  {
    id: '3',
    title: 'C Major Scale - Position 1',
    duration: 15,
    status: 'active',
    type: 'scales'
  },
  {
    id: '4',
    title: 'Fingerpicking Exercise',
    duration: 20,
    status: 'pending',
    type: 'technique'
  },
  {
    id: '5',
    title: 'Song Practice - "Wonderwall"',
    duration: 25,
    status: 'pending',
    type: 'songs'
  }
];

const mockStats = {
  todayMinutes: 45,
  weekMinutes: 180,
  streak: 7
};

const mockGoals = [
  {
    id: '1',
    title: 'Learn "Wonderwall"',
    progress: 75,
    target: 'End of month'
  },
  {
    id: '2',
    title: 'Master F Chord',
    progress: 45,
    target: 'Next week'
  }
];

const weeklyData = [
  { day: 'Mon', minutes: 30 },
  { day: 'Tue', minutes: 25 },
  { day: 'Wed', minutes: 20 },
  { day: 'Thu', minutes: 35 },
  { day: 'Fri', minutes: 15 },
  { day: 'Sat', minutes: 40 },
  { day: 'Sun', minutes: 15, inProgress: true }
];

export default function Practice() {
  const [exercises, setExercises] = useState(mockExercises);
  const [sessionActive, setSessionActive] = useState(true);

  const completedExercises = exercises.filter(ex => ex.status === 'completed').length;
  const totalExercises = exercises.length;
  const sessionProgress = (completedExercises / totalExercises) * 100;

  const toggleExercise = (id: string) => {
    setExercises(exercises.map(exercise => {
      if (exercise.id === id && exercise.status === 'active') {
        return { ...exercise, status: 'completed' };
      }
      return exercise;
    }));
  };

  const startQuickSession = (type: string) => {
    console.log(`Starting ${type} session`);
    // Implementation would create a new practice session
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Practice Session */}
      <div className="lg:col-span-2 space-y-8">
        {/* Current Session */}
        <Card className="bg-dark-panel border-slate-700">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              <ClipboardList className="mr-3 text-[#6366f1]" size={28} />
              Today's Practice Session
            </h2>

            {/* Current Exercise */}
            <Card className="bg-slate-800 border-slate-600 mb-6">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">C Major Scale - Position 1</h3>
                  <span className="bg-[#f59e0b] text-slate-900 px-3 py-1 rounded-full text-sm font-semibold">
                    Active
                  </span>
                </div>
                <p className="text-slate-300 mb-4">Practice ascending and descending patterns at 80 BPM</p>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Clock className="text-[#6366f1]" size={16} />
                    <span className="text-slate-300 text-sm">Duration:</span>
                    <span className="text-white font-semibold">15 min</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-slate-300 text-sm">BPM:</span>
                    <span className="text-white font-semibold">80</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Session Progress */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-white font-medium">Session Progress</h4>
                <span className="text-slate-300 text-sm">
                  {completedExercises} of {totalExercises} exercises completed
                </span>
              </div>
              <Progress value={sessionProgress} className="h-3 bg-slate-700" />
            </div>

            {/* Exercise List */}
            <div className="space-y-3 mb-8">
              {exercises.map((exercise) => (
                <div
                  key={exercise.id}
                  className={`flex items-center justify-between rounded-lg p-4 border transition-colors ${
                    exercise.status === 'completed'
                      ? 'bg-slate-800 border-slate-600'
                      : exercise.status === 'active'
                      ? 'bg-[#6366f1]/20 border-2 border-[#6366f1]'
                      : 'bg-slate-800 border-slate-600 opacity-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      exercise.status === 'completed'
                        ? 'bg-green-600'
                        : exercise.status === 'active'
                        ? 'bg-[#6366f1]'
                        : 'bg-slate-600'
                    }`}>
                      {exercise.status === 'completed' ? (
                        <Check className="text-white" size={16} />
                      ) : exercise.status === 'active' ? (
                        <Play className="text-white" size={16} />
                      ) : (
                        <span className="text-slate-400 text-sm font-bold">
                          {parseInt(exercise.id)}
                        </span>
                      )}
                    </div>
                    <div>
                      <div className={`font-medium ${
                        exercise.status === 'pending' ? 'text-slate-300' : 'text-white'
                      }`}>
                        {exercise.title}
                      </div>
                      <div className={`text-sm ${
                        exercise.status === 'pending' ? 'text-slate-500' : 'text-slate-400'
                      }`}>
                        {exercise.duration} minutes • {
                          exercise.status === 'completed' ? 'Completed' :
                          exercise.status === 'active' ? 'In Progress' : 'Upcoming'
                        }
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-slate-400 hover:text-white"
                    onClick={() => toggleExercise(exercise.id)}
                  >
                    {exercise.status === 'completed' ? (
                      <RotateCcw size={16} />
                    ) : (
                      <Pause size={16} />
                    )}
                  </Button>
                </div>
              ))}
            </div>

            {/* Session Controls */}
            <div className="flex items-center justify-center space-x-4">
              <Button
                size="lg"
                className="bg-green-600 hover:bg-green-500 text-white px-6 py-3 font-semibold"
                disabled={!sessionActive}
              >
                <Play className="mr-2" size={16} />
                Continue Session
              </Button>
              <Button
                size="lg"
                variant="secondary"
                className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 font-semibold"
              >
                <Pause className="mr-2" size={16} />
                Pause
              </Button>
              <Button
                size="lg"
                variant="destructive"
                className="bg-red-600 hover:bg-red-500 text-white px-6 py-3 font-semibold"
              >
                <Square className="mr-2" size={16} />
                End Session
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Practice Statistics */}
        <Card className="bg-dark-panel border-slate-700">
          <CardContent className="p-8">
            <h3 className="text-xl font-bold text-white mb-6">Practice Statistics</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <Card className="bg-slate-800 border-slate-600">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-[#f59e0b] mb-1">{mockStats.todayMinutes}</div>
                  <div className="text-slate-400 text-sm">Minutes Today</div>
                </CardContent>
              </Card>
              <Card className="bg-slate-800 border-slate-600">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-[#6366f1] mb-1">{mockStats.weekMinutes}</div>
                  <div className="text-slate-400 text-sm">Minutes This Week</div>
                </CardContent>
              </Card>
              <Card className="bg-slate-800 border-slate-600">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-400 mb-1">{mockStats.streak}</div>
                  <div className="text-slate-400 text-sm">Day Streak</div>
                </CardContent>
              </Card>
            </div>

            {/* Weekly Progress */}
            <div>
              <h4 className="text-white font-medium mb-3">Weekly Progress</h4>
              <div className="grid grid-cols-7 gap-2">
                {weeklyData.map((day, index) => (
                  <div key={index} className="text-center">
                    <div className="text-xs text-slate-400 mb-1">{day.day}</div>
                    <div className="bg-slate-700 h-16 rounded flex items-end justify-center">
                      <div 
                        className={`w-full rounded-b transition-all ${
                          day.inProgress 
                            ? 'bg-[#f59e0b]/50 border-2 border-dashed border-[#f59e0b]' 
                            : 'bg-[#f59e0b]'
                        }`}
                        style={{ height: `${(day.minutes / 40) * 100}%` }}
                      ></div>
                    </div>
                    <div className={`text-xs mt-1 ${day.inProgress ? 'text-[#f59e0b]' : 'text-slate-300'}`}>
                      {day.inProgress ? 'In progress' : `${day.minutes}m`}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        {/* Quick Start */}
        <Card className="bg-dark-panel border-slate-700">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Quick Start</h3>
            <div className="space-y-3">
              {[
                { type: 'warmup', title: '5-Minute Warm-up', description: 'Basic stretches and scales' },
                { type: 'chords', title: '15-Minute Chord Practice', description: 'Focus on chord changes' },
                { type: 'scales', title: '20-Minute Scale Session', description: 'Scale patterns and exercises' },
                { type: 'technique', title: '30-Minute Technique', description: 'Advanced techniques and exercises' }
              ].map(session => (
                <Button
                  key={session.type}
                  variant="ghost"
                  className="w-full text-left p-3 bg-slate-800 hover:bg-slate-700 border border-slate-600 hover:border-[#6366f1] transition-colors"
                  onClick={() => startQuickSession(session.type)}
                >
                  <div>
                    <div className="text-white font-medium">{session.title}</div>
                    <div className="text-slate-400 text-xs">{session.description}</div>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Goals */}
        <Card className="bg-dark-panel border-slate-700">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Practice Goals</h3>
            <div className="space-y-4 mb-4">
              {mockGoals.map(goal => (
                <Card key={goal.id} className="bg-slate-800 border-slate-600">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-medium">{goal.title}</span>
                      <span className="text-[#f59e0b] text-sm">{goal.progress}%</span>
                    </div>
                    <Progress value={goal.progress} className="h-2 mb-2 bg-slate-700" />
                    <div className="text-slate-400 text-xs">Target: {goal.target}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <Button
              variant="default"
              className="w-full bg-[#6366f1] hover:bg-[#6366f1]/80 text-white py-2 text-sm"
            >
              <Plus className="mr-2" size={16} />
              Add New Goal
            </Button>
          </CardContent>
        </Card>

        {/* Practice Tips */}
        <Card className="bg-dark-panel border-slate-700">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Today's Tip</h3>
            <Card className="bg-slate-800 border-l-4 border-[#f59e0b] border-slate-600">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-[#f59e0b] rounded-full flex items-center justify-center">
                    <Lightbulb className="text-slate-900" size={16} />
                  </div>
                  <div>
                    <h4 className="text-white font-medium mb-2">Practice Slow, Play Fast</h4>
                    <p className="text-slate-300 text-sm">
                      Start practicing new songs or techniques at a slow tempo. Gradually increase the speed as you become more comfortable. Your muscle memory will thank you!
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </CardContent>
        </Card>

        {/* Recent Sessions */}
        <Card className="bg-dark-panel border-slate-700">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Recent Sessions</h3>
            <div className="space-y-3">
              {[
                { title: 'Morning Practice', type: 'Chord changes', duration: '25 min', time: 'Today, 9:30 AM' },
                { title: 'Scale Practice', type: 'C Major patterns', duration: '20 min', time: 'Yesterday, 7:15 PM' },
                { title: 'Song Practice', type: 'Wonderwall', duration: '35 min', time: 'Yesterday, 2:45 PM' }
              ].map((session, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div>
                    <div className="text-white font-medium">{session.title}</div>
                    <div className="text-slate-400 text-xs">
                      {session.type} • {session.duration}
                    </div>
                  </div>
                  <div className="text-slate-400 text-xs">{session.time}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
