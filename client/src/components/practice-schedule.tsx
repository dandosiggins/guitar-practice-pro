import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Calendar, 
  Plus, 
  Clock,
  Edit,
  Trash2,
  Power,
  PowerOff
} from 'lucide-react';

interface ScheduledPractice {
  id: string;
  title: string;
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, etc.
  startTime: string; // HH:MM format
  duration: number; // in minutes
  exercises: any[];
  isActive: boolean;
}

const mockSchedules: ScheduledPractice[] = [
  {
    id: '1',
    title: 'Morning Practice',
    dayOfWeek: 1, // Monday
    startTime: '08:00',
    duration: 30,
    exercises: [
      { title: 'Warm-up', duration: 5 },
      { title: 'Chord Practice', duration: 15 },
      { title: 'Scale Practice', duration: 10 }
    ],
    isActive: true
  },
  {
    id: '2',
    title: 'Evening Session',
    dayOfWeek: 3, // Wednesday
    startTime: '18:30',
    duration: 45,
    exercises: [
      { title: 'Technique Practice', duration: 20 },
      { title: 'Song Practice', duration: 25 }
    ],
    isActive: true
  },
  {
    id: '3',
    title: 'Weekend Practice',
    dayOfWeek: 6, // Saturday
    startTime: '10:00',
    duration: 60,
    exercises: [
      { title: 'Scale Mastery', duration: 20 },
      { title: 'Chord Progressions', duration: 20 },
      { title: 'Song Learning', duration: 20 }
    ],
    isActive: false
  }
];

const daysOfWeek = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
];

export default function PracticeSchedule() {
  const [schedules, setSchedules] = useState(mockSchedules);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<ScheduledPractice | null>(null);
  const [newSchedule, setNewSchedule] = useState({
    title: '',
    dayOfWeek: 1,
    startTime: '09:00',
    duration: 30,
    exercises: []
  });

  const toggleScheduleActive = (id: string) => {
    setSchedules(schedules.map(schedule => 
      schedule.id === id 
        ? { ...schedule, isActive: !schedule.isActive }
        : schedule
    ));
  };

  const deleteSchedule = (id: string) => {
    setSchedules(schedules.filter(schedule => schedule.id !== id));
  };

  const addSchedule = () => {
    if (newSchedule.title.trim()) {
      const schedule: ScheduledPractice = {
        id: (schedules.length + 1).toString(),
        ...newSchedule,
        exercises: [
          { title: 'Practice Session', duration: newSchedule.duration }
        ],
        isActive: true
      };
      setSchedules([...schedules, schedule]);
      setNewSchedule({ title: '', dayOfWeek: 1, startTime: '09:00', duration: 30, exercises: [] });
      setShowAddForm(false);
    }
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minutes} ${period}`;
  };

  const getSchedulesForDay = (dayIndex: number) => {
    return schedules.filter(schedule => schedule.dayOfWeek === dayIndex);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Calendar className="text-[#6366f1]" size={32} />
          <div>
            <h1 className="text-3xl font-bold text-white">Practice Schedule</h1>
            <p className="text-slate-400">Plan your weekly practice routine</p>
          </div>
        </div>
        <Button
          onClick={() => setShowAddForm(true)}
          className="bg-[#6366f1] hover:bg-[#6366f1]/80 text-white"
          data-testid="button-add-schedule"
        >
          <Plus className="mr-2" size={16} />
          Add Schedule
        </Button>
      </div>

      {/* Weekly Calendar View */}
      <Card className="bg-dark-panel border-slate-700">
        <CardContent className="p-8">
          <h2 className="text-xl font-bold text-white mb-6">Weekly Schedule</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
            {daysOfWeek.map((day, index) => {
              const daySchedules = getSchedulesForDay(index);
              const isToday = new Date().getDay() === index;
              
              return (
                <div key={day} className={`space-y-3 ${isToday ? 'ring-2 ring-[#6366f1] rounded-lg p-3' : 'p-3'}`}>
                  <div className="text-center">
                    <h3 className={`font-semibold ${isToday ? 'text-[#6366f1]' : 'text-white'}`}>
                      {day}
                    </h3>
                    {isToday && (
                      <span className="text-xs text-[#6366f1] font-medium">Today</span>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    {daySchedules.length === 0 ? (
                      <div className="bg-slate-800 rounded-lg p-3 text-center text-slate-500 text-sm border-2 border-dashed border-slate-600">
                        No practice scheduled
                      </div>
                    ) : (
                      daySchedules.map(schedule => (
                        <Card 
                          key={schedule.id} 
                          className={`${
                            schedule.isActive 
                              ? 'bg-slate-800 border-slate-600' 
                              : 'bg-slate-800/50 border-slate-700 opacity-60'
                          }`}
                        >
                          <CardContent className="p-3">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <div className={`font-medium text-sm ${
                                  schedule.isActive ? 'text-white' : 'text-slate-400'
                                }`}>
                                  {schedule.title}
                                </div>
                                <div className="flex items-center space-x-2 text-xs text-slate-400">
                                  <Clock size={12} />
                                  <span>{formatTime(schedule.startTime)}</span>
                                  <span>•</span>
                                  <span>{schedule.duration}m</span>
                                </div>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0 text-slate-400 hover:text-white"
                                  onClick={() => toggleScheduleActive(schedule.id)}
                                  data-testid={`button-toggle-schedule-${schedule.id}`}
                                >
                                  {schedule.isActive ? (
                                    <Power size={12} />
                                  ) : (
                                    <PowerOff size={12} />
                                  )}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0 text-red-400 hover:text-red-300"
                                  onClick={() => deleteSchedule(schedule.id)}
                                  data-testid={`button-delete-schedule-${schedule.id}`}
                                >
                                  <Trash2 size={12} />
                                </Button>
                              </div>
                            </div>
                            <div className="text-xs text-slate-500">
                              {schedule.exercises.length} exercise{schedule.exercises.length !== 1 ? 's' : ''}
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Add Schedule Form */}
      {showAddForm && (
        <Card className="bg-dark-panel border-slate-700">
          <CardContent className="p-8">
            <h3 className="text-xl font-bold text-white mb-6">Add New Schedule</h3>
            
            <div className="space-y-6">
              <div>
                <label className="text-slate-300 text-sm font-medium block mb-2">Practice Title</label>
                <input
                  type="text"
                  value={newSchedule.title}
                  onChange={(e) => setNewSchedule({...newSchedule, title: e.target.value})}
                  className="w-full bg-slate-700 border border-slate-600 text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#6366f1]"
                  placeholder="e.g., Morning Practice, Evening Session"
                  data-testid="input-schedule-title"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="text-slate-300 text-sm font-medium block mb-2">Day of Week</label>
                  <select
                    value={newSchedule.dayOfWeek}
                    onChange={(e) => setNewSchedule({...newSchedule, dayOfWeek: parseInt(e.target.value)})}
                    className="w-full bg-slate-700 border border-slate-600 text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#6366f1]"
                    data-testid="select-schedule-day"
                  >
                    {daysOfWeek.map((day, index) => (
                      <option key={index} value={index}>{day}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="text-slate-300 text-sm font-medium block mb-2">Start Time</label>
                  <input
                    type="time"
                    value={newSchedule.startTime}
                    onChange={(e) => setNewSchedule({...newSchedule, startTime: e.target.value})}
                    className="w-full bg-slate-700 border border-slate-600 text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#6366f1]"
                    data-testid="input-schedule-time"
                  />
                </div>
                
                <div>
                  <label className="text-slate-300 text-sm font-medium block mb-2">Duration (minutes)</label>
                  <input
                    type="number"
                    value={newSchedule.duration}
                    onChange={(e) => setNewSchedule({...newSchedule, duration: parseInt(e.target.value) || 30})}
                    className="w-full bg-slate-700 border border-slate-600 text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#6366f1]"
                    min="5"
                    max="180"
                    data-testid="input-schedule-duration"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-4">
                <Button
                  variant="ghost"
                  onClick={() => setShowAddForm(false)}
                  className="text-slate-400 hover:text-white"
                  data-testid="button-cancel-schedule"
                >
                  Cancel
                </Button>
                <Button
                  onClick={addSchedule}
                  className="bg-[#6366f1] hover:bg-[#6366f1]/80 text-white"
                  data-testid="button-save-schedule"
                >
                  <Plus className="mr-2" size={16} />
                  Add Schedule
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Schedules Summary */}
      <Card className="bg-dark-panel border-slate-700">
        <CardContent className="p-8">
          <h3 className="text-xl font-bold text-white mb-6">Schedule Summary</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-slate-800 border-slate-600">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-[#6366f1] mb-1">
                  {schedules.filter(s => s.isActive).length}
                </div>
                <div className="text-slate-400 text-sm">Active Schedules</div>
              </CardContent>
            </Card>
            
            <Card className="bg-slate-800 border-slate-600">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-[#f59e0b] mb-1">
                  {schedules.filter(s => s.isActive).reduce((sum, s) => sum + s.duration, 0)}
                </div>
                <div className="text-slate-400 text-sm">Weekly Minutes</div>
              </CardContent>
            </Card>
            
            <Card className="bg-slate-800 border-slate-600">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-400 mb-1">
                  {schedules.filter(s => s.isActive && s.dayOfWeek === new Date().getDay()).length}
                </div>
                <div className="text-slate-400 text-sm">Today's Sessions</div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}