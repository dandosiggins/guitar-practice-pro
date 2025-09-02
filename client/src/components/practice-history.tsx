import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  History, 
  Clock,
  Target,
  TrendingUp,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Filter
} from 'lucide-react';

interface PracticeHistoryEntry {
  id: string;
  sessionTitle: string;
  exercises: any[];
  totalDuration: number;
  completedExercises: number;
  totalExercises: number;
  practiceDate: Date;
  notes?: string;
}

const mockHistory: PracticeHistoryEntry[] = [
  {
    id: '1',
    sessionTitle: 'Morning Practice',
    exercises: [
      { title: 'Warm-up', duration: 5, completed: true },
      { title: 'Chord Practice', duration: 15, completed: true },
      { title: 'Scale Practice', duration: 10, completed: true }
    ],
    totalDuration: 30,
    completedExercises: 3,
    totalExercises: 3,
    practiceDate: new Date(),
    notes: 'Great session! Finally nailed the F chord transitions.'
  },
  {
    id: '2',
    sessionTitle: 'Evening Session',
    exercises: [
      { title: 'Technique Practice', duration: 20, completed: true },
      { title: 'Song Practice', duration: 25, completed: false }
    ],
    totalDuration: 35,
    completedExercises: 1,
    totalExercises: 2,
    practiceDate: new Date(Date.now() - 86400000), // Yesterday
    notes: 'Focused on alternate picking. Need more work on "Wonderwall".'
  },
  {
    id: '3',
    sessionTitle: 'Weekend Practice',
    exercises: [
      { title: 'Scale Mastery', duration: 20, completed: true },
      { title: 'Chord Progressions', duration: 20, completed: true },
      { title: 'Song Learning', duration: 15, completed: true }
    ],
    totalDuration: 55,
    completedExercises: 3,
    totalExercises: 3,
    practiceDate: new Date(Date.now() - 172800000), // 2 days ago
  },
  {
    id: '4',
    sessionTitle: 'Quick Practice',
    exercises: [
      { title: 'Warm-up', duration: 5, completed: true },
      { title: 'Chord Changes', duration: 10, completed: true }
    ],
    totalDuration: 15,
    completedExercises: 2,
    totalExercises: 2,
    practiceDate: new Date(Date.now() - 259200000), // 3 days ago
  },
  {
    id: '5',
    sessionTitle: 'Technique Focus',
    exercises: [
      { title: 'Alternate Picking', duration: 15, completed: true },
      { title: 'Legato Practice', duration: 15, completed: true },
      { title: 'String Skipping', duration: 10, completed: false }
    ],
    totalDuration: 30,
    completedExercises: 2,
    totalExercises: 3,
    practiceDate: new Date(Date.now() - 345600000), // 4 days ago
  }
];

const mockStats = {
  totalSessions: 12,
  totalMinutes: 420,
  averageCompletionRate: 85,
  averageSessionLength: 35,
  currentStreak: 5,
  longestStreak: 8
};

export default function PracticeHistory() {
  const [history, setHistory] = useState(mockHistory);
  const [filterPeriod, setFilterPeriod] = useState('week'); // week, month, all
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getCompletionRate = (completed: number, total: number) => {
    return Math.round((completed / total) * 100);
  };

  const filteredHistory = history.filter(entry => {
    const entryDate = new Date(entry.practiceDate);
    const now = new Date();
    
    if (filterPeriod === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return entryDate >= weekAgo;
    } else if (filterPeriod === 'month') {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      return entryDate >= monthAgo;
    }
    return true; // 'all'
  });

  const totalPages = Math.ceil(filteredHistory.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedHistory = filteredHistory.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <History className="text-[#6366f1]" size={32} />
          <div>
            <h1 className="text-3xl font-bold text-white">Practice History</h1>
            <p className="text-slate-400">Track your progress and review past sessions</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Filter className="text-slate-400" size={16} />
          <select
            value={filterPeriod}
            onChange={(e) => setFilterPeriod(e.target.value)}
            className="bg-slate-700 border border-slate-600 text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#6366f1]"
            data-testid="select-filter-period"
          >
            <option value="week">Past Week</option>
            <option value="month">Past Month</option>
            <option value="all">All Time</option>
          </select>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-dark-panel border-slate-700">
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-[#6366f1] mb-1">{mockStats.totalSessions}</div>
            <div className="text-slate-400 text-sm">Total Sessions</div>
          </CardContent>
        </Card>
        
        <Card className="bg-dark-panel border-slate-700">
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-[#f59e0b] mb-1">{formatDuration(mockStats.totalMinutes)}</div>
            <div className="text-slate-400 text-sm">Total Practice Time</div>
          </CardContent>
        </Card>
        
        <Card className="bg-dark-panel border-slate-700">
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-green-400 mb-1">{mockStats.averageCompletionRate}%</div>
            <div className="text-slate-400 text-sm">Avg Completion Rate</div>
          </CardContent>
        </Card>
        
        <Card className="bg-dark-panel border-slate-700">
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-purple-400 mb-1">{mockStats.currentStreak}</div>
            <div className="text-slate-400 text-sm">Current Streak (days)</div>
          </CardContent>
        </Card>
      </div>

      {/* Practice History List */}
      <Card className="bg-dark-panel border-slate-700">
        <CardContent className="p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Recent Sessions</h2>
            <div className="text-slate-400 text-sm">
              Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredHistory.length)} of {filteredHistory.length}
            </div>
          </div>
          
          <div className="space-y-4">
            {paginatedHistory.map((entry) => {
              const completionRate = getCompletionRate(entry.completedExercises, entry.totalExercises);
              
              return (
                <Card key={entry.id} className="bg-slate-800 border-slate-600 hover:border-slate-500 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-white">{entry.sessionTitle}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            completionRate === 100 
                              ? 'bg-green-600/20 text-green-400' 
                              : completionRate >= 80 
                              ? 'bg-yellow-600/20 text-yellow-400'
                              : 'bg-red-600/20 text-red-400'
                          }`}>
                            {completionRate}% Complete
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-6 text-sm text-slate-400 mb-3">
                          <div className="flex items-center space-x-2">
                            <Calendar size={14} />
                            <span>{formatDate(entry.practiceDate)}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Clock size={14} />
                            <span>{formatDuration(entry.totalDuration)}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Target size={14} />
                            <span>{entry.completedExercises}/{entry.totalExercises} exercises</span>
                          </div>
                        </div>
                        
                        <div className="mb-3">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-slate-300 text-sm">Session Progress</span>
                            <span className="text-slate-300 text-sm">{completionRate}%</span>
                          </div>
                          <Progress value={completionRate} className="h-2 bg-slate-700" />
                        </div>
                        
                        {entry.notes && (
                          <div className="bg-slate-700/50 rounded-md p-3 mt-3">
                            <p className="text-slate-300 text-sm italic">"{entry.notes}"</p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="border-t border-slate-600 pt-4">
                      <h4 className="text-white font-medium mb-2">Exercises:</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                        {entry.exercises.map((exercise, index) => (
                          <div 
                            key={index}
                            className={`flex items-center justify-between text-sm p-2 rounded ${
                              exercise.completed 
                                ? 'bg-green-600/10 text-green-400' 
                                : 'bg-red-600/10 text-red-400'
                            }`}
                          >
                            <span>{exercise.title}</span>
                            <span>{formatDuration(exercise.duration)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center space-x-4 mt-8">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="text-slate-400 hover:text-white disabled:opacity-50"
                data-testid="button-prev-page"
              >
                <ChevronLeft size={16} className="mr-1" />
                Previous
              </Button>
              
              <div className="flex items-center space-x-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <Button
                    key={page}
                    variant={page === currentPage ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                    className={page === currentPage 
                      ? "bg-[#6366f1] text-white" 
                      : "text-slate-400 hover:text-white"
                    }
                    data-testid={`button-page-${page}`}
                  >
                    {page}
                  </Button>
                ))}
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="text-slate-400 hover:text-white disabled:opacity-50"
                data-testid="button-next-page"
              >
                Next
                <ChevronRight size={16} className="ml-1" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Progress Trends */}
      <Card className="bg-dark-panel border-slate-700">
        <CardContent className="p-8">
          <div className="flex items-center space-x-3 mb-6">
            <TrendingUp className="text-[#6366f1]" size={20} />
            <h3 className="text-xl font-bold text-white">Progress Trends</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="text-white font-medium mb-4">Practice Consistency</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-slate-300 text-sm">Current Streak</span>
                  <span className="text-[#6366f1] font-semibold">{mockStats.currentStreak} days</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-300 text-sm">Longest Streak</span>
                  <span className="text-slate-300 font-semibold">{mockStats.longestStreak} days</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-300 text-sm">Avg Session Length</span>
                  <span className="text-slate-300 font-semibold">{formatDuration(mockStats.averageSessionLength)}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-white font-medium mb-4">Recent Achievements</h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-slate-300">Completed 5 perfect sessions in a row</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <div className="w-2 h-2 bg-[#6366f1] rounded-full"></div>
                  <span className="text-slate-300">Practiced for 7+ hours this week</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <div className="w-2 h-2 bg-[#f59e0b] rounded-full"></div>
                  <span className="text-slate-300">Maintained 5-day practice streak</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}