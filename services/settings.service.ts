import { eq } from 'drizzle-orm';

import { db } from '@/db/client';
import { settings, SettingKey, defaultSettings } from '@/db/schema';

export type Theme = 'light' | 'dark' | 'system';
export type Units = 'imperial' | 'metric';
export type Gender = 'male' | 'female';
export type MeasurementFrequency = 'daily' | 'weekly' | 'custom';

export interface AppSettings {
  theme: Theme;
  units: Units;
  height: number;
  gender: Gender;
  defaultWeightIncrement: number;
  defaultRestTime: number;
  notificationsEnabled: boolean;
  workoutRemindersEnabled: boolean;
  measurementRemindersEnabled: boolean;
  measurementReminderFrequency: MeasurementFrequency;
  measurementReminderTime: string;
  restTimerAudio: boolean;
  restTimerHaptic: boolean;
  healthKitEnabled: boolean;
  onboardingCompleted: boolean;
}

function parseBoolean(value: string): boolean {
  return value === 'true';
}

function parseNumber(value: string): number {
  return parseFloat(value);
}

export const settingsService = {
  /**
   * Get a single setting value
   */
  async get(key: SettingKey): Promise<string> {
    const results = await db.select().from(settings).where(eq(settings.key, key));
    return results[0]?.value ?? defaultSettings[key];
  },

  /**
   * Set a single setting value
   */
  async set(key: SettingKey, value: string): Promise<void> {
    await db
      .insert(settings)
      .values({ key, value })
      .onConflictDoUpdate({
        target: settings.key,
        set: { value },
      });
  },

  /**
   * Get all settings as a typed object
   */
  async getAll(): Promise<AppSettings> {
    const results = await db.select().from(settings);

    // Build a map of stored settings
    const storedSettings: Record<string, string> = {};
    for (const row of results) {
      storedSettings[row.key] = row.value;
    }

    // Merge with defaults and parse types
    const getValue = (key: SettingKey) =>
      storedSettings[key] ?? defaultSettings[key];

    return {
      theme: getValue('theme') as Theme,
      units: getValue('units') as Units,
      height: parseNumber(getValue('height')),
      gender: getValue('gender') as Gender,
      defaultWeightIncrement: parseNumber(getValue('defaultWeightIncrement')),
      defaultRestTime: parseNumber(getValue('defaultRestTime')),
      notificationsEnabled: parseBoolean(getValue('notificationsEnabled')),
      workoutRemindersEnabled: parseBoolean(getValue('workoutRemindersEnabled')),
      measurementRemindersEnabled: parseBoolean(getValue('measurementRemindersEnabled')),
      measurementReminderFrequency: getValue('measurementReminderFrequency') as MeasurementFrequency,
      measurementReminderTime: getValue('measurementReminderTime'),
      restTimerAudio: parseBoolean(getValue('restTimerAudio')),
      restTimerHaptic: parseBoolean(getValue('restTimerHaptic')),
      healthKitEnabled: parseBoolean(getValue('healthKitEnabled')),
      onboardingCompleted: parseBoolean(getValue('onboardingCompleted')),
    };
  },

  /**
   * Update multiple settings at once
   */
  async updateMany(updates: Partial<AppSettings>): Promise<void> {
    const entries = Object.entries(updates) as Array<[SettingKey, unknown]>;

    for (const [key, value] of entries) {
      const stringValue = typeof value === 'boolean' ? String(value) : String(value);
      await this.set(key, stringValue);
    }
  },

  /**
   * Initialize settings with defaults
   */
  async initializeDefaults(): Promise<void> {
    for (const [key, value] of Object.entries(defaultSettings)) {
      await db
        .insert(settings)
        .values({ key, value })
        .onConflictDoNothing();
    }
  },

  /**
   * Check if onboarding is completed
   */
  async isOnboardingCompleted(): Promise<boolean> {
    const value = await this.get('onboardingCompleted');
    return parseBoolean(value);
  },

  /**
   * Mark onboarding as completed
   */
  async completeOnboarding(): Promise<void> {
    await this.set('onboardingCompleted', 'true');
  },
};
