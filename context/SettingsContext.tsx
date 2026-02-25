import React, { createContext, useContext, useEffect, useRef, useState, ReactNode, useCallback } from 'react';
import { settingsService, AppSettings } from '@/services/settings.service';
import { notificationService } from '@/services/notification.service';
import { goalService } from '@/services/goal.service';
import { useColorScheme } from 'react-native';

interface SettingsContextType {
  settings: AppSettings;
  isLoading: boolean;
  updateSettings: (updates: Partial<AppSettings>) => Promise<void>;
  refreshSettings: () => Promise<void>;
  effectiveTheme: 'light' | 'dark';
}

const defaultSettings: AppSettings = {
  theme: 'system',
  units: 'imperial',
  height: 70,
  gender: 'male',
  defaultWeightIncrement: 5,
  defaultRestTime: 90,
  notificationsEnabled: true,
  workoutRemindersEnabled: true,
  workoutReminderTime: '18:00',
  measurementRemindersEnabled: false,
  measurementReminderFrequency: 'weekly',
  measurementReminderTime: '08:00',
  restTimerAudio: true,
  restTimerHaptic: true,
  healthKitEnabled: false,
  onboardingCompleted: false,
  goalNotificationsEnabled: true,
  goalNotificationDay: 0,
  goalNotificationTime: '19:00',
  defaultReducedWeightPercent: 10,
};

const NOTIFICATION_SETTING_KEYS: (keyof AppSettings)[] = [
  'notificationsEnabled',
  'workoutRemindersEnabled',
  'workoutReminderTime',
  'measurementRemindersEnabled',
  'measurementReminderFrequency',
  'measurementReminderTime',
  'goalNotificationsEnabled',
  'goalNotificationDay',
  'goalNotificationTime',
];

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

interface SettingsProviderProps {
  children: ReactNode;
}

export function SettingsProvider({ children }: SettingsProviderProps) {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);
  const systemColorScheme = useColorScheme();

  const loadSettings = useCallback(async () => {
    try {
      const loadedSettings = await settingsService.getAll();
      setSettings(loadedSettings);
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // Sync notifications with OS on startup once settings are loaded
  const hasInitialSynced = useRef(false);
  useEffect(() => {
    if (!isLoading && !hasInitialSynced.current) {
      hasInitialSynced.current = true;
      (async () => {
        try {
          const goal = await goalService.getActive();
          let goalDays: number[] | undefined;
          if (goal?.scheduledDays) {
            try {
              goalDays = JSON.parse(goal.scheduledDays);
            } catch { /* use undefined */ }
          }
          await notificationService.syncAllNotifications(goalDays);
        } catch (error) {
          console.error('Failed to sync notifications on startup:', error);
        }
      })();
    }
  }, [isLoading]);

  const updateSettings = useCallback(async (updates: Partial<AppSettings>) => {
    try {
      await settingsService.updateMany(updates);
      setSettings((prev) => ({ ...prev, ...updates }));

      // Re-sync notifications if any notification-related setting changed
      const hasNotificationChange = NOTIFICATION_SETTING_KEYS.some((key) => key in updates);
      if (hasNotificationChange) {
        // Request permissions if master toggle is being enabled
        if (updates.notificationsEnabled === true) {
          await notificationService.requestPermissions();
        }
        const goal = await goalService.getActive();
        let goalDays: number[] | undefined;
        if (goal?.scheduledDays) {
          try {
            goalDays = JSON.parse(goal.scheduledDays);
          } catch { /* use undefined */ }
        }
        await notificationService.syncAllNotifications(goalDays);
      }
    } catch (error) {
      console.error('Failed to update settings:', error);
      throw error;
    }
  }, []);

  const refreshSettings = useCallback(async () => {
    setIsLoading(true);
    await loadSettings();
  }, [loadSettings]);

  // Compute effective theme based on settings and system preference
  const effectiveTheme: 'light' | 'dark' =
    settings.theme === 'system'
      ? (systemColorScheme ?? 'light')
      : settings.theme;

  return (
    <SettingsContext.Provider
      value={{
        settings,
        isLoading,
        updateSettings,
        refreshSettings,
        effectiveTheme,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
