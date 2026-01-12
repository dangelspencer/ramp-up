import { useCallback, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect, CommonActions } from '@react-navigation/native';
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
  Trash2,
  Clock,
} from 'lucide-react-native';
import { useSettings, useBarbells, useGoals } from '@/hooks';
import { Card, Switch } from '@/components/ui';
import { ConfirmModal } from '@/components/ui/Modal';
import { TimePickerModal } from '@/components/ui/TimePicker';
import { SegmentedControl } from '@/components/ui/Select';
import { RootStackParamList } from '../../App';
import { resetAllData } from '@/db/seed';

// Helper to format time for display (e.g., "6:00 PM")
function formatTimeForDisplay(timeString: string): string {
  const [hours, minutes] = timeString.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
}

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function SettingsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { effectiveTheme, settings, updateSettings } = useSettings();
  const isDark = effectiveTheme === 'dark';
  const { barbells, refresh: refreshBarbells } = useBarbells();
  const { progress, refresh: refreshGoals } = useGoals();

  const [showClearDataModal, setShowClearDataModal] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [showWorkoutTimePicker, setShowWorkoutTimePicker] = useState(false);
  const [showMeasurementTimePicker, setShowMeasurementTimePicker] = useState(false);

  // Refresh data when screen gains focus
  useFocusEffect(
    useCallback(() => {
      refreshBarbells();
      refreshGoals();
    }, [])
  );

  const handleThemeChange = (theme: 'light' | 'dark' | 'system') => {
    updateSettings({ theme });
  };

  const handleClearAllData = async () => {
    setIsClearing(true);
    try {
      // Reset all data in the database
      await resetAllData();

      // Reset onboarding status
      await updateSettings({ onboardingCompleted: false });

      setShowClearDataModal(false);

      // Navigate to onboarding and reset the navigation stack
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'Onboarding' }],
        })
      );
    } catch (_error) {
      Alert.alert('Error', 'Failed to clear data. Please try again.');
    } finally {
      setIsClearing(false);
    }
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

            {/* Workout Reminders */}
            <View>
              <Switch
                label="Workout Reminders"
                value={settings.workoutRemindersEnabled ?? true}
                onValueChange={(v) => updateSettings({ workoutRemindersEnabled: v })}
              />
              {settings.workoutRemindersEnabled && (
                <TouchableOpacity
                  onPress={() => setShowWorkoutTimePicker(true)}
                  className={`mt-2 ml-1 flex-row items-center justify-between py-2 px-3 rounded-lg ${isDark ? 'bg-zinc-700' : 'bg-zinc-100'}`}
                >
                  <View className="flex-row items-center gap-2">
                    <Clock size={16} color={isDark ? '#a1a1aa' : '#71717a'} />
                    <Text className={`text-sm ${isDark ? 'text-zinc-300' : 'text-zinc-600'}`}>
                      Reminder Time
                    </Text>
                  </View>
                  <Text className={`text-sm font-medium ${isDark ? 'text-orange-400' : 'text-orange-500'}`}>
                    {formatTimeForDisplay(settings.workoutReminderTime ?? '18:00')}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Measurement Reminders */}
            <View>
              <Switch
                label="Measurement Reminders"
                value={settings.measurementRemindersEnabled ?? false}
                onValueChange={(v) => updateSettings({ measurementRemindersEnabled: v })}
              />
              {settings.measurementRemindersEnabled && (
                <TouchableOpacity
                  onPress={() => setShowMeasurementTimePicker(true)}
                  className={`mt-2 ml-1 flex-row items-center justify-between py-2 px-3 rounded-lg ${isDark ? 'bg-zinc-700' : 'bg-zinc-100'}`}
                >
                  <View className="flex-row items-center gap-2">
                    <Clock size={16} color={isDark ? '#a1a1aa' : '#71717a'} />
                    <Text className={`text-sm ${isDark ? 'text-zinc-300' : 'text-zinc-600'}`}>
                      Reminder Time
                    </Text>
                  </View>
                  <Text className={`text-sm font-medium ${isDark ? 'text-orange-400' : 'text-orange-500'}`}>
                    {formatTimeForDisplay(settings.measurementReminderTime ?? '08:00')}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </Card>

        {/* Danger Zone */}
        <View className="gap-2 mb-4">
          <Text className={`text-sm font-medium ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
            Danger Zone
          </Text>
          <TouchableOpacity
            onPress={() => setShowClearDataModal(true)}
            className={`rounded-xl p-4 flex-row items-center justify-between ${isDark ? 'bg-red-950/50' : 'bg-red-50'}`}
          >
            <View className="flex-row items-center gap-3">
              <Trash2 size={20} color="#ef4444" />
              <View>
                <Text className="text-red-500 font-medium">Clear All Data</Text>
                <Text className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                  Reset app to initial state
                </Text>
              </View>
            </View>
            <ChevronRight size={18} color="#ef4444" />
          </TouchableOpacity>
        </View>

        {/* Spacer for tab bar */}
        <View className="h-8" />
      </ScrollView>

      {/* Clear Data Confirmation Modal */}
      <ConfirmModal
        visible={showClearDataModal}
        onClose={() => setShowClearDataModal(false)}
        onConfirm={handleClearAllData}
        title="Clear All Data?"
        message="This will permanently delete all your workouts, exercises, routines, programs, and body composition data. You will be taken through the onboarding process again. This cannot be undone."
        confirmText="Clear All Data"
        cancelText="Cancel"
        variant="destructive"
        loading={isClearing}
      />

      {/* Workout Time Picker Modal */}
      <TimePickerModal
        visible={showWorkoutTimePicker}
        onClose={() => setShowWorkoutTimePicker(false)}
        onSelect={(time) => updateSettings({ workoutReminderTime: time })}
        initialTime={settings.workoutReminderTime ?? '18:00'}
        title="Workout Reminder Time"
      />

      {/* Measurement Time Picker Modal */}
      <TimePickerModal
        visible={showMeasurementTimePicker}
        onClose={() => setShowMeasurementTimePicker(false)}
        onSelect={(time) => updateSettings({ measurementReminderTime: time })}
        initialTime={settings.measurementReminderTime ?? '08:00'}
        title="Measurement Reminder Time"
      />
    </SafeAreaView>
  );
}
