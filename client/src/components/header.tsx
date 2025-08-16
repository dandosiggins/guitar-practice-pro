import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Clock, 
  Hand, 
  Music, 
  Radio, 
  ClipboardList, 
  Menu,
  Guitar
} from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: 'metronome', label: 'Metronome', icon: Clock },
  { id: 'chords', label: 'Chords', icon: Hand },
  { id: 'scales', label: 'Scales', icon: Music },
  { id: 'tuner', label: 'Tuner', icon: Radio },
  { id: 'practice', label: 'Practice', icon: ClipboardList }
];

export default function Header({ activeTab, onTabChange }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-dark-panel border-b border-slate-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-[#6366f1] to-[#f59e0b] rounded-lg flex items-center justify-center">
              <Guitar className="text-white text-lg" size={20} />
            </div>
            <h1 className="text-xl font-bold text-white">Guitar Practice Pro</h1>
          </div>
          
          <nav className="hidden md:flex space-x-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <Button
                  key={tab.id}
                  variant={activeTab === tab.id ? "default" : "ghost"}
                  className={`px-4 py-2 font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-[#6366f1] text-white hover:bg-[#6366f1]/80'
                      : 'text-slate-300 hover:text-white hover:bg-slate-700'
                  }`}
                  onClick={() => onTabChange(tab.id)}
                >
                  <Icon className="mr-2" size={16} />
                  {tab.label}
                </Button>
              );
            })}
          </nav>

          <Button
            variant="ghost"
            size="sm"
            className="md:hidden p-2 text-slate-300 hover:text-white hover:bg-slate-700"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu size={20} />
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-dark-panel border-t border-slate-700">
          <div className="px-4 py-2 space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <Button
                  key={tab.id}
                  variant={activeTab === tab.id ? "default" : "ghost"}
                  className={`w-full justify-start px-4 py-3 font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-[#6366f1] text-white hover:bg-[#6366f1]/80'
                      : 'text-slate-300 hover:text-white hover:bg-slate-700'
                  }`}
                  onClick={() => {
                    onTabChange(tab.id);
                    setMobileMenuOpen(false);
                  }}
                >
                  <Icon className="mr-2" size={16} />
                  {tab.label}
                </Button>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}
