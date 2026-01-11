import { db } from './client';
import { barbells, plateInventory, settings, defaultSettings } from './schema';

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
  // Tables are cleared in reverse order of dependencies
  await db.delete(settings);
  await db.delete(plateInventory);
  await db.delete(barbells);
  // Note: Other tables will cascade delete through foreign keys
}

// Export defaults for use in UI (descriptions, etc.)
export { DEFAULT_BARBELLS, DEFAULT_PLATES };
