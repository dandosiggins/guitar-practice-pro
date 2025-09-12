import { useState, useRef, useEffect } from 'react';
import { useSchedule } from '@/contexts/ScheduleContext';
import { useQuickPresets } from '@/hooks/use-quick-presets';
import type { QuickPreset } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { nanoid } from 'nanoid';
import { useToast } from '@/hooks/use-toast';
import { 
  ClipboardList, 
  Play, 
  Pause, 
  Square,
  Check,
  RotateCcw,
  Plus,
  Clock,
  Calendar,
  Target,
  Lightbulb,
  X,
  Edit,
  Trash2,
  Settings,
  Save
} from 'lucide-react';

interface Exercise {
  id: string;
  title: string;
  duration: number;
  status: 'completed' | 'active' | 'pending';
  type: string;
}

// Form validation schema for preset management
const presetFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  exercises: z.array(z.object({
    title: z.string().min(1, "Exercise title is required"),
    duration: z.number().min(1, "Duration must be at least 1 minute"),
    type: z.enum(['warmup', 'chords', 'scales', 'technique', 'theory', 'custom', 'songs', 'rhythm'])
  })).min(1, "At least one exercise is required")
});

type PresetFormData = z.infer<typeof presetFormSchema>;

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
  const { getTodaysSchedules } = useSchedule();
  const { presets, createPreset, updatePreset, deletePreset } = useQuickPresets();
  const { toast } = useToast();
  
  // Preset management state
  const [showManagePresets, setShowManagePresets] = useState(false);
  const [editingPreset, setEditingPreset] = useState<QuickPreset | null>(null);
  const [todaysSchedules, setTodaysSchedules] = useState(() => getTodaysSchedules());
  const durationInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Update today's schedules when the component mounts or when the date changes
    setTodaysSchedules(getTodaysSchedules());
  }, [getTodaysSchedules]);

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

  const startQuickSession = (preset: QuickPreset) => {
    console.log(`Starting ${preset.title} session`);
    // Reset to a fresh practice session with preset exercises
    const sessionExercises: Exercise[] = preset.exercises.map((ex, index) => ({
      id: `preset-${index + 1}`,
      title: ex.title,
      duration: ex.duration,
      status: index === 0 ? 'active' : 'pending',
      type: ex.type
    }));
    setExercises(sessionExercises);
    setSessionActive(true);
    setSessionPaused(false);
    setCurrentTime(0);
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
      ],
      theory: [
        { id: '1', title: 'Circle of Fifths Study', duration: 10, status: 'active', type: 'theory' },
        { id: '2', title: 'Interval Recognition', duration: 8, status: 'pending', type: 'theory' },
        { id: '3', title: 'Chord Construction', duration: 12, status: 'pending', type: 'theory' },
        { id: '4', title: 'Scale Modes Analysis', duration: 15, status: 'pending', type: 'theory' }
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
      toast({
        title: "Session completed!",
        description: `${completedExercises}/${totalExercises} exercises finished in ${totalDuration} minutes.`
      });
      
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

  const loadScheduledSession = (scheduledPractice: any) => {
    const scheduledExercises: Exercise[] = scheduledPractice.exercises.map((ex: any, index: number) => ({
      id: `scheduled-${index + 1}`,
      title: ex.title,
      duration: ex.duration,
      status: 'pending' as const,
      type: ex.type || 'custom'
    }));
    
    setExercises(scheduledExercises);
    setSessionActive(false);
    setSessionPaused(false);
    setCurrentTime(0);
  };

  const saveCurrentAsPreset = () => {
    if (exercises.length === 0) {
      toast({
        title: "No exercises to save",
        description: "Add some exercises to your session before saving as a preset",
        variant: "destructive"
      });
      return;
    }
    
    const sessionTitle = exercises.length > 1 ? 'Mixed Practice Session' : exercises[0]?.title || 'Practice Session';
    
    // Handle duplicate titles by adding a number suffix
    let finalTitle = `${sessionTitle} Preset`;
    let counter = 1;
    while (presets.some(p => p.title === finalTitle)) {
      finalTitle = `${sessionTitle} Preset (${counter})`;
      counter++;
    }
    
    const validExerciseTypes = ['warmup', 'chords', 'scales', 'technique', 'theory', 'custom', 'songs', 'rhythm'] as const;
    
    const presetData = {
      title: finalTitle,
      description: 'Saved from current practice session',
      exercises: exercises.map(ex => ({
        title: ex.title,
        duration: ex.duration,
        type: validExerciseTypes.includes(ex.type as any) ? ex.type as typeof validExerciseTypes[number] : 'custom'
      }))
    };
    
    try {
      createPreset(presetData);
      toast({
        title: "Preset saved successfully!",
        description: `"${finalTitle}" has been added to your Quick Start presets`
      });
    } catch (error) {
      toast({
        title: "Failed to save preset",
        description: "Please try again",
        variant: "destructive"
      });
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
      'Vibrato Exercise': 'Develop controlled vibrato for expression',
      'Circle of Fifths Study': 'Learn the relationships between keys and chord progressions',
      'Interval Recognition': 'Train your ear to identify musical intervals',
      'Chord Construction': 'Study how chords are built from scales and intervals',
      'Scale Modes Analysis': 'Understand the modes and their characteristic sounds'
    };
    return descriptions[title] || `Practice ${type} techniques with focus and precision`;
  };

  return (
    <>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Practice Session */}
      <div className="lg:col-span-2 space-y-8">
        {/* Today's Scheduled Sessions */}
        {todaysSchedules.length > 0 && (
          <Card className="bg-dark-panel border-slate-700">
            <CardContent className="p-8">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                <Calendar className="mr-3 text-[#6366f1]" size={24} />
                Today's Scheduled Sessions
              </h2>
              <div className="space-y-3">
                {todaysSchedules.map(schedule => (
                  <Card key={schedule.id} className="bg-slate-800 border-slate-600">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-white mb-1">{schedule.title}</h3>
                          <div className="flex items-center space-x-4 text-slate-400 text-sm">
                            <div className="flex items-center space-x-1">
                              <Clock size={12} />
                              <span>{schedule.startTime}</span>
                            </div>
                            <span>•</span>
                            <span>{schedule.duration}m</span>
                            <span>•</span>
                            <span>{schedule.exercises.length} exercises</span>
                          </div>
                        </div>
                        <Button
                          onClick={() => loadScheduledSession(schedule)}
                          className="bg-[#6366f1] hover:bg-[#6366f1]/80 text-white"
                          size="sm"
                          data-testid={`button-load-schedule-${schedule.id}`}
                        >
                          <Play className="mr-2" size={14} />
                          Load Session
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

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
                          {exercises.findIndex(ex => ex.id === exercise.id) + 1}
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
                            ref={durationInputRef}
                            type="text"
                            inputMode="numeric"
                            defaultValue={newExercise.duration}
                            onKeyDown={(e) => {
                              // Allow backspace, delete, arrow keys, tab, enter, and numeric keys
                              const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Enter'];
                              const isNumeric = /^[0-9]$/.test(e.key);
                              
                              if (!allowedKeys.includes(e.key) && !isNumeric) {
                                e.preventDefault();
                              }
                            }}
                            onBlur={(e) => {
                              const value = e.target.value;
                              let finalValue = 10;
                              
                              if (value !== '' && !isNaN(parseInt(value))) {
                                const numValue = parseInt(value);
                                if (numValue < 1) {
                                  finalValue = 1;
                                } else if (numValue > 60) {
                                  finalValue = 60;
                                } else {
                                  finalValue = numValue;
                                }
                              }
                              
                              setNewExercise({...newExercise, duration: finalValue});
                              e.target.value = finalValue.toString();
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
                            <option value="theory">Theory</option>
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
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Quick Start</h3>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={saveCurrentAsPreset}
                  className="text-slate-300 hover:text-white hover:bg-slate-700"
                  data-testid="button-save-current-preset"
                >
                  <Save className="w-4 h-4 mr-1" />
                  Save
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowManagePresets(true)}
                  className="text-slate-300 hover:text-white hover:bg-slate-700"
                  data-testid="button-manage-presets"
                >
                  <Settings className="w-4 h-4 mr-1" />
                  Manage
                </Button>
              </div>
            </div>
            <div className="space-y-3">
              {presets.map(preset => (
                <Button
                  key={preset.id}
                  variant="ghost"
                  className="w-full text-left p-3 bg-slate-800 hover:bg-slate-700 border border-slate-600 hover:border-[#6366f1] transition-colors"
                  onClick={() => startQuickSession(preset)}
                >
                  <div>
                    <div className="text-white font-medium">{preset.title}</div>
                    <div className="text-slate-400 text-xs">{preset.description}</div>
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
                toast({
                  title: "Coming soon!",
                  description: "Goal creation feature will be available in a future update"
                });
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
    
    {/* Manage Presets Dialog */}
    <ManagePresetsDialog
      open={showManagePresets}
      onOpenChange={setShowManagePresets}
      presets={presets}
      createPreset={createPreset}
      updatePreset={updatePreset}
      deletePreset={deletePreset}
    />
    </>
  );
}

// Preset Management Dialog Component
function ManagePresetsDialog({ 
  open, 
  onOpenChange, 
  presets, 
  createPreset, 
  updatePreset, 
  deletePreset 
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  presets: QuickPreset[];
  createPreset: (data: any) => void;
  updatePreset: (id: string, data: any) => void;
  deletePreset: (id: string) => void;
}) {
  const [editingPreset, setEditingPreset] = useState<QuickPreset | null>(null);
  const [showForm, setShowForm] = useState(false);
  
  const form = useForm<PresetFormData>({
    resolver: zodResolver(presetFormSchema),
    defaultValues: {
      title: '',
      description: '',
      exercises: [{ title: '', duration: 10, type: 'custom' }]
    }
  });

  const handleEdit = (preset: QuickPreset) => {
    setEditingPreset(preset);
    form.reset({
      title: preset.title,
      description: preset.description || '',
      exercises: preset.exercises
    });
    setShowForm(true);
  };

  const handleDelete = (preset: QuickPreset) => {
    if (confirm(`Delete preset "${preset.title}"?`)) {
      deletePreset(preset.id);
    }
  };

  const onSubmit = (data: PresetFormData) => {
    try {
      if (editingPreset) {
        updatePreset(editingPreset.id, data);
      } else {
        createPreset(data);
      }
      setShowForm(false);
      setEditingPreset(null);
      form.reset();
    } catch (error) {
      console.error('Failed to save preset:', error);
    }
  };

  const addExercise = () => {
    const exercises = form.getValues('exercises');
    form.setValue('exercises', [...exercises, { title: '', duration: 10, type: 'custom' }]);
  };

  const removeExercise = (index: number) => {
    const exercises = form.getValues('exercises');
    if (exercises.length > 1) {
      form.setValue('exercises', exercises.filter((_, i) => i !== index));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-dark-panel border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-white">Manage Quick Start Presets</DialogTitle>
        </DialogHeader>
        
        {!showForm ? (
          <div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-slate-300">Your presets</span>
              <Button
                onClick={() => setShowForm(true)}
                className="bg-[#6366f1] hover:bg-[#6366f1]/80"
                data-testid="button-add-preset"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Preset
              </Button>
            </div>
            
            <div className="space-y-3">
              {presets.map(preset => (
                <Card key={preset.id} className="bg-slate-800 border-slate-600">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-white">{preset.title}</h4>
                        <p className="text-slate-400 text-sm">{preset.description}</p>
                        <p className="text-slate-500 text-xs mt-1">
                          {preset.exercises.length} exercises
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(preset)}
                          className="text-slate-400 hover:text-white"
                          data-testid={`button-edit-preset-${preset.id}`}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(preset)}
                          className="text-slate-400 hover:text-red-400"
                          data-testid={`button-delete-preset-${preset.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-white">
                  {editingPreset ? 'Edit Preset' : 'Create New Preset'}
                </h3>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setShowForm(false);
                    setEditingPreset(null);
                    form.reset();
                  }}
                  className="text-slate-400"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Title</FormLabel>
                    <FormControl>
                      <Input {...field} className="bg-slate-700 border-slate-600 text-white" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} className="bg-slate-700 border-slate-600 text-white" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div>
                <div className="flex justify-between items-center mb-3">
                  <FormLabel className="text-white">Exercises</FormLabel>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={addExercise}
                    className="text-[#6366f1] hover:text-[#6366f1]/80"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Exercise
                  </Button>
                </div>
                
                {form.watch('exercises').map((exercise, index) => (
                  <Card key={index} className="bg-slate-700 border-slate-600 mb-3">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-white font-medium">Exercise {index + 1}</span>
                        {form.watch('exercises').length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeExercise(index)}
                            className="text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <FormField
                          control={form.control}
                          name={`exercises.${index}.title`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-slate-300">Title</FormLabel>
                              <FormControl>
                                <Input {...field} className="bg-slate-600 border-slate-500 text-white" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name={`exercises.${index}.duration`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-slate-300">Duration (min)</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  type="number"
                                  min="1"
                                  onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                                  className="bg-slate-600 border-slate-500 text-white"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name={`exercises.${index}.type`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-slate-300">Type</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger className="bg-slate-600 border-slate-500 text-white">
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent className="bg-slate-700 border-slate-600">
                                  <SelectItem value="custom">Custom</SelectItem>
                                  <SelectItem value="warmup">Warm-up</SelectItem>
                                  <SelectItem value="chords">Chords</SelectItem>
                                  <SelectItem value="scales">Scales</SelectItem>
                                  <SelectItem value="technique">Technique</SelectItem>
                                  <SelectItem value="theory">Theory</SelectItem>
                                  <SelectItem value="songs">Songs</SelectItem>
                                  <SelectItem value="rhythm">Rhythm</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setShowForm(false);
                    setEditingPreset(null);
                    form.reset();
                  }}
                  className="text-slate-400"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-[#6366f1] hover:bg-[#6366f1]/80"
                  data-testid="button-save-preset"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {editingPreset ? 'Update' : 'Create'} Preset
                </Button>
              </div>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
