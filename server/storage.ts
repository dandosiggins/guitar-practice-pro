import { 
  type User, 
  type InsertUser, 
  type PracticeSession,
  type InsertPracticeSession,
  type PracticeGoal,
  type InsertPracticeGoal,
  type ChordProgression,
  type InsertChordProgression,
  type PracticeSchedule,
  type InsertPracticeSchedule,
  type PracticeHistory,
  type InsertPracticeHistory,
  type Song,
  type InsertSong,
  type SongCollection,
  type InsertSongCollection,
  type SongPracticeSession,
  type InsertSongPracticeSession
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  createPracticeSession(session: InsertPracticeSession): Promise<PracticeSession>;
  getUserPracticeSessions(userId: string): Promise<PracticeSession[]>;
  updatePracticeSession(id: string, updates: Partial<PracticeSession>): Promise<PracticeSession | undefined>;
  
  createPracticeGoal(goal: InsertPracticeGoal): Promise<PracticeGoal>;
  getUserPracticeGoals(userId: string): Promise<PracticeGoal[]>;
  updatePracticeGoal(id: string, updates: Partial<PracticeGoal>): Promise<PracticeGoal | undefined>;
  
  createChordProgression(progression: InsertChordProgression): Promise<ChordProgression>;
  getUserChordProgressions(userId: string): Promise<ChordProgression[]>;
  deleteChordProgression(id: string): Promise<boolean>;
  
  createPracticeSchedule(schedule: InsertPracticeSchedule): Promise<PracticeSchedule>;
  getUserPracticeSchedules(userId: string): Promise<PracticeSchedule[]>;
  updatePracticeSchedule(id: string, updates: Partial<PracticeSchedule>): Promise<PracticeSchedule | undefined>;
  deletePracticeSchedule(id: string): Promise<boolean>;
  
  createPracticeHistoryEntry(history: InsertPracticeHistory): Promise<PracticeHistory>;
  getUserPracticeHistory(userId: string, limit?: number, offset?: number): Promise<PracticeHistory[]>;
  getPracticeStats(userId: string, days: number): Promise<any>;
  
  // Song management
  createSong(song: InsertSong): Promise<Song>;
  getSong(id: string): Promise<Song | undefined>;
  searchSongs(query: string, filters?: { genre?: string; difficulty?: number; artist?: string }): Promise<Song[]>;
  updateSong(id: string, updates: Partial<Song>): Promise<Song | undefined>;
  deleteSong(id: string): Promise<boolean>;
  getSongBySpotifyId(spotifyId: string): Promise<Song | undefined>;
  
  // Song collection management
  createSongCollection(collection: InsertSongCollection): Promise<SongCollection>;
  getSongCollection(id: string): Promise<SongCollection | undefined>;
  getUserSongCollections(userId?: string): Promise<SongCollection[]>;
  updateSongCollection(id: string, updates: Partial<SongCollection>): Promise<SongCollection | undefined>;
  deleteSongCollection(id: string): Promise<boolean>;
  addSongToCollection(collectionId: string, songId: string): Promise<boolean>;
  removeSongFromCollection(collectionId: string, songId: string): Promise<boolean>;
  
  // Song practice session management
  createSongPracticeSession(session: InsertSongPracticeSession): Promise<SongPracticeSession>;
  getUserSongPracticeSessions(userId: string, songId?: string): Promise<SongPracticeSession[]>;
  updateSongPracticeSession(id: string, updates: Partial<SongPracticeSession>): Promise<SongPracticeSession | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private practiceSessions: Map<string, PracticeSession>;
  private practiceGoals: Map<string, PracticeGoal>;
  private chordProgressions: Map<string, ChordProgression>;
  private practiceSchedules: Map<string, PracticeSchedule>;
  private practiceHistory: Map<string, PracticeHistory>;
  private songs: Map<string, Song>;
  private songCollections: Map<string, SongCollection>;
  private songPracticeSessions: Map<string, SongPracticeSession>;

  constructor() {
    this.users = new Map();
    this.practiceSessions = new Map();
    this.practiceGoals = new Map();
    this.chordProgressions = new Map();
    this.practiceSchedules = new Map();
    this.practiceHistory = new Map();
    this.songs = new Map();
    this.songCollections = new Map();
    this.songPracticeSessions = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createPracticeSession(insertSession: InsertPracticeSession): Promise<PracticeSession> {
    const id = randomUUID();
    const session: PracticeSession = { 
      ...insertSession, 
      id,
      userId: insertSession.userId || null,
      endTime: insertSession.endTime || null,
      completed: insertSession.completed || false
    };
    this.practiceSessions.set(id, session);
    return session;
  }

  async getUserPracticeSessions(userId: string): Promise<PracticeSession[]> {
    return Array.from(this.practiceSessions.values()).filter(
      (session) => session.userId === userId,
    );
  }

  async updatePracticeSession(id: string, updates: Partial<PracticeSession>): Promise<PracticeSession | undefined> {
    const session = this.practiceSessions.get(id);
    if (!session) return undefined;
    
    const updated = { ...session, ...updates };
    this.practiceSessions.set(id, updated);
    return updated;
  }

  async createPracticeGoal(insertGoal: InsertPracticeGoal): Promise<PracticeGoal> {
    const id = randomUUID();
    const goal: PracticeGoal = { 
      ...insertGoal, 
      id, 
      createdAt: new Date(),
      userId: insertGoal.userId || null,
      description: insertGoal.description || null,
      progress: insertGoal.progress || 0,
      completed: insertGoal.completed || false,
      targetDate: insertGoal.targetDate || null
    };
    this.practiceGoals.set(id, goal);
    return goal;
  }

  async getUserPracticeGoals(userId: string): Promise<PracticeGoal[]> {
    return Array.from(this.practiceGoals.values()).filter(
      (goal) => goal.userId === userId,
    );
  }

  async updatePracticeGoal(id: string, updates: Partial<PracticeGoal>): Promise<PracticeGoal | undefined> {
    const goal = this.practiceGoals.get(id);
    if (!goal) return undefined;
    
    const updated = { ...goal, ...updates };
    this.practiceGoals.set(id, updated);
    return updated;
  }

  async createChordProgression(insertProgression: InsertChordProgression): Promise<ChordProgression> {
    const id = randomUUID();
    const progression: ChordProgression = { 
      ...insertProgression, 
      id, 
      createdAt: new Date(),
      userId: insertProgression.userId || null
    };
    this.chordProgressions.set(id, progression);
    return progression;
  }

  async getUserChordProgressions(userId: string): Promise<ChordProgression[]> {
    return Array.from(this.chordProgressions.values()).filter(
      (progression) => progression.userId === userId,
    );
  }

  async deleteChordProgression(id: string): Promise<boolean> {
    return this.chordProgressions.delete(id);
  }

  async createPracticeSchedule(insertSchedule: InsertPracticeSchedule): Promise<PracticeSchedule> {
    const id = randomUUID();
    const schedule: PracticeSchedule = { 
      ...insertSchedule, 
      id, 
      createdAt: new Date(),
      userId: insertSchedule.userId || null,
      isActive: insertSchedule.isActive ?? true
    };
    this.practiceSchedules.set(id, schedule);
    return schedule;
  }

  async getUserPracticeSchedules(userId: string): Promise<PracticeSchedule[]> {
    return Array.from(this.practiceSchedules.values()).filter(
      (schedule) => schedule.userId === userId,
    );
  }

  async updatePracticeSchedule(id: string, updates: Partial<PracticeSchedule>): Promise<PracticeSchedule | undefined> {
    const schedule = this.practiceSchedules.get(id);
    if (!schedule) return undefined;
    
    const updated = { ...schedule, ...updates };
    this.practiceSchedules.set(id, updated);
    return updated;
  }

  async deletePracticeSchedule(id: string): Promise<boolean> {
    return this.practiceSchedules.delete(id);
  }

  async createPracticeHistoryEntry(insertHistory: InsertPracticeHistory): Promise<PracticeHistory> {
    const id = randomUUID();
    const history: PracticeHistory = { 
      ...insertHistory, 
      id, 
      createdAt: new Date(),
      userId: insertHistory.userId || null,
      notes: insertHistory.notes || null
    };
    this.practiceHistory.set(id, history);
    return history;
  }

  async getUserPracticeHistory(userId: string, limit: number = 50, offset: number = 0): Promise<PracticeHistory[]> {
    const userHistory = Array.from(this.practiceHistory.values())
      .filter((history) => history.userId === userId)
      .sort((a, b) => new Date(b.practiceDate).getTime() - new Date(a.practiceDate).getTime());
    
    return userHistory.slice(offset, offset + limit);
  }

  async getPracticeStats(userId: string, days: number): Promise<any> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    const userHistory = Array.from(this.practiceHistory.values())
      .filter((history) => 
        history.userId === userId && 
        new Date(history.practiceDate) >= cutoffDate
      );

    const totalSessions = userHistory.length;
    const totalMinutes = userHistory.reduce((sum, h) => sum + h.totalDuration, 0);
    const averageCompletionRate = totalSessions > 0 
      ? userHistory.reduce((sum, h) => sum + (h.completedExercises / h.totalExercises), 0) / totalSessions
      : 0;

    return {
      totalSessions,
      totalMinutes,
      averageCompletionRate: Math.round(averageCompletionRate * 100),
      averageSessionLength: totalSessions > 0 ? Math.round(totalMinutes / totalSessions) : 0
    };
  }

  // Song management methods
  async createSong(insertSong: InsertSong): Promise<Song> {
    const id = randomUUID();
    const song: Song = {
      ...insertSong,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
      album: insertSong.album || null,
      genre: insertSong.genre || null,
      key: insertSong.key || null,
      tempo: insertSong.tempo || null,
      duration: insertSong.duration || null,
      spotifyId: insertSong.spotifyId || null,
      chordProgression: insertSong.chordProgression || null,
      lyrics: insertSong.lyrics || null,
      tabs: insertSong.tabs || null,
      notes: insertSong.notes || null,
      timeSignature: insertSong.timeSignature || "4/4",
    };
    this.songs.set(id, song);
    return song;
  }

  async getSong(id: string): Promise<Song | undefined> {
    return this.songs.get(id);
  }

  async searchSongs(query: string, filters?: { genre?: string; difficulty?: number; artist?: string }): Promise<Song[]> {
    const allSongs = Array.from(this.songs.values());
    const lowerQuery = query.toLowerCase();
    
    return allSongs.filter(song => {
      // Text search
      const matchesQuery = !query || 
        song.title.toLowerCase().includes(lowerQuery) ||
        song.artist.toLowerCase().includes(lowerQuery) ||
        (song.album && song.album.toLowerCase().includes(lowerQuery));
      
      // Filter by genre
      const matchesGenre = !filters?.genre || song.genre === filters.genre;
      
      // Filter by difficulty
      const matchesDifficulty = !filters?.difficulty || song.difficulty === filters.difficulty;
      
      // Filter by artist
      const matchesArtist = !filters?.artist || song.artist.toLowerCase().includes(filters.artist.toLowerCase());
      
      return matchesQuery && matchesGenre && matchesDifficulty && matchesArtist;
    });
  }

  async updateSong(id: string, updates: Partial<Song>): Promise<Song | undefined> {
    const song = this.songs.get(id);
    if (!song) return undefined;
    
    const updated = { ...song, ...updates, updatedAt: new Date() };
    this.songs.set(id, updated);
    return updated;
  }

  async deleteSong(id: string): Promise<boolean> {
    return this.songs.delete(id);
  }

  async getSongBySpotifyId(spotifyId: string): Promise<Song | undefined> {
    return Array.from(this.songs.values()).find(song => song.spotifyId === spotifyId);
  }

  // Song collection management methods
  async createSongCollection(insertCollection: InsertSongCollection): Promise<SongCollection> {
    const id = randomUUID();
    const collection: SongCollection = {
      ...insertCollection,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
      description: insertCollection.description || null,
      category: insertCollection.category || null,
      userId: insertCollection.userId || null,
      isPublic: insertCollection.isPublic || false,
    };
    this.songCollections.set(id, collection);
    return collection;
  }

  async getSongCollection(id: string): Promise<SongCollection | undefined> {
    return this.songCollections.get(id);
  }

  async getUserSongCollections(userId?: string): Promise<SongCollection[]> {
    return Array.from(this.songCollections.values()).filter(collection =>
      userId ? collection.userId === userId || collection.isPublic : collection.isPublic
    );
  }

  async updateSongCollection(id: string, updates: Partial<SongCollection>): Promise<SongCollection | undefined> {
    const collection = this.songCollections.get(id);
    if (!collection) return undefined;
    
    const updated = { ...collection, ...updates, updatedAt: new Date() };
    this.songCollections.set(id, updated);
    return updated;
  }

  async deleteSongCollection(id: string): Promise<boolean> {
    return this.songCollections.delete(id);
  }

  async addSongToCollection(collectionId: string, songId: string): Promise<boolean> {
    const collection = this.songCollections.get(collectionId);
    if (!collection) return false;
    
    const songIds = Array.isArray(collection.songIds) ? collection.songIds : [];
    if (!songIds.includes(songId)) {
      songIds.push(songId);
      await this.updateSongCollection(collectionId, { songIds });
    }
    return true;
  }

  async removeSongFromCollection(collectionId: string, songId: string): Promise<boolean> {
    const collection = this.songCollections.get(collectionId);
    if (!collection) return false;
    
    const songIds = Array.isArray(collection.songIds) ? collection.songIds : [];
    const filteredIds = songIds.filter(id => id !== songId);
    await this.updateSongCollection(collectionId, { songIds: filteredIds });
    return true;
  }

  // Song practice session management methods
  async createSongPracticeSession(insertSession: InsertSongPracticeSession): Promise<SongPracticeSession> {
    const id = randomUUID();
    const session: SongPracticeSession = {
      ...insertSession,
      id,
      createdAt: new Date(),
      tempo: insertSession.tempo || null,
      sections: insertSession.sections || null,
      notes: insertSession.notes || null,
      rating: insertSession.rating || null,
      completed: insertSession.completed || true,
    };
    this.songPracticeSessions.set(id, session);
    return session;
  }

  async getUserSongPracticeSessions(userId: string, songId?: string): Promise<SongPracticeSession[]> {
    return Array.from(this.songPracticeSessions.values()).filter(session =>
      session.userId === userId && (!songId || session.songId === songId)
    );
  }

  async updateSongPracticeSession(id: string, updates: Partial<SongPracticeSession>): Promise<SongPracticeSession | undefined> {
    const session = this.songPracticeSessions.get(id);
    if (!session) return undefined;
    
    const updated = { ...session, ...updates };
    this.songPracticeSessions.set(id, updated);
    return updated;
  }
}

export const storage = new MemStorage();
