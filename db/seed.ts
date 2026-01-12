import { db } from './client';
import {
  barbells,
  plateInventory,
  settings,
  defaultSettings,
  workoutSets,
  workoutExercises,
  workouts,
  routineExerciseSets,
  routineExercises,
  routines,
  programRoutines,
  programs,
  exercises,
  goals,
  bodyCompositions,
} from './schema';

/**
 * Default barbells to seed on first app launch
 */
const DEFAULT_BARBELLS = [
  { name: 'Olympic Barbell', weight: 45, description: 'Standard 7ft/20kg bar', displayOrder: 0, isDefault: true },
  { name: "Women's Olympic Bar", weight: 35, description: '6.5ft/15kg bar', displayOrder: 1, isDefault: false },
  { name: 'EZ Curl Bar (35 lb)', weight: 35, description: 'Rackable curved bar for curls', displayOrder: 2, isDefault: false },
  { name: 'EZ Curl Bar (25 lb)', weight: 25, description: 'Curved bar for curls', displayOrder: 3, isDefault: false },
  { name: 'Trap Bar', weight: 55, description: 'Hexagonal deadlift bar', displayOrder: 4, isDefault: false },
  { name: 'Safety Squat Bar', weight: 65, description: 'Bar with handles', displayOrder: 5, isDefault: false },
];

/**
 * Default plate inventory to seed on first app launch
 */
const DEFAULT_PLATES = [
  { weight: 45, count: 4 },
  { weight: 35, count: 2 },
  { weight: 25, count: 4 },
  { weight: 10, count: 4 },
  { weight: 5, count: 4 },
  { weight: 2.5, count: 4 },
];

/**
 * Seeds the database with default data if tables are empty.
 * Called automatically on app startup from DatabaseContext.
 */
export async function seedDatabase() {
  // Seed default barbells if none exist
  const existingBarbells = await db.select().from(barbells);
  if (existingBarbells.length === 0) {
    for (const barbell of DEFAULT_BARBELLS) {
      await db.insert(barbells).values(barbell).onConflictDoNothing();
    }
  }

  // Seed default plate inventory if none exist
  const existingPlates = await db.select().from(plateInventory);
  if (existingPlates.length === 0) {
    for (const plate of DEFAULT_PLATES) {
      await db.insert(plateInventory).values(plate).onConflictDoNothing();
    }
  }

  // Seed default settings if none exist
  const existingSettings = await db.select().from(settings);
  if (existingSettings.length === 0) {
    for (const [key, value] of Object.entries(defaultSettings)) {
      await db.insert(settings).values({ key, value }).onConflictDoNothing();
    }
  }
}

/**
 * Clears all data from the database.
 * Use with caution - this is irreversible!
 */
export async function clearDatabase() {
  // Delete in order of dependencies (children first)
  // Workout-related tables
  await db.delete(workoutSets);
  await db.delete(workoutExercises);
  await db.delete(workouts);

  // Routine-related tables
  await db.delete(routineExerciseSets);
  await db.delete(routineExercises);

  // Program-related tables
  await db.delete(programRoutines);
  await db.delete(programs);

  // Routines (after routine_exercises and program_routines are gone)
  await db.delete(routines);

  // Exercises (after routine_exercises and workout_exercises are gone)
  await db.delete(exercises);

  // Standalone tables
  await db.delete(goals);
  await db.delete(bodyCompositions);

  // Equipment tables
  await db.delete(barbells);
  await db.delete(plateInventory);

  // Settings (last)
  await db.delete(settings);
}

/**
 * Resets all app data: clears database, re-seeds defaults.
 * Used for "Clear All Data" in settings.
 */
export async function resetAllData() {
  await clearDatabase();
  await seedDatabase();
}

// Export defaults for use in UI (descriptions, etc.)
export { DEFAULT_BARBELLS, DEFAULT_PLATES };
