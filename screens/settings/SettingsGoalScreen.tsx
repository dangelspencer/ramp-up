import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  ChevronLeft,
  Target,
  Calendar,
  Flame,
  Trophy,
  Check,
  Trash2,
} from 'lucide-react-native';
import { useSettings, useGoals } from '@/hooks';
import { Card, Button } from '@/components/ui';
import { NumberInput } from '@/components/ui/Input';
import { ProgressBar, CircularProgress } from '@/components/ui/ProgressBar';
import { ConfirmModal } from '@/components/ui/Modal';
import { RootStackParamList } from '../../App';
import { getDayName } from '@/utils/formatting';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const DAYS_OF_WEEK = [
  { index: 0, short: 'Sun' },
  { index: 1, short: 'Mon' },
  { index: 2, short: 'Tue' },
  { index: 3, short: 'Wed' },
  { index: 4, short: 'Thu' },
  { index: 5, short: 'Fri' },
  { index: 6, short: 'Sat' },
];

export default function SettingsGoalScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { effectiveTheme } = useSettings();
  const isDark = effectiveTheme === 'dark';
  const {
    activeGoal,
    progress,
    isLoading,
    createGoal,
    updateGoal,
    deleteGoal,
    refresh,
  } = useGoals();

  const [workoutsPerWeek, setWorkoutsPerWeek] = useState<number | null>(activeGoal?.workoutsPerWeek ?? 3);
  const [scheduledDays, setScheduledDays] = useState<number[]>(() => {
    if (activeGoal?.scheduledDays) {
      try {
        return JSON.parse(activeGoal.scheduledDays);
      } catch {
        return [1, 3, 5]; // Mon, Wed, Fri default
      }
    }
    return [1, 3, 5];
  });
  const [totalWeeks, setTotalWeeks] = useState<number | null>(activeGoal?.totalWeeks ?? null);

  const [isSaving, setIsSaving] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Update form when activeGoal changes
  useEffect(() => {
    if (activeGoal) {
      setWorkoutsPerWeek(activeGoal.workoutsPerWeek);
      try {
        setScheduledDays(JSON.parse(activeGoal.scheduledDays));
      } catch {
        setScheduledDays([1, 3, 5]);
      }
      setTotalWeeks(activeGoal.totalWeeks ?? null);
    }
  }, [activeGoal]);

  // Check for changes
  useEffect(() => {
    if (!activeGoal) {
      setHasChanges(workoutsPerWeek !== null && scheduledDays.length > 0);
      return;
    }

    const currentDays = JSON.parse(activeGoal.scheduledDays);
    const daysChanged =
      scheduledDays.length !== currentDays.length ||
      !scheduledDays.every((d) => currentDays.includes(d));

    const changed =
      workoutsPerWeek !== activeGoal.workoutsPerWeek ||
      daysChanged ||
      totalWeeks !== activeGoal.totalWeeks;

    setHasChanges(changed);
  }, [workoutsPerWeek, scheduledDays, totalWeeks, activeGoal]);

  const toggleDay = (dayIndex: number) => {
    setScheduledDays((prev) => {
      if (prev.includes(dayIndex)) {
        return prev.filter((d) => d !== dayIndex);
      }
      return [...prev, dayIndex].sort((a, b) => a - b);
    });
  };

  const handleSave = async () => {
    if (!workoutsPerWeek || scheduledDays.length === 0) {
      return;
    }

    try {
      setIsSaving(true);

      if (activeGoal) {
        await updateGoal(activeGoal.id, {
          workoutsPerWeek,
          scheduledDays,
          totalWeeks: totalWeeks ?? null,
        });
      } else {
        await createGoal(
          workoutsPerWeek,
          scheduledDays,
          undefined,
          totalWeeks ?? undefined
        );
      }

      navigation.goBack();
    } catch (error) {
      console.error('Failed to save goal:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (activeGoal) {
      await deleteGoal(activeGoal.id);
    }
    setDeleteModalVisible(false);
    navigation.goBack();
  };

  const progressPercent = progress
    ? Math.min(100, (progress.workoutsThisWeek / progress.workoutsTarget) * 100)
    : 0;

  const today = new Date().getDay();

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: isDark ? '#09090b' : '#f4f4f5' }}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className={`p-2 rounded-lg ${isDark ? 'bg-zinc-800' : 'bg-white'}`}
        >
          <ChevronLeft size={24} color={isDark ? '#ffffff' : '#18181b'} />
        </TouchableOpacity>
        <Text className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-zinc-900'}`}>
          Weekly Goal
        </Text>
        <View className="w-10" />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          className="flex-1 px-4"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Progress Card - only show if goal exists */}
          {activeGoal && progress && (
            <Card variant="elevated" className="mb-4">
              <View className="flex-row items-center gap-2 mb-4">
                <View className={`p-2 rounded-lg ${isDark ? 'bg-orange-500/20' : 'bg-orange-100'}`}>
                  <Target size={20} color="#f97316" />
                </View>
                <View>
                  <Text className={`font-semibold ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                    This Week's Progress
                  </Text>
                  <Text className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                    {progress.isOnTrack ? 'On track!' : 'Keep going!'}
                  </Text>
                </View>
              </View>

              <View className="flex-row items-center justify-between mb-4">
                <View className="items-center flex-1">
                  <CircularProgress
                    progress={progressPercent}
                    size={100}
                    strokeWidth={10}
                    color={progress.isOnTrack ? 'success' : 'warning'}
                  >
                    <View className="items-center">
                      <Text className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                        {progress.workoutsThisWeek}
                      </Text>
                      <Text className={`text-xs ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                        of {progress.workoutsTarget}
                      </Text>
                    </View>
                  </CircularProgress>
                </View>

                <View className="flex-1 gap-3">
                  <View className="flex-row items-center gap-2">
                    <Flame size={18} color="#f97316" />
                    <View>
                      <Text className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                        Streak
                      </Text>
                      <Text className={`font-semibold ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                        {progress.streakWeeks} {progress.streakWeeks === 1 ? 'week' : 'weeks'}
                      </Text>
                    </View>
                  </View>

                  {progress.nextScheduledDay !== null && (
                    <View className="flex-row items-center gap-2">
                      <Calendar size={18} color="#3b82f6" />
                      <View>
                        <Text className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                          Next Workout
                        </Text>
                        <Text className={`font-semibold ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                          {progress.nextScheduledDay === today
                            ? 'Today'
                            : getDayName(progress.nextScheduledDay)}
                        </Text>
                      </View>
                    </View>
                  )}
                </View>
              </View>
            </Card>
          )}

          {/* Goal Settings Card */}
          <Card variant="elevated" className="mb-4">
            <View className="flex-row items-center gap-2 mb-4">
              <View className={`p-2 rounded-lg ${isDark ? 'bg-blue-500/20' : 'bg-blue-100'}`}>
                <Trophy size={20} color="#3b82f6" />
              </View>
              <View>
                <Text className={`font-semibold ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                  {activeGoal ? 'Edit Goal' : 'Set Your Goal'}
                </Text>
                <Text className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                  How many times per week do you want to train?
                </Text>
              </View>
            </View>

            <NumberInput
              label="Workouts per Week"
              value={workoutsPerWeek}
              onChangeValue={setWorkoutsPerWeek}
              placeholder="e.g., 3"
              min={1}
              max={7}
              isDark={isDark}
            />
          </Card>

          {/* Schedule Card */}
          <Card variant="elevated" className="mb-4">
            <View className="flex-row items-center gap-2 mb-4">
              <View className={`p-2 rounded-lg ${isDark ? 'bg-green-500/20' : 'bg-green-100'}`}>
                <Calendar size={20} color="#22c55e" />
              </View>
              <View>
                <Text className={`font-semibold ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                  Schedule
                </Text>
                <Text className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                  Select your preferred workout days
                </Text>
              </View>
            </View>

            <View className="flex-row justify-between">
              {DAYS_OF_WEEK.map((day) => {
                const isSelected = scheduledDays.includes(day.index);
                const isToday = day.index === today;

                return (
                  <TouchableOpacity
                    key={day.index}
                    onPress={() => toggleDay(day.index)}
                    className={`w-10 h-10 rounded-full items-center justify-center ${
                      isSelected
                        ? 'bg-orange-500'
                        : isDark
                        ? 'bg-zinc-700'
                        : 'bg-zinc-200'
                    } ${isToday && !isSelected ? 'border-2 border-orange-500' : ''}`}
                  >
                    {isSelected ? (
                      <Check size={18} color="#ffffff" />
                    ) : (
                      <Text
                        className={`text-xs font-medium ${
                          isDark ? 'text-zinc-400' : 'text-zinc-500'
                        }`}
                      >
                        {day.short}
                      </Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text className={`text-sm mt-3 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
              {scheduledDays.length === 0
                ? 'Select at least one day'
                : `${scheduledDays.length} ${scheduledDays.length === 1 ? 'day' : 'days'} selected: ${scheduledDays.map((d) => getDayName(d, true)).join(', ')}`}
            </Text>
          </Card>

          {/* Duration Card */}
          <Card variant="elevated" className="mb-4">
            <View className="flex-row items-center gap-2 mb-4">
              <View className={`p-2 rounded-lg ${isDark ? 'bg-purple-500/20' : 'bg-purple-100'}`}>
                <Target size={20} color="#a855f7" />
              </View>
              <View>
                <Text className={`font-semibold ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                  Duration (Optional)
                </Text>
                <Text className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                  Set a time limit for your goal
                </Text>
              </View>
            </View>

            <NumberInput
              label="Total Weeks"
              value={totalWeeks}
              onChangeValue={setTotalWeeks}
              placeholder="Leave empty for indefinite"
              min={1}
              max={52}
              isDark={isDark}
              hint="Leave empty to track indefinitely"
            />
          </Card>

          {/* Delete Goal Button */}
          {activeGoal && (
            <TouchableOpacity
              onPress={() => setDeleteModalVisible(true)}
              className={`flex-row items-center justify-center gap-2 p-4 rounded-xl mb-4 ${
                isDark ? 'bg-red-500/10' : 'bg-red-50'
              }`}
            >
              <Trash2 size={20} color="#ef4444" />
              <Text className="text-red-500 font-medium">Delete Goal</Text>
            </TouchableOpacity>
          )}

          {/* Spacer */}
          <View className="h-24" />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Save Button */}
      <View
        className={`px-4 py-4 border-t ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'}`}
      >
        <Button
          onPress={handleSave}
          loading={isSaving}
          disabled={!hasChanges || !workoutsPerWeek || scheduledDays.length === 0 || isSaving}
          fullWidth
          size="lg"
        >
          {activeGoal ? 'Update Goal' : 'Set Goal'}
        </Button>
      </View>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        visible={deleteModalVisible}
        onClose={() => setDeleteModalVisible(false)}
        onConfirm={handleDelete}
        title="Delete Goal"
        message="Are you sure you want to delete your weekly goal? Your progress and streak will be lost."
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
      />
    </SafeAreaView>
  );
}
