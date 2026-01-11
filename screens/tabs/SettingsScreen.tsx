import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
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
import { SegmentedControl } from '@/components/ui/Select';
import { RootStackParamList } from '../../App';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function SettingsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { effectiveTheme, settings, updateSettings } = useSettings();
  const isDark = effectiveTheme === 'dark';
  const { barbells } = useBarbells();
  const { progress } = useGoals();

  const handleThemeChange = (theme: 'light' | 'dark' | 'system') => {
    updateSettings({ theme });
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: isDark ? '#09090b' : '#f4f4f5' }}>
      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="pt-4 pb-4">
          <Text className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>
            Settings
          </Text>
        </View>

        {/* Profile */}
        <TouchableOpacity
          onPress={() => navigation.navigate('SettingsProfile')}
          className={`rounded-xl p-4 mb-4 flex-row items-center ${isDark ? 'bg-zinc-800' : 'bg-white'}`}
        >
          <View className={`w-12 h-12 mr-4 rounded-full items-center justify-center ${isDark ? 'bg-zinc-700' : 'bg-zinc-200'}`}>
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
          <SegmentedControl
            value={settings.theme}
            onValueChange={(value) => handleThemeChange(value as 'light' | 'dark' | 'system')}
            options={[
              { value: 'light', label: 'Light', icon: ({ size, color }) => <Sun size={size} color={color} /> },
              { value: 'system', label: 'System', icon: ({ size, color }) => <Monitor size={size} color={color} /> },
              { value: 'dark', label: 'Dark', icon: ({ size, color }) => <Moon size={size} color={color} /> },
            ]}
            isDark={isDark}
          />
        </Card>

        {/* Equipment */}
        <View className="gap-2 mb-4">
          <Text className={`text-sm font-medium ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
            Equipment
          </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('SettingsBarbells')}
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
            onPress={() => navigation.navigate('SettingsPlates')}
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
          onPress={() => navigation.navigate('SettingsGoal')}
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
          <SegmentedControl
            value={settings.units}
            onValueChange={(value) => updateSettings({ units: value as 'imperial' | 'metric' })}
            options={[
              { value: 'imperial', label: 'Imperial (lbs)' },
              { value: 'metric', label: 'Metric (kg)' },
            ]}
            isDark={isDark}
          />
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
