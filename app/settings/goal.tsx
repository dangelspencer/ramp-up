import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft, Flame, Calendar } from 'lucide-react-native';
import { useSettings, useGoals } from '@/hooks';
import { Button, Card, ProgressBar } from '@/components/ui';

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function GoalSettingsScreen() {
  const router = useRouter();
  const { effectiveTheme } = useSettings();
  const isDark = effectiveTheme === 'dark';
  const { activeGoal, progress, refresh, createGoal, updateGoal } = useGoals();

  const [workoutsPerWeek, setWorkoutsPerWeek] = useState<number>(activeGoal?.workoutsPerWeek ?? 3);
  const [scheduledDays, setScheduledDays] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (activeGoal) {
      setWorkoutsPerWeek(activeGoal.workoutsPerWeek);
      try {
        setScheduledDays(JSON.parse(activeGoal.scheduledDays) ?? []);
      } catch {
        setScheduledDays([]);
      }
    }
  }, [activeGoal]);

  const toggleDay = (dayIndex: number) => {
    setScheduledDays((prev) => {
      if (prev.includes(dayIndex)) {
        return prev.filter((d) => d !== dayIndex);
      }
      return [...prev, dayIndex].sort();
    });
  };

  const handleSave = async () => {
    if (workoutsPerWeek < 1 || workoutsPerWeek > 7) {
      Alert.alert('Error', 'Please select 1-7 workouts per week');
      return;
    }

    setIsSubmitting(true);
    try {
      if (activeGoal) {
        await updateGoal(activeGoal.id, { workoutsPerWeek, scheduledDays });
      } else {
        await createGoal(workoutsPerWeek, scheduledDays);
      }
      await refresh();
      router.back();
    } catch (error) {
      Alert.alert('Error', 'Failed to save goal');
    } finally {
      setIsSubmitting(false);
    }
  };

  const progressPercentage = progress ? (progress.workoutsThisWeek / progress.workoutsTarget) * 100 : 0;

  return (
    <SafeAreaView className={`flex-1 ${isDark ? 'bg-zinc-950' : 'bg-zinc-100'}`}>
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 gap-3">
        <TouchableOpacity onPress={() => router.back()}>
          <ChevronLeft size={24} color={isDark ? '#ffffff' : '#18181b'} />
        </TouchableOpacity>
        <Text className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-zinc-900'}`}>
          Weekly Goal
        </Text>
      </View>

      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        <View className="gap-4 pb-8">
          {/* Current Progress */}
          {progress && (
            <Card variant="elevated">
              <View className="flex-row items-center gap-2 mb-3">
                <Flame size={20} color="#f97316" />
                <Text className={`font-medium ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                  This Week
                </Text>
              </View>
              <View className="flex-row items-center justify-between mb-2">
                <Text className={isDark ? 'text-zinc-400' : 'text-zinc-500'}>Progress</Text>
                <Text className={`font-semibold ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                  {progress.workoutsThisWeek} / {progress.workoutsTarget} workouts
                </Text>
              </View>
              <ProgressBar progress={progressPercentage} color="primary" />
              {activeGoal?.currentStreak != null && activeGoal.currentStreak > 0 && (
                <View className="mt-3 flex-row items-center gap-2">
                  <Calendar size={16} color={isDark ? '#a1a1aa' : '#71717a'} />
                  <Text className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                    {activeGoal.currentStreak} week streak!
                  </Text>
                </View>
              )}
            </Card>
          )}

          {/* Workouts Per Week */}
          <Card variant="elevated">
            <Text className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
              Workouts Per Week
            </Text>
            <View className="flex-row gap-2 flex-wrap">
              {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                <TouchableOpacity
                  key={num}
                  onPress={() => setWorkoutsPerWeek(num)}
                  className={`w-10 h-10 rounded-full items-center justify-center ${
                    workoutsPerWeek === num
                      ? 'bg-orange-500'
                      : isDark
                        ? 'bg-zinc-700'
                        : 'bg-zinc-100'
                  }`}
                >
                  <Text
                    className={`font-medium ${
                      workoutsPerWeek === num ? 'text-white' : isDark ? 'text-zinc-300' : 'text-zinc-700'
                    }`}
                  >
                    {num}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Card>

          {/* Scheduled Days */}
          <Card variant="elevated">
            <Text className={`font-medium mb-1 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
              Preferred Workout Days
            </Text>
            <Text className={`text-sm mb-3 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
              Select the days you plan to work out (optional)
            </Text>
            <View className="flex-row gap-2">
              {DAYS_OF_WEEK.map((day, index) => (
                <TouchableOpacity
                  key={day}
                  onPress={() => toggleDay(index)}
                  className={`flex-1 py-2 rounded-lg items-center ${
                    scheduledDays.includes(index)
                      ? 'bg-orange-500'
                      : isDark
                        ? 'bg-zinc-700'
                        : 'bg-zinc-100'
                  }`}
                >
                  <Text
                    className={`text-xs font-medium ${
                      scheduledDays.includes(index)
                        ? 'text-white'
                        : isDark
                          ? 'text-zinc-300'
                          : 'text-zinc-700'
                    }`}
                  >
                    {day}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Card>

          {/* Info */}
          <View className={`p-3 rounded-lg ${isDark ? 'bg-zinc-800/50' : 'bg-zinc-200/50'}`}>
            <Text className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
              Meeting your weekly goal each week increases your streak. Streaks reset if you miss a week.
            </Text>
          </View>

          {/* Save Button */}
          <View className="pt-4">
            <Button onPress={handleSave} loading={isSubmitting} fullWidth size="lg">
              {activeGoal ? 'Update Goal' : 'Set Goal'}
            </Button>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
