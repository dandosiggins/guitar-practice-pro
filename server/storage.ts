import { 
  type User, 
  type InsertUser, 
  type PracticeSession,
  type InsertPracticeSession,
  type PracticeGoal,
  type InsertPracticeGoal,
  type ChordProgression,
  type InsertChordProgression
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
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private practiceSessions: Map<string, PracticeSession>;
  private practiceGoals: Map<string, PracticeGoal>;
  private chordProgressions: Map<string, ChordProgression>;

  constructor() {
    this.users = new Map();
    this.practiceSessions = new Map();
    this.practiceGoals = new Map();
    this.chordProgressions = new Map();
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
}

export const storage = new MemStorage();
