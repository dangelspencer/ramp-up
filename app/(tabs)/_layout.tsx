import { useEffect } from 'react';
import { Tabs, useRouter } from 'expo-router';
import { Home, Clock, Dumbbell, Settings } from 'lucide-react-native';
import { useSettings } from '@/hooks';

export default function TabLayout() {
  const router = useRouter();
  const { effectiveTheme, settings, isLoading } = useSettings();

  // Redirect to onboarding if not completed
  useEffect(() => {
    if (!isLoading && !settings.onboardingCompleted) {
      router.replace('/onboarding');
    }
  }, [isLoading, settings.onboardingCompleted]);
  const isDark = effectiveTheme === 'dark';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#f97316',
        tabBarInactiveTintColor: isDark ? '#6b7280' : '#9ca3af',
        tabBarStyle: {
          backgroundColor: isDark ? '#111827' : '#ffffff',
          borderTopColor: isDark ? '#1f2937' : '#e5e7eb',
          paddingTop: 8,
          height: 88,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ color, size }) => <Clock size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="exercises"
        options={{
          title: 'Exercises',
          tabBarIcon: ({ color, size }) => <Dumbbell size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => <Settings size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
