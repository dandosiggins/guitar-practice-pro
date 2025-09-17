import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, jsonb, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const practiceSession = pgTable("practice_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  duration: integer("duration").notNull(), // in minutes
  exercises: jsonb("exercises").notNull(), // array of exercise objects
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time"),
  completed: boolean("completed").default(false),
});

export const practiceGoal = pgTable("practice_goals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  title: text("title").notNull(),
  description: text("description"),
  progress: integer("progress").default(0), // percentage 0-100
  targetDate: timestamp("target_date"),
  completed: boolean("completed").default(false),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const chordProgression = pgTable("chord_progressions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  name: text("name").notNull(),
  chords: jsonb("chords").notNull(), // array of chord names
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const practiceSchedule = pgTable("practice_schedules", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  title: text("title").notNull(),
  dayOfWeek: integer("day_of_week").notNull(), // 0 = Sunday, 1 = Monday, etc.
  startTime: text("start_time").notNull(), // HH:MM format
  duration: integer("duration").notNull(), // in minutes
  exercises: jsonb("exercises").notNull(), // array of exercise objects
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const practiceHistory = pgTable("practice_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  sessionTitle: text("session_title").notNull(),
  exercises: jsonb("exercises").notNull(), // array of completed exercise objects
  totalDuration: integer("total_duration").notNull(), // actual time spent in minutes
  completedExercises: integer("completed_exercises").notNull(),
  totalExercises: integer("total_exercises").notNull(),
  practiceDate: timestamp("practice_date").notNull(),
  notes: text("notes"), // optional user notes about the session
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const song = pgTable("songs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  artist: text("artist").notNull(),
  album: text("album"),
  genre: text("genre"),
  key: text("key"), // e.g., "C", "Am", "F#"
  capo: integer("capo").default(0),
  tempo: integer("tempo"), // BPM
  timeSignature: text("time_signature").default("4/4"),
  difficulty: integer("difficulty").default(1), // 1-5 scale
  duration: integer("duration"), // song duration in seconds
  spotifyId: text("spotify_id").unique(), // Spotify track ID - unique to prevent duplicates
  chordProgression: jsonb("chord_progression"), // array of chord sections - optional initially
  lyrics: text("lyrics"),
  tabs: text("tabs"), // guitar tablature
  notes: text("notes"), // practice notes or tips
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const songCollection = pgTable("song_collections", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  category: text("category"), // "genre", "difficulty", "artist", "custom"
  isPublic: boolean("is_public").default(false),
  userId: varchar("user_id").references(() => users.id), // null for system collections
  songIds: jsonb("song_ids").notNull(), // array of song IDs
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const songPracticeSession = pgTable("song_practice_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  songId: varchar("song_id").notNull().references(() => song.id, { onDelete: "cascade" }),
  practiceType: text("practice_type").notNull(), // "full_song", "chord_changes", "solo", "rhythm"
  duration: integer("duration").notNull(), // actual practice time in minutes
  tempo: integer("tempo"), // practiced tempo (might differ from song tempo)
  sections: jsonb("sections"), // specific sections practiced
  notes: text("notes"),
  rating: integer("rating"), // 1-5 how well it went
  completed: boolean("completed").default(true),
  practiceDate: timestamp("practice_date").notNull(),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
});

export const insertPracticeSessionSchema = createInsertSchema(practiceSession).omit({
  id: true,
});

export const insertPracticeGoalSchema = createInsertSchema(practiceGoal).omit({
  id: true,
  createdAt: true,
});

export const insertChordProgressionSchema = createInsertSchema(chordProgression).omit({
  id: true,
  createdAt: true,
});

export const insertPracticeScheduleSchema = createInsertSchema(practiceSchedule).omit({
  id: true,
  createdAt: true,
});

export const insertPracticeHistorySchema = createInsertSchema(practiceHistory).omit({
  id: true,
  createdAt: true,
});

export const insertSongSchema = createInsertSchema(song).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  difficulty: z.number().min(1, "Difficulty must be at least 1").max(5, "Difficulty must be at most 5").default(1),
  capo: z.number().min(0, "Capo cannot be negative").default(0),
  tempo: z.number().min(1, "Tempo must be positive").optional(),
  duration: z.number().min(1, "Duration must be positive").optional(),
});

export const insertSongCollectionSchema = createInsertSchema(songCollection).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSongPracticeSessionSchema = createInsertSchema(songPracticeSession).omit({
  id: true,
  createdAt: true,
}).extend({
  rating: z.number().min(1, "Rating must be at least 1").max(5, "Rating must be at most 5").optional(),
  duration: z.number().min(1, "Duration must be at least 1 minute"),
  tempo: z.number().min(1, "Tempo must be positive").optional(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertPracticeSession = z.infer<typeof insertPracticeSessionSchema>;
export type PracticeSession = typeof practiceSession.$inferSelect;
export type InsertPracticeGoal = z.infer<typeof insertPracticeGoalSchema>;
export type PracticeGoal = typeof practiceGoal.$inferSelect;
export type InsertChordProgression = z.infer<typeof insertChordProgressionSchema>;
export type ChordProgression = typeof chordProgression.$inferSelect;
export type InsertPracticeSchedule = z.infer<typeof insertPracticeScheduleSchema>;
export type PracticeSchedule = typeof practiceSchedule.$inferSelect;
export type InsertPracticeHistory = z.infer<typeof insertPracticeHistorySchema>;
export type PracticeHistory = typeof practiceHistory.$inferSelect;
export type InsertSong = z.infer<typeof insertSongSchema>;
export type Song = typeof song.$inferSelect;
export type InsertSongCollection = z.infer<typeof insertSongCollectionSchema>;
export type SongCollection = typeof songCollection.$inferSelect;
export type InsertSongPracticeSession = z.infer<typeof insertSongPracticeSessionSchema>;
export type SongPracticeSession = typeof songPracticeSession.$inferSelect;

// Quick Practice Presets (client-side schema)
export const quickPresetExerciseSchema = z.object({
  title: z.string().min(1, "Exercise title is required"),
  duration: z.number().min(1, "Duration must be at least 1 minute"),
  type: z.enum(['warmup', 'chords', 'scales', 'technique', 'theory', 'custom', 'songs', 'rhythm'])
});

export const quickPresetSchema = z.object({
  id: z.string(),
  title: z.string().min(1, "Preset title is required"),
  description: z.string().optional(),
  exercises: z.array(quickPresetExerciseSchema).min(1, "At least one exercise is required")
});

export type QuickPresetExercise = z.infer<typeof quickPresetExerciseSchema>;
export type QuickPreset = z.infer<typeof quickPresetSchema>;
export type InsertQuickPreset = Omit<QuickPreset, 'id'>;
