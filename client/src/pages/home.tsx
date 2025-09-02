import { useState } from 'react';
import Header from '@/components/header';
import Metronome from '@/components/metronome';
import ChordLibrary from '@/components/chord-library';
import Scales from '@/components/scales';
import Tuner from '@/components/tuner';
import Practice from '@/components/practice';
import PracticeSchedule from '@/components/practice-schedule';
import PracticeHistory from '@/components/practice-history';
import { ScheduleProvider } from '@/contexts/ScheduleContext';

export default function Home() {
  const [activeTab, setActiveTab] = useState('metronome');

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
      <div className="min-h-screen bg-[#0f172a] text-slate-100">
        <Header activeTab={activeTab} onTabChange={setActiveTab} />
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {renderActiveComponent()}
        </main>
      </div>
    </ScheduleProvider>
  );
}
