import { createContext, useContext, useState, ReactNode } from 'react';

export interface ScheduledPractice {
  id: string;
  title: string;
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, etc.
  startTime: string; // HH:MM format
  duration: number; // in minutes
  exercises: {
    title: string;
    duration: number;
    type?: string;
  }[];
  isActive: boolean;
}

interface ScheduleContextType {
  schedules: ScheduledPractice[];
  setSchedules: (schedules: ScheduledPractice[]) => void;
  getTodaysSchedules: () => ScheduledPractice[];
  getActiveSchedulesForDay: (dayOfWeek: number) => ScheduledPractice[];
}

const ScheduleContext = createContext<ScheduleContextType | undefined>(undefined);

const mockSchedules: ScheduledPractice[] = [
  {
    id: '1',
    title: 'Morning Practice',
    dayOfWeek: 1, // Monday
    startTime: '08:00',
    duration: 30,
    exercises: [
      { title: 'Warm-up', duration: 5, type: 'warmup' },
      { title: 'Chord Practice', duration: 15, type: 'chords' },
      { title: 'Scale Practice', duration: 10, type: 'scales' }
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
      { title: 'Technique Practice', duration: 20, type: 'technique' },
      { title: 'Song Practice', duration: 25, type: 'songs' }
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
      { title: 'Scale Mastery', duration: 20, type: 'scales' },
      { title: 'Chord Progressions', duration: 20, type: 'chords' },
      { title: 'Song Learning', duration: 20, type: 'songs' }
    ],
    isActive: false
  }
];

export function ScheduleProvider({ children }: { children: ReactNode }) {
  const [schedules, setSchedules] = useState<ScheduledPractice[]>(mockSchedules);

  const getTodaysSchedules = () => {
    const today = new Date().getDay();
    return schedules.filter(schedule => 
      schedule.dayOfWeek === today && schedule.isActive
    );
  };

  const getActiveSchedulesForDay = (dayOfWeek: number) => {
    return schedules.filter(schedule => 
      schedule.dayOfWeek === dayOfWeek && schedule.isActive
    );
  };

  return (
    <ScheduleContext.Provider value={{
      schedules,
      setSchedules,
      getTodaysSchedules,
      getActiveSchedulesForDay
    }}>
      {children}
    </ScheduleContext.Provider>
  );
}

export function useSchedule() {
  const context = useContext(ScheduleContext);
  if (context === undefined) {
    throw new Error('useSchedule must be used within a ScheduleProvider');
  }
  return context;
}