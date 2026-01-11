import React, { ReactNode, useEffect } from 'react';
import { DatabaseProvider, useDatabase } from './DatabaseContext';
import { SettingsProvider, useSettings } from './SettingsContext';
import { ActiveWorkoutProvider, useActiveWorkout } from './ActiveWorkoutContext';
import { OnboardingProvider, useOnboarding } from './OnboardingContext';
import { View, Text, ActivityIndicator } from 'react-native';
import { audio } from '@/utils/audio';

interface AppProviderProps {
  children: ReactNode;
}

function LoadingScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-zinc-900">
      <ActivityIndicator size="large" color="#f97316" />
      <Text className="text-white mt-4 text-lg">Loading RampUp...</Text>
    </View>
  );
}

function DatabaseGate({ children }: { children: ReactNode }) {
  const { isReady } = useDatabase();

  // Initialize audio when database is ready
  useEffect(() => {
    if (isReady) {
      audio.initialize();
    }
  }, [isReady]);

  if (!isReady) {
    return <LoadingScreen />;
  }

  return <>{children}</>;
}

export function AppProvider({ children }: AppProviderProps) {
  return (
    <DatabaseProvider>
      <DatabaseGate>
        <SettingsProvider>
          <ActiveWorkoutProvider>
            <OnboardingProvider>
              {children}
            </OnboardingProvider>
          </ActiveWorkoutProvider>
        </SettingsProvider>
      </DatabaseGate>
    </DatabaseProvider>
  );
}

// Re-export hooks for convenience
export { useDatabase } from './DatabaseContext';
export { useSettings } from './SettingsContext';
export { useActiveWorkout } from './ActiveWorkoutContext';
export { useOnboarding } from './OnboardingContext';
