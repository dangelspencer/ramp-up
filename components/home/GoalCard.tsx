import React from 'react';
import { View, Text } from 'react-native';
import { useSettings } from '@/hooks';
import { Card } from '@/components/ui';
import { Target, Flame, Check, ChevronRight } from 'lucide-react-native';
import { GoalProgress } from '@/services/goal.service';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface GoalCardProps {
  progress: GoalProgress;
  onPress: () => void;
}

export function GoalCard({ progress, onPress }: GoalCardProps) {
  const { effectiveTheme } = useSettings();
  const isDark = effectiveTheme === 'dark';

  const today = new Date().getDay();

  return (
    <Card variant="elevated" onPress={onPress} className="mb-4">
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center gap-2">
          <View className={`p-2 rounded-lg ${isDark ? 'bg-purple-500/20' : 'bg-purple-100'}`}>
            <Target size={20} color="#a855f7" />
          </View>
          <View>
            <Text className={`font-semibold ${isDark ? 'text-white' : 'text-zinc-900'}`}>
              Weekly Goal
            </Text>
            <Text className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
              {progress.workoutsThisWeek}/{progress.workoutsTarget} workouts
            </Text>
          </View>
        </View>
        <ChevronRight size={20} color={isDark ? '#71717a' : '#a1a1aa'} />
      </View>

      {/* Day indicators */}
      <View className="flex-row justify-between mb-3">
        {DAYS.map((day, index) => {
          const isScheduled = progress.scheduledDays.includes(index);
          const isCompleted = (progress.completedDays ?? []).includes(index);
          const isToday = index === today;

          return (
            <View key={day} className="items-center">
              <Text
                className={`text-xs mb-1 ${
                  isToday
                    ? 'text-orange-500 font-semibold'
                    : isDark
                    ? 'text-zinc-500'
                    : 'text-zinc-400'
                }`}
              >
                {day}
              </Text>
              <View
                className={`w-8 h-8 rounded-full items-center justify-center ${
                  isCompleted
                    ? 'bg-green-500'
                    : isScheduled
                    ? isToday
                      ? 'bg-orange-500'
                      : isDark
                      ? 'bg-zinc-700'
                      : 'bg-zinc-200'
                    : 'bg-transparent'
                }`}
              >
                {isCompleted && <Check size={14} color="#ffffff" />}
                {!isCompleted && isScheduled && (
                  <View
                    className={`w-2 h-2 rounded-full ${
                      isToday ? 'bg-white' : isDark ? 'bg-zinc-500' : 'bg-zinc-400'
                    }`}
                  />
                )}
              </View>
            </View>
          );
        })}
      </View>

      {/* Streak */}
      {progress.streakWeeks > 0 && (
        <View className={`flex-row items-center gap-2 p-2 rounded-lg ${isDark ? 'bg-orange-500/20' : 'bg-orange-50'}`}>
          <Flame size={18} color="#f97316" />
          <Text className={`font-medium ${isDark ? 'text-orange-400' : 'text-orange-600'}`}>
            {progress.streakWeeks} week streak!
          </Text>
        </View>
      )}

      {/* Status */}
      {!progress.isOnTrack && (
        <View className={`flex-row items-center gap-2 p-2 rounded-lg mt-2 ${isDark ? 'bg-yellow-500/20' : 'bg-yellow-50'}`}>
          <Text className={`text-sm ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`}>
            You're behind on your weekly goal
          </Text>
        </View>
      )}
    </Card>
  );
}

interface NoGoalCardProps {
  onSetGoal: () => void;
}

export function NoGoalCard({ onSetGoal }: NoGoalCardProps) {
  const { effectiveTheme } = useSettings();
  const isDark = effectiveTheme === 'dark';

  return (
    <Card variant="outlined" onPress={onSetGoal} className="mb-4">
      <View className="flex-row items-center gap-3">
        <View className={`p-2 rounded-lg ${isDark ? 'bg-zinc-800' : 'bg-zinc-100'}`}>
          <Target size={20} color={isDark ? '#71717a' : '#a1a1aa'} />
        </View>
        <View className="flex-1">
          <Text className={`font-medium ${isDark ? 'text-white' : 'text-zinc-900'}`}>
            Set a Weekly Goal
          </Text>
          <Text className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
            Track your consistency and build streaks
          </Text>
        </View>
        <ChevronRight size={20} color={isDark ? '#71717a' : '#a1a1aa'} />
      </View>
    </Card>
  );
}
