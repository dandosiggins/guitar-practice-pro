import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Music, 
  Search, 
  Plus, 
  Play, 
  Clock, 
  Users, 
  Star,
  Filter,
  Heart,
  ExternalLink,
  Shuffle,
  Edit
} from 'lucide-react';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import type { Song, SongCollection } from '@shared/schema';
import PracticeTimer from '@/components/practice-timer';

interface SearchFilters {
  genre: string;
  difficulty: string;
  artist: string;
}

// Form validation schema for creating collections
const createCollectionSchema = z.object({
  name: z.string().min(1, "Collection name is required").max(100, "Name must be less than 100 characters"),
  description: z.string().optional(),
  category: z.enum(['genre', 'difficulty', 'artist', 'custom']).optional(),
  isPublic: z.boolean().default(false)
});

type CreateCollectionFormData = z.infer<typeof createCollectionSchema>;

export default function SongsPage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({
    genre: 'all',
    difficulty: 'all', 
    artist: ''
  });
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [showAddSong, setShowAddSong] = useState(false);
  const [showCreateCollection, setShowCreateCollection] = useState(false);
  const [activeTab, setActiveTab] = useState('library');
  const [practiceModalSong, setPracticeModalSong] = useState<Song | null>(null);
  const [editingChords, setEditingChords] = useState(false);
  const [chordInput, setChordInput] = useState('');
  const [practiceNotes, setPracticeNotes] = useState('');

  // Fetch songs with search and filters
  const { data: songs = [], isLoading: songsLoading } = useQuery<Song[]>({
    queryKey: ['/api/songs', searchQuery, filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.set('q', searchQuery);
      if (filters.genre !== 'all') params.set('genre', filters.genre);
      if (filters.difficulty !== 'all') params.set('difficulty', filters.difficulty);
      if (filters.artist) params.set('artist', filters.artist);
      
      const url = `/api/songs?${params.toString()}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch songs');
      }
      return response.json();
    },
    enabled: activeTab === 'library'
  });

  // Fetch song collections
  const { data: collections = [], isLoading: collectionsLoading } = useQuery<SongCollection[]>({
    queryKey: ['/api/song-collections'],
    queryFn: async () => {
      const response = await fetch('/api/song-collections');
      if (!response.ok) {
        throw new Error('Failed to fetch song collections');
      }
      return response.json();
    },
    enabled: activeTab === 'collections'
  });

  // Search Spotify tracks
  const searchSpotifyMutation = useMutation({
    mutationFn: async (query: string) => {
      const response = await fetch(`/api/spotify/search?q=${encodeURIComponent(query)}`);
      return response.json();
    },
    onError: (error) => {
      toast({
        title: "Search failed",
        description: "Could not search Spotify tracks",
        variant: "destructive"
      });
    }
  });

  // Add song from Spotify
  const addSongFromSpotifyMutation = useMutation({
    mutationFn: async (spotifyTrack: any) => {
      console.log('=== Mutation function started ===');
      console.log('Input track:', spotifyTrack);
      
      try {
        console.log('Making API request...');
        const response = await apiRequest('POST', '/api/songs/from-spotify', {
          spotifyTrack
        });
        console.log('API request successful:', response);
        return response.json();
      } catch (error) {
        console.error('API request failed:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log('=== Mutation SUCCESS ===', data);
      queryClient.invalidateQueries({ queryKey: ['/api/songs'] });
      toast({
        title: "Song added!",
        description: "Successfully added song to your library"
      });
    },
    onError: (error) => {
      console.error('=== Mutation ERROR ===', error);
      toast({
        title: "Failed to add song",
        description: "Please try again",
        variant: "destructive"
      });
    }
  });

  // Create collection mutation
  const createCollectionMutation = useMutation({
    mutationFn: async (collectionData: CreateCollectionFormData) => {
      return apiRequest('POST', '/api/song-collections', {
        ...collectionData,
        songIds: [] // Start with empty collection
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/song-collections'] });
      setShowCreateCollection(false);
      toast({
        title: "Collection created!",
        description: "Your new song collection has been created"
      });
    },
    onError: () => {
      toast({
        title: "Failed to create collection",
        description: "Please try again",
        variant: "destructive"
      });
    }
  });

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleFilterChange = (key: keyof SearchFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({ genre: 'all', difficulty: 'all', artist: '' });
    setSearchQuery('');
  };

  const handleSpotifySearch = () => {
    if (searchQuery.trim()) {
      searchSpotifyMutation.mutate(searchQuery);
    }
  };

  const handleAddFromSpotify = (track: any) => {
    addSongFromSpotifyMutation.mutate(track);
  };

  // Form for creating collections
  const createCollectionForm = useForm<CreateCollectionFormData>({
    resolver: zodResolver(createCollectionSchema),
    defaultValues: {
      name: '',
      description: '',
      category: 'custom',
      isPublic: true // Make collections public by default since there's no user authentication
    }
  });

  const handleCreateCollection = () => {
    setShowCreateCollection(true);
  };

  const onCreateCollectionSubmit = (data: CreateCollectionFormData) => {
    createCollectionMutation.mutate(data);
  };

  const getDifficultyColor = (difficulty: number | null) => {
    if (!difficulty) return 'bg-gray-500';
    const colors = {
      1: 'bg-green-500',
      2: 'bg-lime-500', 
      3: 'bg-yellow-500',
      4: 'bg-orange-500',
      5: 'bg-red-500'
    };
    return colors[difficulty as keyof typeof colors] || colors[1];
  };

  const getDifficultyLabel = (difficulty: number | null) => {
    if (!difficulty) return 'Unknown';
    const labels = {
      1: 'Beginner',
      2: 'Easy',
      3: 'Intermediate', 
      4: 'Advanced',
      5: 'Expert'
    };
    return labels[difficulty as keyof typeof labels] || 'Unknown';
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Song Library</h1>
        <p className="text-slate-400">
          Build your personal collection of songs to practice with chord progressions, tempo tracking, and more.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-slate-800">
          <TabsTrigger 
            value="library" 
            className="data-[state=active]:bg-slate-700 text-slate-300"
            data-testid="tab-library"
          >
            <Music className="w-4 h-4 mr-2" />
            My Library
          </TabsTrigger>
          <TabsTrigger 
            value="collections" 
            className="data-[state=active]:bg-slate-700 text-slate-300"
            data-testid="tab-collections"
          >
            <Users className="w-4 h-4 mr-2" />
            Collections
          </TabsTrigger>
          <TabsTrigger 
            value="discover" 
            className="data-[state=active]:bg-slate-700 text-slate-300"
            data-testid="tab-discover"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Add from Spotify
          </TabsTrigger>
        </TabsList>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 my-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search songs, artists, or albums..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 bg-slate-800 border-slate-700 text-white"
              data-testid="input-search-songs"
            />
          </div>
          
          <div className="flex gap-2">
            <Select value={filters.genre} onValueChange={(value) => handleFilterChange('genre', value)}>
              <SelectTrigger className="w-32 bg-slate-800 border-slate-700 text-white" data-testid="select-genre">
                <SelectValue placeholder="Genre" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="all">All Genres</SelectItem>
                <SelectItem value="rock">Rock</SelectItem>
                <SelectItem value="pop">Pop</SelectItem>
                <SelectItem value="country">Country</SelectItem>
                <SelectItem value="blues">Blues</SelectItem>
                <SelectItem value="folk">Folk</SelectItem>
                <SelectItem value="jazz">Jazz</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.difficulty} onValueChange={(value) => handleFilterChange('difficulty', value)}>
              <SelectTrigger className="w-32 bg-slate-800 border-slate-700 text-white" data-testid="select-difficulty">
                <SelectValue placeholder="Level" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="1">Beginner</SelectItem>
                <SelectItem value="2">Easy</SelectItem>
                <SelectItem value="3">Intermediate</SelectItem>
                <SelectItem value="4">Advanced</SelectItem>
                <SelectItem value="5">Expert</SelectItem>
              </SelectContent>
            </Select>

            {(searchQuery || filters.genre !== 'all' || filters.difficulty !== 'all' || filters.artist) && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="border-slate-700 text-slate-300 hover:bg-slate-700"
                data-testid="button-clear-filters"
              >
                <Filter className="w-4 h-4 mr-1" />
                Clear
              </Button>
            )}
          </div>
        </div>

        <TabsContent value="library" className="mt-6">
          {songsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="bg-slate-800 border-slate-700 animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-4 bg-slate-700 rounded mb-2" />
                    <div className="h-3 bg-slate-700 rounded mb-4 w-2/3" />
                    <div className="flex gap-2 mb-3">
                      <div className="h-5 bg-slate-700 rounded px-2 py-1 w-16" />
                      <div className="h-5 bg-slate-700 rounded px-2 py-1 w-12" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : songs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(songs as Song[]).map((song: Song) => (
                <Card 
                  key={song.id} 
                  className="bg-slate-800 border-slate-700 hover:border-slate-600 transition-colors cursor-pointer"
                  onClick={() => setSelectedSong(song)}
                  data-testid={`card-song-${song.id}`}
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg text-white flex items-center justify-between">
                      <span className="truncate">{song.title}</span>
                      {song.spotifyId && (
                        <ExternalLink className="w-4 h-4 text-green-500 flex-shrink-0" />
                      )}
                    </CardTitle>
                    <p className="text-slate-400 text-sm truncate">{song.artist}</p>
                    {song.album && (
                      <p className="text-slate-500 text-xs truncate">{song.album}</p>
                    )}
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex flex-wrap gap-2 mb-3">
                      <Badge 
                        className={`${getDifficultyColor(song.difficulty)} text-white text-xs`}
                        data-testid={`badge-difficulty-${song.id}`}
                      >
                        {getDifficultyLabel(song.difficulty)}
                      </Badge>
                      {song.key && (
                        <Badge variant="outline" className="border-slate-600 text-slate-300 text-xs">
                          Key: {song.key}
                        </Badge>
                      )}
                      {song.tempo && (
                        <Badge variant="outline" className="border-slate-600 text-slate-300 text-xs">
                          {song.tempo} BPM
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      {song.duration && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {Math.floor(song.duration / 60)}:{(song.duration % 60).toString().padStart(2, '0')}
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Music className="w-3 h-3" />
                        {song.timeSignature || '4/4'}
                      </div>
                    </div>
                    
                    <div className="flex gap-2 mt-4">
                      <Button 
                        size="sm" 
                        className="flex-1 bg-blue-600 hover:bg-blue-500"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPracticeModalSong(song);
                          setPracticeNotes(song.notes || '');
                        }}
                        data-testid={`button-practice-${song.id}`}
                      >
                        <Play className="w-4 h-4 mr-1" />
                        Practice
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="border-slate-600 text-slate-300 hover:bg-slate-700"
                        data-testid={`button-favorite-${song.id}`}
                      >
                        <Heart className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Music className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-300 mb-2">No songs found</h3>
              <p className="text-slate-500 mb-4">
                {searchQuery || filters.genre !== 'all' || filters.difficulty !== 'all' 
                  ? 'Try adjusting your search or filters'
                  : 'Add songs to your library to get started'
                }
              </p>
              <Button 
                onClick={() => setActiveTab('discover')} 
                className="bg-blue-600 hover:bg-blue-500"
                data-testid="button-add-first-song"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Songs from Spotify
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="discover" className="mt-6">
          <Card className="bg-slate-800 border-slate-700 mb-6">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <ExternalLink className="w-5 h-5 text-green-500" />
                Search Spotify
              </CardTitle>
              <p className="text-slate-400">Find songs on Spotify and add them to your library with chord progressions.</p>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  placeholder="Search for songs, artists, or albums on Spotify..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSpotifySearch()}
                  className="bg-slate-900 border-slate-700 text-white"
                  data-testid="input-spotify-search"
                />
                <Button 
                  onClick={handleSpotifySearch}
                  disabled={searchSpotifyMutation.isPending || !searchQuery.trim()}
                  className="bg-green-600 hover:bg-green-500"
                  data-testid="button-spotify-search"
                >
                  <Search className="w-4 h-4 mr-2" />
                  Search
                </Button>
              </div>
            </CardContent>
          </Card>

          {searchSpotifyMutation.isPending && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-4" />
              <p className="text-slate-400">Searching Spotify...</p>
            </div>
          )}

          {searchSpotifyMutation.data && searchSpotifyMutation.data.tracks && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Search Results</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {searchSpotifyMutation.data.tracks.items?.map((track: any) => (
                  <Card key={track.id} className="bg-slate-800 border-slate-700">
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        {track.album?.images?.[2] && (
                          <img 
                            src={track.album.images[2].url} 
                            alt={track.album.name}
                            className="w-16 h-16 rounded"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-white truncate">{track.name}</h4>
                          <p className="text-slate-400 text-sm truncate">
                            {track.artists.map((a: any) => a.name).join(', ')}
                          </p>
                          <p className="text-slate-500 text-xs truncate">{track.album.name}</p>
                          <p className="text-slate-500 text-xs mt-1">
                            {Math.floor(track.duration_ms / 60000)}:{((track.duration_ms % 60000) / 1000).toFixed(0).padStart(2, '0')}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleAddFromSpotify(track)}
                          disabled={addSongFromSpotifyMutation.isPending}
                          className="bg-blue-600 hover:bg-blue-500 self-start"
                          data-testid={`button-add-spotify-${track.id}`}
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Add
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="collections" className="mt-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold text-white">Song Collections</h2>
              <p className="text-slate-400">Organize your songs into practice collections</p>
            </div>
            <Button 
              onClick={handleCreateCollection}
              className="bg-blue-600 hover:bg-blue-500" 
              data-testid="button-create-collection"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Collection
            </Button>
          </div>

          {collectionsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="bg-slate-800 border-slate-700 animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-4 bg-slate-700 rounded mb-2" />
                    <div className="h-3 bg-slate-700 rounded mb-4 w-2/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : collections.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {collections.map((collection: SongCollection) => (
                <Card 
                  key={collection.id} 
                  className="bg-slate-800 border-slate-700 hover:border-slate-600 transition-colors cursor-pointer"
                  data-testid={`card-collection-${collection.id}`}
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg text-white flex items-center justify-between">
                      <span className="truncate">{collection.name}</span>
                      <Users className="w-4 h-4 text-blue-500 flex-shrink-0" />
                    </CardTitle>
                    {collection.description && (
                      <p className="text-slate-400 text-sm">{collection.description}</p>
                    )}
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex flex-wrap gap-2 mb-3">
                      {collection.category && (
                        <Badge variant="outline" className="border-slate-600 text-slate-300 text-xs">
                          {collection.category}
                        </Badge>
                      )}
                      <Badge variant="outline" className="border-slate-600 text-slate-300 text-xs">
                        {(collection.songIds as string[])?.length || 0} songs
                      </Badge>
                      {collection.isPublic && (
                        <Badge variant="outline" className="border-green-600 text-green-400 text-xs">
                          Public
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex gap-2 mt-4">
                      <Button 
                        size="sm" 
                        className="flex-1 bg-blue-600 hover:bg-blue-500"
                        data-testid={`button-open-collection-${collection.id}`}
                      >
                        <Music className="w-4 h-4 mr-1" />
                        Open
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="border-slate-600 text-slate-300 hover:bg-slate-700"
                        data-testid={`button-edit-collection-${collection.id}`}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-300 mb-2">No collections yet</h3>
              <p className="text-slate-500 mb-4">Create collections to organize your songs by genre, difficulty, or practice focus</p>
              <Button 
                onClick={handleCreateCollection}
                className="bg-blue-600 hover:bg-blue-500" 
                data-testid="button-create-first-collection"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Collection
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Song Details Modal */}
      {selectedSong && (
        <Dialog open={!!selectedSong} onOpenChange={() => setSelectedSong(null)}>
          <DialogContent className="max-w-2xl bg-slate-800 border-slate-700">
            <DialogHeader>
              <DialogTitle className="text-white text-xl">
                {selectedSong.title}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <p className="text-slate-400 text-lg">{selectedSong.artist}</p>
                {selectedSong.album && (
                  <p className="text-slate-500">{selectedSong.album}</p>
                )}
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Badge className={`${getDifficultyColor(selectedSong.difficulty)} text-white`}>
                  {getDifficultyLabel(selectedSong.difficulty)}
                </Badge>
                {selectedSong.key && (
                  <Badge variant="outline" className="border-slate-600 text-slate-300">
                    Key: {selectedSong.key}
                  </Badge>
                )}
                {selectedSong.tempo && (
                  <Badge variant="outline" className="border-slate-600 text-slate-300">
                    {selectedSong.tempo} BPM
                  </Badge>
                )}
                <Badge variant="outline" className="border-slate-600 text-slate-300">
                  {selectedSong.timeSignature || '4/4'}
                </Badge>
              </div>

              {selectedSong.notes && (
                <div>
                  <h4 className="font-semibold text-white mb-2">Practice Notes</h4>
                  <p className="text-slate-300 bg-slate-900 p-3 rounded">{selectedSong.notes}</p>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button className="flex-1 bg-blue-600 hover:bg-blue-500" data-testid="button-start-practice">
                  <Play className="w-4 h-4 mr-2" />
                  Start Practice Session
                </Button>
                <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                  <Heart className="w-4 h-4 mr-2" />
                  Add to Favorites
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Create Collection Dialog */}
      <Dialog open={showCreateCollection} onOpenChange={setShowCreateCollection}>
        <DialogContent className="max-w-md bg-slate-800 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white">Create New Collection</DialogTitle>
          </DialogHeader>
          <Form {...createCollectionForm}>
            <form onSubmit={createCollectionForm.handleSubmit(onCreateCollectionSubmit)} className="space-y-4">
              <FormField
                control={createCollectionForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Collection Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter collection name..."
                        {...field}
                        className="bg-slate-900 border-slate-700 text-white"
                        data-testid="input-collection-name"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={createCollectionForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe your collection..."
                        {...field}
                        className="bg-slate-900 border-slate-700 text-white"
                        data-testid="textarea-collection-description"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={createCollectionForm.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Category</FormLabel>
                    <FormControl>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger className="bg-slate-900 border-slate-700 text-white" data-testid="select-collection-category">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700">
                          <SelectItem value="custom">Custom</SelectItem>
                          <SelectItem value="genre">Genre</SelectItem>
                          <SelectItem value="difficulty">Difficulty</SelectItem>
                          <SelectItem value="artist">Artist</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateCollection(false)}
                  className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700"
                  data-testid="button-cancel-collection"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createCollectionMutation.isPending}
                  className="flex-1 bg-blue-600 hover:bg-blue-500"
                  data-testid="button-submit-collection"
                >
                  {createCollectionMutation.isPending ? 'Creating...' : 'Create Collection'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Practice Modal */}
      {practiceModalSong && (
        <Dialog open={!!practiceModalSong} onOpenChange={() => setPracticeModalSong(null)}>
          <DialogContent className="max-w-3xl bg-slate-800 border-slate-700">
            <DialogHeader>
              <DialogTitle className="text-white text-xl flex items-center gap-2">
                <Play className="w-5 h-5 text-blue-500" />
                Practice: {practiceModalSong.title}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              {/* Song Info */}
              <div className="bg-slate-900 p-4 rounded-lg">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-slate-400">Artist:</span>
                    <p className="text-white font-medium">{practiceModalSong.artist}</p>
                  </div>
                  {practiceModalSong.key && (
                    <div>
                      <span className="text-slate-400">Key:</span>
                      <p className="text-white font-medium">{practiceModalSong.key}</p>
                    </div>
                  )}
                  {practiceModalSong.tempo && (
                    <div>
                      <span className="text-slate-400">Tempo:</span>
                      <p className="text-white font-medium">{practiceModalSong.tempo} BPM</p>
                    </div>
                  )}
                  <div>
                    <span className="text-slate-400">Time Signature:</span>
                    <p className="text-white font-medium">{practiceModalSong.timeSignature || '4/4'}</p>
                  </div>
                </div>
              </div>

              {/* Practice Tools */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Practice Timer */}
                <PracticeTimer 
                  onComplete={async (durationMinutes) => {
                    try {
                      await fetch('/api/song-practice-sessions', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          userId: 'default-user',
                          songId: practiceModalSong.id,
                          practiceType: 'full_song',
                          duration: durationMinutes,
                          practiceDate: new Date().toISOString(),
                          completed: true
                        })
                      });
                      
                      toast({
                        title: "Practice session saved!",
                        description: `You practiced for ${durationMinutes} minutes`
                      });
                    } catch (error) {
                      console.error('Failed to save practice session:', error);
                    }
                  }}
                />

                {/* Chord Progression Section */}
                <div className="bg-slate-900 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-white font-semibold">Chord Progression</h4>
                    <Button 
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditingChords(!editingChords);
                        if (!editingChords && practiceModalSong.chordProgression) {
                          setChordInput((practiceModalSong.chordProgression as any[]).join(' '));
                        }
                      }}
                      className="border-slate-600 text-slate-300"
                    >
                      {editingChords ? 'Cancel' : 'Edit'}
                    </Button>
                  </div>

                  {editingChords ? (
                    <div className="space-y-3">
                      <Input
                        placeholder="Enter chords separated by spaces (e.g., C G Am F)"
                        value={chordInput}
                        onChange={(e) => setChordInput(e.target.value)}
                        className="bg-slate-800 border-slate-700 text-white"
                      />
                      <Button 
                        onClick={async () => {
                          const chords = chordInput.split(' ').filter(c => c.trim());
                          
                          try {
                            await fetch(`/api/songs/${practiceModalSong.id}`, {
                              method: 'PATCH',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                chordProgression: chords
                              })
                            });
                            
                            practiceModalSong.chordProgression = chords as any;
                            setEditingChords(false);
                            setChordInput('');
                            
                            toast({
                              title: "Chord progression saved!",
                              description: "Your chords have been saved to this song"
                            });
                          } catch (error) {
                            console.error('Failed to save chords:', error);
                          }
                        }}
                        className="bg-blue-600 hover:bg-blue-500"
                      >
                        Save Chords
                      </Button>
                    </div>
                  ) : (
                    <div>
                      {practiceModalSong.chordProgression && 
                       Array.isArray(practiceModalSong.chordProgression) && 
                       (practiceModalSong.chordProgression as any[]).length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {(practiceModalSong.chordProgression as any[]).map((chord, index) => (
                            <div 
                              key={index}
                              className="bg-slate-800 border-2 border-blue-500 text-white px-4 py-2 rounded-lg font-semibold text-lg"
                            >
                              {chord}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-slate-400 text-sm">
                          No chord progression added yet. Click Edit to add chords.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Practice Notes */}
              <div>
                <h4 className="text-white font-semibold mb-2">Practice Notes</h4>
                <textarea 
                  className="w-full h-24 bg-slate-900 border-slate-700 text-white p-3 rounded mb-2"
                  placeholder="Add your practice notes for this song..."
                  value={practiceNotes}
                  onChange={(e) => setPracticeNotes(e.target.value)}
                />
                <Button
                  size="sm"
                  onClick={async () => {
                    try {
                      await fetch(`/api/songs/${practiceModalSong.id}`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          notes: practiceNotes
                        })
                      });
                      
                      practiceModalSong.notes = practiceNotes;
                      
                      toast({
                        title: "Notes saved!",
                        description: "Your practice notes have been saved"
                      });
                    } catch (error) {
                      console.error('Failed to save notes:', error);
                    }
                  }}
                  className="bg-blue-600 hover:bg-blue-500"
                >
                  Save Notes
                </Button>
              </div>

              <div className="flex gap-3">
  {practiceModalSong.spotifyId && (
    <Button 
      className="flex-1 bg-green-600 hover:bg-green-500"
      onClick={() => window.open(`https://open.spotify.com/track/${practiceModalSong.spotifyId}`, '_blank')}
    >
      <ExternalLink className="w-4 h-4 mr-2" />
      Open in Spotify
    </Button>
  )}
                <Button 
                  className="flex-1 bg-blue-600 hover:bg-blue-500"
                  onClick={() => {
                    setPracticeModalSong(null);
                    setSelectedSong(practiceModalSong);
                  }}
                >
                  Song Details
                </Button>
                <Button 
                  variant="outline" 
                  className="border-slate-600 text-slate-300"
                  onClick={() => setPracticeModalSong(null)}
                >
                  Close
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}