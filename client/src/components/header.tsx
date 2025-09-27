import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { 
  Clock, 
  Hand, 
  Music, 
  Radio, 
  ClipboardList, 
  Calendar,
  History,
  Menu,
  Guitar,
  Library
} from 'lucide-react';
import { useHomeTab } from '@/pages/home';

interface HeaderProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

const tabs = [
  { id: 'metronome', label: 'Metronome', icon: Clock },
  { id: 'chords', label: 'Chords', icon: Hand },
  { id: 'scales', label: 'Scales', icon: Music },
  { id: 'tuner', label: 'Tuner', icon: Radio },
  { id: 'practice', label: 'Practice', icon: ClipboardList },
  { id: 'schedule', label: 'Schedule', icon: Calendar },
  { id: 'history', label: 'History', icon: History }
];

const navigationLinks = [
  { href: '/', label: 'Practice Tools', icon: Guitar, id: 'home' },
  { href: '/songs', label: 'Song Library', icon: Library, id: 'songs' }
];

export default function Header({ activeTab, onTabChange }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [location] = useLocation();
  const homeTabContext = useHomeTab();

  // Use context tab state when on home page, otherwise use props
  const currentActiveTab = location === '/' && homeTabContext ? homeTabContext.activeTab : activeTab;
  const currentOnTabChange = location === '/' && homeTabContext ? homeTabContext.setActiveTab : onTabChange;

  return (
    <header className="bg-dark-panel border-b border-slate-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/">
            <div className="flex items-center space-x-3 cursor-pointer">
              <div className="w-8 h-8 bg-gradient-to-r from-[#6366f1] to-[#f59e0b] rounded-lg flex items-center justify-center">
                <Guitar className="text-white text-lg" size={20} />
              </div>
              <h1 className="text-xl font-bold text-white">Guitar Practice Pro</h1>
            </div>
          </Link>
          
          <nav className="hidden md:flex space-x-0.5">
            {/* Navigation Links */}
            {navigationLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location === link.href;
              return (
                <Link key={link.id} href={link.href}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    className={`px-2 py-1 font-medium transition-colors ${
                      isActive
                        ? 'bg-[#6366f1] text-white hover:bg-[#6366f1]/80'
                        : 'text-slate-300 hover:text-white hover:bg-slate-700'
                    }`}
                  >
                    <Icon className="mr-2" size={16} />
                    {link.label}
                  </Button>
                </Link>
              );
            })}
            
            {/* Show internal tabs only on home page */}
            {location === '/' && currentActiveTab && currentOnTabChange && tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <Button
                  key={tab.id}
                  variant={currentActiveTab === tab.id ? "default" : "ghost"}
                  className={`px-2 py-1 text-sm font-medium transition-colors ${
                    currentActiveTab === tab.id
                      ? 'bg-[#6366f1] text-white hover:bg-[#6366f1]/80'
                      : 'text-slate-300 hover:text-white hover:bg-slate-700'
                  }`}
                  onClick={() => currentOnTabChange(tab.id)}
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
            {/* Navigation Links */}
            {navigationLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location === link.href;
              return (
                <Link key={link.id} href={link.href}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    className={`w-full justify-start px-4 py-3 font-medium transition-colors ${
                      isActive
                        ? 'bg-[#6366f1] text-white hover:bg-[#6366f1]/80'
                        : 'text-slate-300 hover:text-white hover:bg-slate-700'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Icon className="mr-2" size={16} />
                    {link.label}
                  </Button>
                </Link>
              );
            })}
            
            {/* Show internal tabs only on home page */}
            {location === '/' && currentActiveTab && currentOnTabChange && tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <Button
                  key={tab.id}
                  variant={currentActiveTab === tab.id ? "default" : "ghost"}
                  className={`w-full justify-start px-4 py-3 font-medium transition-colors ${
                    currentActiveTab === tab.id
                      ? 'bg-[#6366f1] text-white hover:bg-[#6366f1]/80'
                      : 'text-slate-300 hover:text-white hover:bg-slate-700'
                  }`}
                  onClick={() => {
                    currentOnTabChange(tab.id);
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
