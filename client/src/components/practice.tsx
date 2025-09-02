import { useState, useRef } from 'react';
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
  Lightbulb,
  X,
  Edit,
  Trash2
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
  const [sessionPaused, setSessionPaused] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [showAddExercise, setShowAddExercise] = useState(false);
  const [newExercise, setNewExercise] = useState<{ title: string; duration: number | string; type: string }>({ title: '', duration: 10, type: 'custom' });
  const durationInputRef = useRef<HTMLInputElement>(null);

  const completedExercises = exercises.filter(ex => ex.status === 'completed').length;
  const totalExercises = exercises.length;
  const sessionProgress = (completedExercises / totalExercises) * 100;

  const toggleExercise = (id: string) => {
    setExercises(exercises.map(exercise => {
      if (exercise.id === id) {
        if (exercise.status === 'active') {
          return { ...exercise, status: 'completed' };
        } else if (exercise.status === 'pending') {
          // Start the next exercise
          const updatedExercises = exercises.map(ex => 
            ex.status === 'active' ? { ...ex, status: 'completed' } : ex
          );
          return { ...exercise, status: 'active' };
        } else if (exercise.status === 'completed') {
          return { ...exercise, status: 'pending' };
        }
      }
      return exercise;
    }));
  };

  const startQuickSession = (type: string) => {
    console.log(`Starting ${type} session`);
    // Reset to a fresh practice session
    const sessionExercises = getSessionExercises(type);
    setExercises(sessionExercises);
    setSessionActive(true);
    setSessionPaused(false);
  };

  const getSessionExercises = (type: string): Exercise[] => {
    const baseExercises: { [key: string]: Exercise[] } = {
      warmup: [
        { id: '1', title: 'Finger Stretches', duration: 2, status: 'active', type: 'warmup' },
        { id: '2', title: 'Chromatic Exercise', duration: 3, status: 'pending', type: 'warmup' }
      ],
      chords: [
        { id: '1', title: 'Open Chord Practice', duration: 5, status: 'active', type: 'chords' },
        { id: '2', title: 'Chord Transitions', duration: 5, status: 'pending', type: 'chords' },
        { id: '3', title: 'Strumming Patterns', duration: 5, status: 'pending', type: 'chords' }
      ],
      scales: [
        { id: '1', title: 'C Major Scale - Position 1', duration: 7, status: 'active', type: 'scales' },
        { id: '2', title: 'Scale Sequences', duration: 7, status: 'pending', type: 'scales' },
        { id: '3', title: 'Scale Applications', duration: 6, status: 'pending', type: 'scales' }
      ],
      technique: [
        { id: '1', title: 'Alternate Picking', duration: 8, status: 'active', type: 'technique' },
        { id: '2', title: 'Legato Practice', duration: 7, status: 'pending', type: 'technique' },
        { id: '3', title: 'String Skipping', duration: 8, status: 'pending', type: 'technique' },
        { id: '4', title: 'Vibrato Exercise', duration: 7, status: 'pending', type: 'technique' }
      ]
    };
    return baseExercises[type] || mockExercises;
  };

  const continueSession = () => {
    setSessionPaused(false);
    setSessionActive(true);
  };

  const pauseSession = () => {
    setSessionPaused(true);
  };

  const endSession = async () => {
    const completedExercises = exercises.filter(ex => ex.status === 'completed').length;
    const totalExercises = exercises.length;
    const totalDuration = exercises.reduce((sum, ex) => 
      ex.status === 'completed' ? sum + ex.duration : sum, 0
    );

    // Save to practice history
    try {
      const historyEntry = {
        userId: 'user-1', // In a real app, this would come from auth context
        sessionTitle: getCurrentSessionTitle(),
        exercises: exercises.map(ex => ({
          title: ex.title,
          duration: ex.duration,
          completed: ex.status === 'completed',
          type: ex.type
        })),
        totalDuration,
        completedExercises,
        totalExercises,
        practiceDate: new Date().toISOString(),
        notes: getSessionNotes()
      };

      // In a real app, this would be an API call
      console.log('Saving practice session to history:', historyEntry);
      
      // For now, just log the completion
      alert(`Session completed! ${completedExercises}/${totalExercises} exercises finished in ${totalDuration} minutes.`);
      
    } catch (error) {
      console.error('Failed to save practice session:', error);
    }

    setSessionActive(false);
    setSessionPaused(false);
    // Mark current active exercise as completed
    setExercises(exercises.map(ex => 
      ex.status === 'active' ? { ...ex, status: 'completed' } : ex
    ));
  };

  const getCurrentSessionTitle = () => {
    const sessionTypes = exercises.map(ex => ex.type);
    const uniqueTypes = Array.from(new Set(sessionTypes));
    
    if (uniqueTypes.length === 1) {
      const type = uniqueTypes[0];
      return `${type.charAt(0).toUpperCase() + type.slice(1)} Practice`;
    } else if (uniqueTypes.includes('warmup') && uniqueTypes.length === 2) {
      const otherType = uniqueTypes.find(t => t !== 'warmup');
      if (otherType) {
        return `${otherType.charAt(0).toUpperCase() + otherType.slice(1)} Session`;
      }
      return 'Practice Session';
    } else {
      return 'Mixed Practice Session';
    }
  };

  const getSessionNotes = () => {
    const completedCount = exercises.filter(ex => ex.status === 'completed').length;
    const totalCount = exercises.length;
    
    if (completedCount === totalCount) {
      return 'Completed all exercises successfully!';
    } else if (completedCount > totalCount * 0.8) {
      return 'Good session with most exercises completed.';
    } else {
      return 'Practice session ended early.';
    }
  };

  const addExercise = () => {
    if (newExercise.title.trim()) {
      const exercise: Exercise = {
        id: (exercises.length + 1).toString(),
        title: newExercise.title,
        duration: typeof newExercise.duration === 'string' ? 10 : newExercise.duration,
        status: 'pending',
        type: newExercise.type
      };
      setExercises([...exercises, exercise]);
      setNewExercise({ title: '', duration: 10, type: 'custom' });
      setShowAddExercise(false);
    }
  };

  const removeExercise = (id: string) => {
    setExercises(exercises.filter(ex => ex.id !== id));
  };

  const getExerciseDescription = (type: string, title: string): string => {
    const descriptions: { [key: string]: string } = {
      'Finger Stretches': 'Gentle finger and hand stretches to prepare for practice',
      'Chromatic Exercise': 'Play chromatic runs to warm up your fingers',
      'Open Chord Practice': 'Practice basic open chords with clean transitions',
      'Chord Transitions': 'Focus on smooth changes between chord shapes',
      'Strumming Patterns': 'Practice different strumming rhythms and dynamics',
      'C Major Scale - Position 1': 'Practice ascending and descending patterns at 80 BPM',
      'Scale Sequences': 'Practice scale patterns in thirds, fourths, and sequences',
      'Scale Applications': 'Apply scales to real musical contexts and improvisation',
      'Alternate Picking': 'Focus on clean alternate picking technique',
      'Legato Practice': 'Practice hammer-ons and pull-offs for smooth playing',
      'String Skipping': 'Advanced technique for skipping strings accurately',
      'Vibrato Exercise': 'Develop controlled vibrato for expression'
    };
    return descriptions[title] || `Practice ${type} techniques with focus and precision`;
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
            {(() => {
              const activeExercise = exercises.find(ex => ex.status === 'active');
              if (!activeExercise && sessionActive) {
                return (
                  <Card className="bg-slate-800 border-slate-600 mb-6">
                    <CardContent className="p-6 text-center">
                      <h3 className="text-lg font-semibold text-white mb-2">Session Complete!</h3>
                      <p className="text-slate-300">All exercises finished. Great job!</p>
                    </CardContent>
                  </Card>
                );
              }
              if (!sessionActive) {
                return (
                  <Card className="bg-slate-800 border-slate-600 mb-6">
                    <CardContent className="p-6 text-center">
                      <h3 className="text-lg font-semibold text-white mb-2">Session Ended</h3>
                      <p className="text-slate-300">Start a new session when you're ready to practice!</p>
                    </CardContent>
                  </Card>
                );
              }
              return (
                <Card className="bg-slate-800 border-slate-600 mb-6">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-white">{activeExercise?.title}</h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        sessionPaused 
                          ? 'bg-yellow-600 text-white'
                          : 'bg-[#f59e0b] text-slate-900'
                      }`}>
                        {sessionPaused ? 'Paused' : 'Active'}
                      </span>
                    </div>
                    <p className="text-slate-300 mb-4">
                      {getExerciseDescription(activeExercise?.type || '', activeExercise?.title || '')}
                    </p>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <Clock className="text-[#6366f1]" size={16} />
                        <span className="text-slate-300 text-sm">Duration:</span>
                        <span className="text-white font-semibold">{activeExercise?.duration} min</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-slate-300 text-sm">BPM:</span>
                        <span className="text-white font-semibold">80</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })()}

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
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-slate-400 hover:text-white"
                      onClick={() => toggleExercise(exercise.id)}
                      data-testid={`button-toggle-exercise-${exercise.id}`}
                    >
                      {exercise.status === 'completed' ? (
                        <RotateCcw size={16} />
                      ) : (
                        <Pause size={16} />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-400 hover:text-red-300"
                      onClick={() => removeExercise(exercise.id)}
                      data-testid={`button-remove-exercise-${exercise.id}`}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              ))}
              
              {/* Add Exercise Form */}
              {showAddExercise ? (
                <Card className="bg-slate-800 border-2 border-[#6366f1] border-dashed">
                  <CardContent className="p-4">
                    <div className="space-y-4">
                      <div>
                        <label className="text-slate-300 text-sm font-medium block mb-2">Exercise Name</label>
                        <input
                          type="text"
                          value={newExercise.title}
                          onChange={(e) => setNewExercise({...newExercise, title: e.target.value})}
                          className="w-full bg-slate-700 border border-slate-600 text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#6366f1]"
                          placeholder="Enter exercise name..."
                          data-testid="input-exercise-title"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-slate-300 text-sm font-medium block mb-2">Duration (minutes)</label>
                          <input
                            type="text"
                            inputMode="numeric"
                            value={newExercise.duration}
                            onChange={(e) => {
                              const value = e.target.value;
                              // Allow empty string or any numeric characters
                              if (value === '' || /^\d+$/.test(value)) {
                                setNewExercise({...newExercise, duration: value});
                              }
                            }}
                            onBlur={(e) => {
                              const value = e.target.value;
                              if (value === '' || isNaN(parseInt(value))) {
                                setNewExercise({...newExercise, duration: 10});
                              } else {
                                const numValue = parseInt(value);
                                if (numValue < 1) {
                                  setNewExercise({...newExercise, duration: 1});
                                } else if (numValue > 60) {
                                  setNewExercise({...newExercise, duration: 60});
                                } else {
                                  setNewExercise({...newExercise, duration: numValue});
                                }
                              }
                            }}
                            className="w-full bg-slate-700 border border-slate-600 text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#6366f1]"
                            placeholder="10"
                            data-testid="input-exercise-duration"
                          />
                        </div>
                        <div>
                          <label className="text-slate-300 text-sm font-medium block mb-2">Type</label>
                          <select
                            value={newExercise.type}
                            onChange={(e) => setNewExercise({...newExercise, type: e.target.value})}
                            className="w-full bg-slate-700 border border-slate-600 text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#6366f1]"
                            data-testid="select-exercise-type"
                          >
                            <option value="custom">Custom</option>
                            <option value="chords">Chords</option>
                            <option value="scales">Scales</option>
                            <option value="technique">Technique</option>
                            <option value="songs">Songs</option>
                            <option value="warmup">Warm-up</option>
                            <option value="rhythm">Rhythm</option>
                          </select>
                        </div>
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowAddExercise(false)}
                          className="text-slate-400 hover:text-white"
                          data-testid="button-cancel-add-exercise"
                        >
                          <X className="mr-2" size={16} />
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          onClick={addExercise}
                          className="bg-[#6366f1] hover:bg-[#6366f1]/80 text-white"
                          data-testid="button-save-exercise"
                        >
                          <Plus className="mr-2" size={16} />
                          Add Exercise
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Button
                  variant="ghost"
                  className="w-full text-left p-4 border-2 border-dashed border-slate-600 hover:border-[#6366f1] bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                  onClick={() => setShowAddExercise(true)}
                  data-testid="button-show-add-exercise"
                >
                  <Plus className="mr-2" size={16} />
                  Add Custom Exercise
                </Button>
              )}
            </div>

            {/* Session Controls */}
            <div className="flex items-center justify-center space-x-4">
              <Button
                size="lg"
                className="bg-green-600 hover:bg-green-500 text-white px-6 py-3 font-semibold"
                disabled={!sessionActive || !sessionPaused}
                onClick={continueSession}
              >
                <Play className="mr-2" size={16} />
                {sessionPaused ? 'Resume Session' : 'Continue Session'}
              </Button>
              <Button
                size="lg"
                variant="secondary"
                className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 font-semibold"
                disabled={!sessionActive || sessionPaused}
                onClick={pauseSession}
              >
                <Pause className="mr-2" size={16} />
                Pause
              </Button>
              <Button
                size="lg"
                variant="destructive"
                className="bg-red-600 hover:bg-red-500 text-white px-6 py-3 font-semibold"
                disabled={!sessionActive}
                onClick={endSession}
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
              onClick={() => {
                console.log('Opening goal creation dialog');
                // In a real app, this would open a modal or form
                alert('Goal creation feature - coming soon!');
              }}
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
