import { sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const settings = sqliteTable('settings', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
});

// Settings keys:
// - theme: "light" | "dark" | "system"
// - units: "imperial" | "metric"
// - height: number (inches)
// - gender: "male" | "female"
// - defaultWeightIncrement: "2.5" | "5"
// - defaultRestTime: number (seconds)
// - notificationsEnabled: "true" | "false"
// - workoutRemindersEnabled: "true" | "false"
// - workoutReminderTime: "18:00"
// - measurementRemindersEnabled: "true" | "false"
// - measurementReminderFrequency: "daily" | "weekly" | "custom"
// - measurementReminderTime: "08:00"
// - restTimerAudio: "true" | "false"
// - restTimerHaptic: "true" | "false"
// - healthKitEnabled: "true" | "false"
// - onboardingCompleted: "true" | "false"

export type Setting = typeof settings.$inferSelect;
export type NewSetting = typeof settings.$inferInsert;

// Type-safe setting keys
export type SettingKey =
  | 'theme'
  | 'units'
  | 'height'
  | 'gender'
  | 'defaultWeightIncrement'
  | 'defaultRestTime'
  | 'notificationsEnabled'
  | 'workoutRemindersEnabled'
  | 'workoutReminderTime'
  | 'measurementRemindersEnabled'
  | 'measurementReminderFrequency'
  | 'measurementReminderTime'
  | 'restTimerAudio'
  | 'restTimerHaptic'
  | 'healthKitEnabled'
  | 'onboardingCompleted';

export const defaultSettings: Record<SettingKey, string> = {
  theme: 'system',
  units: 'imperial',
  height: '70',
  gender: 'male',
  defaultWeightIncrement: '5',
  defaultRestTime: '90',
  notificationsEnabled: 'true',
  workoutRemindersEnabled: 'true',
  workoutReminderTime: '18:00',
  measurementRemindersEnabled: 'false',
  measurementReminderFrequency: 'weekly',
  measurementReminderTime: '08:00',
  restTimerAudio: 'true',
  restTimerHaptic: 'true',
  healthKitEnabled: 'false',
  onboardingCompleted: 'false',
};
