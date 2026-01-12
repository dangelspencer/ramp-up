import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { settingsService, AppSettings } from '@/services/settings.service';
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
};

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

  const updateSettings = useCallback(async (updates: Partial<AppSettings>) => {
    try {
      await settingsService.updateMany(updates);
      setSettings((prev) => ({ ...prev, ...updates }));
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
