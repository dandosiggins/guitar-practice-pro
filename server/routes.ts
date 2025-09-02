import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertPracticeSessionSchema,
  insertPracticeGoalSchema,
  insertChordProgressionSchema,
  insertPracticeScheduleSchema,
  insertPracticeHistorySchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Practice Sessions
  app.get("/api/practice-sessions/:userId", async (req, res) => {
    try {
      const sessions = await storage.getUserPracticeSessions(req.params.userId);
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch practice sessions" });
    }
  });

  app.post("/api/practice-sessions", async (req, res) => {
    try {
      const validatedData = insertPracticeSessionSchema.parse(req.body);
      const session = await storage.createPracticeSession(validatedData);
      res.json(session);
    } catch (error) {
      res.status(400).json({ error: "Invalid practice session data" });
    }
  });

  app.patch("/api/practice-sessions/:id", async (req, res) => {
    try {
      const updated = await storage.updatePracticeSession(req.params.id, req.body);
      if (!updated) {
        return res.status(404).json({ error: "Practice session not found" });
      }
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to update practice session" });
    }
  });

  // Practice Goals
  app.get("/api/practice-goals/:userId", async (req, res) => {
    try {
      const goals = await storage.getUserPracticeGoals(req.params.userId);
      res.json(goals);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch practice goals" });
    }
  });

  app.post("/api/practice-goals", async (req, res) => {
    try {
      const validatedData = insertPracticeGoalSchema.parse(req.body);
      const goal = await storage.createPracticeGoal(validatedData);
      res.json(goal);
    } catch (error) {
      res.status(400).json({ error: "Invalid practice goal data" });
    }
  });

  app.patch("/api/practice-goals/:id", async (req, res) => {
    try {
      const updated = await storage.updatePracticeGoal(req.params.id, req.body);
      if (!updated) {
        return res.status(404).json({ error: "Practice goal not found" });
      }
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to update practice goal" });
    }
  });

  // Chord Progressions
  app.get("/api/chord-progressions/:userId", async (req, res) => {
    try {
      const progressions = await storage.getUserChordProgressions(req.params.userId);
      res.json(progressions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch chord progressions" });
    }
  });

  app.post("/api/chord-progressions", async (req, res) => {
    try {
      const validatedData = insertChordProgressionSchema.parse(req.body);
      const progression = await storage.createChordProgression(validatedData);
      res.json(progression);
    } catch (error) {
      res.status(400).json({ error: "Invalid chord progression data" });
    }
  });

  app.delete("/api/chord-progressions/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteChordProgression(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Chord progression not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete chord progression" });
    }
  });

  // Practice Schedules
  app.get("/api/practice-schedules/:userId", async (req, res) => {
    try {
      const schedules = await storage.getUserPracticeSchedules(req.params.userId);
      res.json(schedules);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch practice schedules" });
    }
  });

  app.post("/api/practice-schedules", async (req, res) => {
    try {
      const validatedData = insertPracticeScheduleSchema.parse(req.body);
      const schedule = await storage.createPracticeSchedule(validatedData);
      res.json(schedule);
    } catch (error) {
      res.status(400).json({ error: "Invalid practice schedule data" });
    }
  });

  app.patch("/api/practice-schedules/:id", async (req, res) => {
    try {
      const updated = await storage.updatePracticeSchedule(req.params.id, req.body);
      if (!updated) {
        return res.status(404).json({ error: "Practice schedule not found" });
      }
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to update practice schedule" });
    }
  });

  app.delete("/api/practice-schedules/:id", async (req, res) => {
    try {
      const deleted = await storage.deletePracticeSchedule(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Practice schedule not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete practice schedule" });
    }
  });

  // Practice History
  app.get("/api/practice-history/:userId", async (req, res) => {
    try {
      const { limit = 50, offset = 0 } = req.query;
      const history = await storage.getUserPracticeHistory(
        req.params.userId, 
        parseInt(limit as string), 
        parseInt(offset as string)
      );
      res.json(history);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch practice history" });
    }
  });

  app.post("/api/practice-history", async (req, res) => {
    try {
      const validatedData = insertPracticeHistorySchema.parse(req.body);
      const historyEntry = await storage.createPracticeHistoryEntry(validatedData);
      res.json(historyEntry);
    } catch (error) {
      res.status(400).json({ error: "Invalid practice history data" });
    }
  });

  app.get("/api/practice-history/:userId/stats", async (req, res) => {
    try {
      const { days = 30 } = req.query;
      const stats = await storage.getPracticeStats(req.params.userId, parseInt(days as string));
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch practice stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
