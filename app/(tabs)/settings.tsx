import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  ChevronRight,
  Sun,
  Moon,
  Monitor,
  Dumbbell,
  CircleDot,
  Target,
  Bell,
  User,
} from 'lucide-react-native';
import { useSettings, useBarbells, useGoals } from '@/hooks';
import { Card, Switch } from '@/components/ui';

export default function SettingsScreen() {
  const router = useRouter();
  const { effectiveTheme, settings, updateSettings } = useSettings();
  const isDark = effectiveTheme === 'dark';
  const { barbells } = useBarbells();
  const { progress } = useGoals();

  const handleThemeChange = (theme: 'light' | 'dark' | 'system') => {
    updateSettings({ theme });
  };

  return (
    <SafeAreaView className={`flex-1 ${isDark ? 'bg-zinc-950' : 'bg-zinc-100'}`}>
      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="pt-4 pb-4">
          <Text className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>
            Settings
          </Text>
        </View>

        {/* Profile */}
        <TouchableOpacity
          onPress={() => router.push('/settings/profile')}
          className={`rounded-xl p-4 mb-4 flex-row items-center ${isDark ? 'bg-zinc-800' : 'bg-white'}`}
        >
          <View className={`w-12 h-12 rounded-full items-center justify-center ${isDark ? 'bg-zinc-700' : 'bg-zinc-200'}`}>
            <User size={24} color={isDark ? '#a1a1aa' : '#71717a'} />
          </View>
          <View className="flex-1 ml-3">
            <Text className={`font-medium ${isDark ? 'text-white' : 'text-zinc-900'}`}>
              Profile
            </Text>
            <Text className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
              {settings.height ? `${settings.height}" • ` : ''}
              {settings.gender ? settings.gender.charAt(0).toUpperCase() + settings.gender.slice(1) : 'Not set'}
            </Text>
          </View>
          <ChevronRight size={20} color={isDark ? '#71717a' : '#a1a1aa'} />
        </TouchableOpacity>

        {/* Appearance */}
        <Card variant="elevated" className="mb-4">
          <Text className={`text-sm font-medium mb-3 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
            Appearance
          </Text>
          <View className={`flex-row rounded-lg p-1 ${isDark ? 'bg-zinc-700' : 'bg-zinc-100'}`}>
            <TouchableOpacity
              onPress={() => handleThemeChange('light')}
              className={`flex-1 py-2.5 px-3 rounded-md flex-row items-center justify-center gap-2 ${
                settings.theme === 'light' ? 'bg-orange-500' : ''
              }`}
            >
              <Sun size={16} color={settings.theme === 'light' ? '#ffffff' : isDark ? '#a1a1aa' : '#71717a'} />
              <Text className={settings.theme === 'light' ? 'text-white text-sm' : `text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                Light
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleThemeChange('system')}
              className={`flex-1 py-2.5 px-3 rounded-md flex-row items-center justify-center gap-2 ${
                settings.theme === 'system' ? 'bg-orange-500' : ''
              }`}
            >
              <Monitor size={16} color={settings.theme === 'system' ? '#ffffff' : isDark ? '#a1a1aa' : '#71717a'} />
              <Text className={settings.theme === 'system' ? 'text-white text-sm' : `text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                System
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleThemeChange('dark')}
              className={`flex-1 py-2.5 px-3 rounded-md flex-row items-center justify-center gap-2 ${
                settings.theme === 'dark' ? 'bg-orange-500' : ''
              }`}
            >
              <Moon size={16} color={settings.theme === 'dark' ? '#ffffff' : isDark ? '#a1a1aa' : '#71717a'} />
              <Text className={settings.theme === 'dark' ? 'text-white text-sm' : `text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                Dark
              </Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Equipment */}
        <View className="gap-2 mb-4">
          <Text className={`text-sm font-medium ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
            Equipment
          </Text>
          <TouchableOpacity
            onPress={() => router.push('/settings/barbells')}
            className={`rounded-xl p-4 flex-row items-center justify-between ${isDark ? 'bg-zinc-800' : 'bg-white'}`}
          >
            <View className="flex-row items-center gap-3">
              <Dumbbell size={20} color={isDark ? '#a1a1aa' : '#71717a'} />
              <Text className={isDark ? 'text-white' : 'text-zinc-900'}>Barbells</Text>
            </View>
            <View className="flex-row items-center gap-2">
              <Text className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                {barbells.length} configured
              </Text>
              <ChevronRight size={18} color={isDark ? '#71717a' : '#a1a1aa'} />
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push('/settings/plates')}
            className={`rounded-xl p-4 flex-row items-center justify-between ${isDark ? 'bg-zinc-800' : 'bg-white'}`}
          >
            <View className="flex-row items-center gap-3">
              <CircleDot size={20} color={isDark ? '#a1a1aa' : '#71717a'} />
              <Text className={isDark ? 'text-white' : 'text-zinc-900'}>Plate Inventory</Text>
            </View>
            <View className="flex-row items-center gap-2">
              <ChevronRight size={18} color={isDark ? '#71717a' : '#a1a1aa'} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Goals */}
        <TouchableOpacity
          onPress={() => router.push('/settings/goal')}
          className={`rounded-xl p-4 mb-4 flex-row items-center justify-between ${isDark ? 'bg-zinc-800' : 'bg-white'}`}
        >
          <View className="flex-row items-center gap-3">
            <Target size={20} color={isDark ? '#a1a1aa' : '#71717a'} />
            <View>
              <Text className={isDark ? 'text-white' : 'text-zinc-900'}>Weekly Goal</Text>
              {progress && (
                <Text className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                  {progress.workoutsThisWeek}/{progress.workoutsTarget} workouts this week
                </Text>
              )}
            </View>
          </View>
          <ChevronRight size={18} color={isDark ? '#71717a' : '#a1a1aa'} />
        </TouchableOpacity>

        {/* Units */}
        <Card variant="elevated" className="mb-4">
          <Text className={`text-sm font-medium mb-3 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
            Units
          </Text>
          <View className={`flex-row rounded-lg p-1 ${isDark ? 'bg-zinc-700' : 'bg-zinc-100'}`}>
            <TouchableOpacity
              onPress={() => updateSettings({ units: 'imperial' })}
              className={`flex-1 py-2.5 px-3 rounded-md items-center ${
                settings.units === 'imperial' ? 'bg-orange-500' : ''
              }`}
            >
              <Text className={settings.units === 'imperial' ? 'text-white' : isDark ? 'text-zinc-300' : 'text-zinc-700'}>
                Imperial (lbs)
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => updateSettings({ units: 'metric' })}
              className={`flex-1 py-2.5 px-3 rounded-md items-center ${
                settings.units === 'metric' ? 'bg-orange-500' : ''
              }`}
            >
              <Text className={settings.units === 'metric' ? 'text-white' : isDark ? 'text-zinc-300' : 'text-zinc-700'}>
                Metric (kg)
              </Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Notifications */}
        <Card variant="elevated" className="mb-4">
          <View className="flex-row items-center gap-2 mb-3">
            <Bell size={18} color={isDark ? '#a1a1aa' : '#71717a'} />
            <Text className={`text-sm font-medium ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
              Notifications
            </Text>
          </View>
          <View className="gap-3">
            <Switch
              label="Notifications Enabled"
              value={settings.notificationsEnabled ?? true}
              onValueChange={(v) => updateSettings({ notificationsEnabled: v })}
            />
            <Switch
              label="Workout Reminders"
              value={settings.workoutRemindersEnabled ?? true}
              onValueChange={(v) => updateSettings({ workoutRemindersEnabled: v })}
            />
            <Switch
              label="Measurement Reminders"
              value={settings.measurementRemindersEnabled ?? false}
              onValueChange={(v) => updateSettings({ measurementRemindersEnabled: v })}
            />
          </View>
        </Card>

        {/* Spacer for tab bar */}
        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
