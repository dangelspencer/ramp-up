import { drizzle } from 'drizzle-orm/expo-sqlite';
import { openDatabaseSync } from 'expo-sqlite';

import * as schema from './schema';

const DATABASE_NAME = 'rampup.db';

const expoDb = openDatabaseSync(DATABASE_NAME);

export const db = drizzle(expoDb, { schema });

export type Database = typeof db;

/**
 * Create all database tables if they don't exist
 */
export async function createTables(): Promise<void> {
  // Settings table
  expoDb.execSync(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  // Barbells table
  expoDb.execSync(`
    CREATE TABLE IF NOT EXISTS barbells (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      weight REAL NOT NULL,
      description TEXT,
      display_order INTEGER DEFAULT 0,
      is_default INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')) NOT NULL,
      updated_at TEXT DEFAULT (datetime('now')) NOT NULL
    );
  `);

  // Exercises table
  expoDb.execSync(`
    CREATE TABLE IF NOT EXISTS exercises (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      max_weight REAL DEFAULT 0,
      weight_increment REAL DEFAULT 5,
      auto_progression INTEGER DEFAULT 1,
      barbell_id TEXT REFERENCES barbells(id),
      default_rest_time INTEGER DEFAULT 90,
      created_at TEXT DEFAULT (datetime('now')) NOT NULL,
      updated_at TEXT DEFAULT (datetime('now')) NOT NULL
    );
  `);

  // Routines table
  expoDb.execSync(`
    CREATE TABLE IF NOT EXISTS routines (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')) NOT NULL,
      updated_at TEXT DEFAULT (datetime('now')) NOT NULL
    );
  `);

  // Routine exercises table
  expoDb.execSync(`
    CREATE TABLE IF NOT EXISTS routine_exercises (
      id TEXT PRIMARY KEY,
      routine_id TEXT NOT NULL REFERENCES routines(id) ON DELETE CASCADE,
      exercise_id TEXT NOT NULL REFERENCES exercises(id),
      order_index INTEGER NOT NULL,
      created_at TEXT DEFAULT (datetime('now')) NOT NULL
    );
  `);

  // Routine exercise sets table
  expoDb.execSync(`
    CREATE TABLE IF NOT EXISTS routine_exercise_sets (
      id TEXT PRIMARY KEY,
      routine_exercise_id TEXT NOT NULL REFERENCES routine_exercises(id) ON DELETE CASCADE,
      order_index INTEGER NOT NULL,
      weight_type TEXT NOT NULL DEFAULT 'percentage',
      weight_value REAL NOT NULL,
      reps INTEGER NOT NULL,
      rest_time INTEGER DEFAULT 90
    );
  `);

  // Programs table
  expoDb.execSync(`
    CREATE TABLE IF NOT EXISTS programs (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'continuous',
      total_workouts INTEGER,
      current_position INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 0,
      completed_at TEXT,
      created_at TEXT DEFAULT (datetime('now')) NOT NULL,
      updated_at TEXT DEFAULT (datetime('now')) NOT NULL
    );
  `);

  // Program routines table
  expoDb.execSync(`
    CREATE TABLE IF NOT EXISTS program_routines (
      id TEXT PRIMARY KEY,
      program_id TEXT NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
      routine_id TEXT NOT NULL REFERENCES routines(id),
      order_index INTEGER NOT NULL
    );
  `);

  // Workouts table
  expoDb.execSync(`
    CREATE TABLE IF NOT EXISTS workouts (
      id TEXT PRIMARY KEY,
      program_id TEXT REFERENCES programs(id),
      routine_id TEXT REFERENCES routines(id),
      started_at TEXT DEFAULT (datetime('now')) NOT NULL,
      completed_at TEXT,
      notes TEXT
    );
  `);

  // Workout exercises table
  expoDb.execSync(`
    CREATE TABLE IF NOT EXISTS workout_exercises (
      id TEXT PRIMARY KEY,
      workout_id TEXT NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
      exercise_id TEXT NOT NULL REFERENCES exercises(id),
      order_index INTEGER NOT NULL
    );
  `);

  // Workout sets table
  expoDb.execSync(`
    CREATE TABLE IF NOT EXISTS workout_sets (
      id TEXT PRIMARY KEY,
      workout_exercise_id TEXT NOT NULL REFERENCES workout_exercises(id) ON DELETE CASCADE,
      order_index INTEGER NOT NULL,
      target_weight REAL NOT NULL,
      actual_weight REAL,
      target_reps INTEGER NOT NULL,
      actual_reps INTEGER,
      percentage_of_max REAL,
      rest_time INTEGER DEFAULT 90,
      completed INTEGER DEFAULT 0,
      notes TEXT
    );
  `);

  // Body compositions table
  expoDb.execSync(`
    CREATE TABLE IF NOT EXISTS body_compositions (
      id TEXT PRIMARY KEY,
      date TEXT DEFAULT (datetime('now')) NOT NULL,
      weight REAL,
      waist REAL,
      neck REAL,
      hip REAL,
      body_fat_percent REAL,
      bmi REAL,
      lean_mass REAL,
      synced_to_health INTEGER DEFAULT 0
    );
  `);

  // Goals table
  expoDb.execSync(`
    CREATE TABLE IF NOT EXISTS goals (
      id TEXT PRIMARY KEY,
      workouts_per_week INTEGER NOT NULL DEFAULT 3,
      total_weeks INTEGER,
      scheduled_days TEXT DEFAULT '[]',
      reminder_time TEXT,
      start_date TEXT DEFAULT (date('now')) NOT NULL,
      current_streak INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1
    );
  `);

  // Plate inventory table
  expoDb.execSync(`
    CREATE TABLE IF NOT EXISTS plate_inventory (
      id TEXT PRIMARY KEY,
      weight REAL NOT NULL UNIQUE,
      count INTEGER NOT NULL DEFAULT 0
    );
  `);
}
