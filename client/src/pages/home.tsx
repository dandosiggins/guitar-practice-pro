import { useState, createContext, useContext } from 'react';
import Metronome from '@/components/metronome';
import ChordLibrary from '@/components/chord-library';
import Scales from '@/components/scales';
import Tuner from '@/components/tuner';
import Practice from '@/components/practice';
import PracticeSchedule from '@/components/practice-schedule';
import PracticeHistory from '@/components/practice-history';
import { ScheduleProvider } from '@/contexts/ScheduleContext';

// Context for sharing tab state with global header
export const HomeTabContext = createContext<{
  activeTab: string;
  setActiveTab: (tab: string) => void;
} | null>(null);

export const useHomeTab = () => {
  const context = useContext(HomeTabContext);
  return context;
};

export default function Home() {
  // Get tab state from global context
  const homeTabContext = useHomeTab();
  if (!homeTabContext) {
    throw new Error('Home component must be used within HomeTabContext');
  }
  const { activeTab, setActiveTab } = homeTabContext;

  const renderActiveComponent = () => {
    switch (activeTab) {
      case 'metronome':
        return <Metronome />;
      case 'chords':
        return <ChordLibrary />;
      case 'scales':
        return <Scales />;
      case 'tuner':
        return <Tuner />;
      case 'practice':
        return <Practice />;
      case 'schedule':
        return <PracticeSchedule />;
      case 'history':
        return <PracticeHistory />;
      default:
        return <Metronome />;
    }
  };

  return (
    <ScheduleProvider>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderActiveComponent()}
      </main>
    </ScheduleProvider>
  );
}
