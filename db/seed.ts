import { db } from './client';
import { barbells, plateInventory, settings, defaultSettings } from './schema';

/**
 * Seeds the database with default data.
 * Should be called on first app launch after onboarding.
 */
export async function seedDatabase() {
  // Seed default barbells
  const defaultBarbells = [
    { name: 'Olympic Bar', weight: 45, isDefault: true },
    { name: 'Curl Bar (EZ)', weight: 25, isDefault: false },
  ];

  for (const barbell of defaultBarbells) {
    await db.insert(barbells).values(barbell).onConflictDoNothing();
  }

  // Seed default plate inventory
  const defaultPlates = [
    { weight: 45, count: 4 },
    { weight: 35, count: 2 },
    { weight: 25, count: 4 },
    { weight: 10, count: 4 },
    { weight: 5, count: 4 },
    { weight: 2.5, count: 4 },
  ];

  for (const plate of defaultPlates) {
    await db.insert(plateInventory).values(plate).onConflictDoNothing();
  }

  // Seed default settings
  for (const [key, value] of Object.entries(defaultSettings)) {
    await db.insert(settings).values({ key, value }).onConflictDoNothing();
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
