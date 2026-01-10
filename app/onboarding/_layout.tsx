import { Stack } from 'expo-router';
import { useSettings } from '@/hooks';

export default function OnboardingLayout() {
  const { effectiveTheme } = useSettings();
  const isDark = effectiveTheme === 'dark';

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: isDark ? '#09090b' : '#f4f4f5',
        },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="health" />
      <Stack.Screen name="barbells" />
      <Stack.Screen name="plates" />
      <Stack.Screen name="exercises" />
      <Stack.Screen name="routine" />
      <Stack.Screen name="program" />
      <Stack.Screen name="body-composition" />
      <Stack.Screen name="complete" />
    </Stack>
  );
}
