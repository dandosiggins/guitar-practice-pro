import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertPracticeSessionSchema,
  insertPracticeGoalSchema,
  insertChordProgressionSchema,
  insertPracticeScheduleSchema,
  insertPracticeHistorySchema,
  insertSongSchema,
  insertSongCollectionSchema,
  insertSongPracticeSessionSchema
} from "@shared/schema";
import { getUncachableSpotifyClient, convertSpotifyTrackToSong, getTrackAudioFeatures } from "./spotify";

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

  // Songs
  app.get("/api/songs", async (req, res) => {
    try {
      const { q, genre, difficulty, artist } = req.query;
      const query = typeof q === 'string' ? q : '';
      
      const filters = {
        genre: typeof genre === 'string' ? genre : undefined,
        difficulty: typeof difficulty === 'string' ? parseInt(difficulty) : undefined,
        artist: typeof artist === 'string' ? artist : undefined,
      };
      
      const songs = await storage.searchSongs(query, filters);
      res.json(songs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch songs" });
    }
  });

  app.get("/api/songs/:id", async (req, res) => {
    try {
      const song = await storage.getSong(req.params.id);
      if (!song) {
        return res.status(404).json({ error: "Song not found" });
      }
      res.json(song);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch song" });
    }
  });

  app.post("/api/songs", async (req, res) => {
    try {
      const validatedData = insertSongSchema.parse(req.body);
      const song = await storage.createSong(validatedData);
      res.json(song);
    } catch (error) {
      res.status(400).json({ error: "Invalid song data" });
    }
  });

  app.post("/api/songs/from-spotify", async (req, res) => {
    try {
      const { spotifyTrack } = req.body;
      
      // Check if song already exists
      const existingSong = await storage.getSongBySpotifyId(spotifyTrack.id);
      if (existingSong) {
        return res.status(409).json({ error: "Song already exists in library", song: existingSong });
      }
      
      // Convert Spotify track to our song format
      let songData = convertSpotifyTrackToSong(spotifyTrack);
      
// Try to get audio features from Spotify
try {
  const audioFeatures = await getTrackAudioFeatures(spotifyTrack.id);
  songData = {
    ...songData,
    key: audioFeatures.key || null,
    tempo: audioFeatures.tempo || null,
    timeSignature: audioFeatures.timeSignature || null,
  };
} catch (audioError) {
  console.warn('Could not fetch audio features:', audioError);
  // Continue without audio features - tempo and key will remain null
}
      
      // Validate and save
      const validatedData = insertSongSchema.parse(songData);
      const song = await storage.createSong(validatedData);
      res.json(song);
    } catch (error) {
      console.error('Error adding song from Spotify:', error);
      res.status(400).json({ error: "Failed to add song from Spotify" });
    }
  });

  app.patch("/api/songs/:id", async (req, res) => {
    try {
      const updated = await storage.updateSong(req.params.id, req.body);
      if (!updated) {
        return res.status(404).json({ error: "Song not found" });
      }
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to update song" });
    }
  });

  app.delete("/api/songs/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteSong(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Song not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete song" });
    }
  });

  // Song Collections
  app.get("/api/song-collections", async (req, res) => {
    try {
      const { userId } = req.query;
      const userIdStr = typeof userId === 'string' ? userId : undefined;
      const collections = await storage.getUserSongCollections(userIdStr);
      res.json(collections);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch song collections" });
    }
  });

  app.get("/api/song-collections/:id", async (req, res) => {
    try {
      const collection = await storage.getSongCollection(req.params.id);
      if (!collection) {
        return res.status(404).json({ error: "Collection not found" });
      }
      res.json(collection);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch song collection" });
    }
  });

  app.post("/api/song-collections", async (req, res) => {
    try {
      const validatedData = insertSongCollectionSchema.parse(req.body);
      const collection = await storage.createSongCollection(validatedData);
      res.json(collection);
    } catch (error) {
      res.status(400).json({ error: "Invalid song collection data" });
    }
  });

  app.patch("/api/song-collections/:id", async (req, res) => {
    try {
      const updated = await storage.updateSongCollection(req.params.id, req.body);
      if (!updated) {
        return res.status(404).json({ error: "Song collection not found" });
      }
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to update song collection" });
    }
  });

  app.delete("/api/song-collections/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteSongCollection(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Song collection not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete song collection" });
    }
  });

  app.post("/api/song-collections/:id/songs", async (req, res) => {
    try {
      const { songId } = req.body;
      const added = await storage.addSongToCollection(req.params.id, songId);
      if (!added) {
        return res.status(404).json({ error: "Collection not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to add song to collection" });
    }
  });

  app.delete("/api/song-collections/:id/songs/:songId", async (req, res) => {
    try {
      const removed = await storage.removeSongFromCollection(req.params.id, req.params.songId);
      if (!removed) {
        return res.status(404).json({ error: "Collection not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to remove song from collection" });
    }
  });

  // Spotify Integration
  app.get("/api/spotify/search", async (req, res) => {
    try {
      const { q } = req.query;
      if (!q || typeof q !== 'string') {
        return res.status(400).json({ error: "Search query required" });
      }
      
      const spotify = await getUncachableSpotifyClient();
      const results = await spotify.search(q, ['track'], 'US', 20);
      res.json(results);
    } catch (error) {
      console.error('Spotify search error:', error);
      res.status(500).json({ error: "Failed to search Spotify" });
    }
  });

  // Song Practice Sessions
  app.get("/api/song-practice-sessions/:userId", async (req, res) => {
    try {
      const { songId } = req.query;
      const songIdStr = typeof songId === 'string' ? songId : undefined;
      const sessions = await storage.getUserSongPracticeSessions(req.params.userId, songIdStr);
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch song practice sessions" });
    }
  });

  app.post("/api/song-practice-sessions", async (req, res) => {
    try {
      const validatedData = insertSongPracticeSessionSchema.parse(req.body);
      const session = await storage.createSongPracticeSession(validatedData);
      res.json(session);
    } catch (error) {
      res.status(400).json({ error: "Invalid song practice session data" });
    }
  });

  app.patch("/api/song-practice-sessions/:id", async (req, res) => {
    try {
      const updated = await storage.updateSongPracticeSession(req.params.id, req.body);
      if (!updated) {
        return res.status(404).json({ error: "Song practice session not found" });
      }
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to update song practice session" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
