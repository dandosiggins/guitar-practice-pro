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
  type InsertPracticeHistory
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
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private practiceSessions: Map<string, PracticeSession>;
  private practiceGoals: Map<string, PracticeGoal>;
  private chordProgressions: Map<string, ChordProgression>;
  private practiceSchedules: Map<string, PracticeSchedule>;
  private practiceHistory: Map<string, PracticeHistory>;

  constructor() {
    this.users = new Map();
    this.practiceSessions = new Map();
    this.practiceGoals = new Map();
    this.chordProgressions = new Map();
    this.practiceSchedules = new Map();
    this.practiceHistory = new Map();
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
}

export const storage = new MemStorage();
