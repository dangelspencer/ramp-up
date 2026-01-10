import { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Calendar, ChevronRight, Dumbbell, Clock, CheckCircle } from 'lucide-react-native';
import { useSettings, useWorkoutHistory } from '@/hooks';
import { formatWeight } from '@/utils/formatting';

function formatDate(dateString: string | null): string {
  if (!dateString) return 'Unknown date';
  const date = new Date(dateString);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return 'Today';
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  } else {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
}

function formatDuration(startedAt: string, completedAt: string | null): string {
  if (!completedAt) return '-';
  const start = new Date(startedAt);
  const end = new Date(completedAt);
  const minutes = Math.round((end.getTime() - start.getTime()) / (1000 * 60));

  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
}

export default function HistoryScreen() {
  const router = useRouter();
  const { effectiveTheme, settings } = useSettings();
  const isDark = effectiveTheme === 'dark';

  const { workouts, isLoading, refresh } = useWorkoutHistory();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }, [refresh]);

  const handleWorkoutPress = (workoutId: string) => {
    router.push(`/workout/details/${workoutId}` as any);
  };

  // Group workouts by date
  const groupedWorkouts = workouts.reduce(
    (groups, workout) => {
      const dateKey = workout.completedAt
        ? new Date(workout.completedAt).toDateString()
        : 'Unknown';
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(workout);
      return groups;
    },
    {} as Record<string, typeof workouts>
  );

  const dateKeys = Object.keys(groupedWorkouts).sort((a, b) => {
    if (a === 'Unknown') return 1;
    if (b === 'Unknown') return -1;
    return new Date(b).getTime() - new Date(a).getTime();
  });

  return (
    <SafeAreaView className={`flex-1 ${isDark ? 'bg-zinc-950' : 'bg-zinc-100'}`}>
      <View className="flex-1 px-4">
        {/* Header */}
        <View className="pt-4 pb-4">
          <Text className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>
            History
          </Text>
          <Text className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
            {workouts.length} workout{workouts.length !== 1 ? 's' : ''} completed
          </Text>
        </View>

        {/* Workout List */}
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={isDark ? '#f97316' : '#f97316'}
            />
          }
        >
          {workouts.length === 0 ? (
            <View className="items-center py-12">
              <View className={`p-4 rounded-full mb-3 ${isDark ? 'bg-zinc-800' : 'bg-zinc-200'}`}>
                <Calendar size={32} color={isDark ? '#71717a' : '#a1a1aa'} />
              </View>
              <Text className={`text-lg font-medium mb-1 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                No workouts yet
              </Text>
              <Text className={`text-center ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                Complete your first workout to see it here
              </Text>
            </View>
          ) : (
            dateKeys.map((dateKey) => (
              <View key={dateKey} className="mb-4">
                {/* Date Header */}
                <Text
                  className={`text-sm font-medium mb-2 ${
                    isDark ? 'text-zinc-400' : 'text-zinc-500'
                  }`}
                >
                  {formatDate(groupedWorkouts[dateKey][0].completedAt)}
                </Text>

                {/* Workouts for this date */}
                {groupedWorkouts[dateKey].map((workout) => {
                  const completedSets = workout.exercises.reduce(
                    (sum, ex) => sum + ex.sets.filter((s) => s.completed).length,
                    0
                  );
                  const totalSets = workout.exercises.reduce(
                    (sum, ex) => sum + ex.sets.length,
                    0
                  );
                  const totalVolume = workout.exercises.reduce(
                    (sum, ex) =>
                      sum +
                      ex.sets.reduce(
                        (setSum, s) =>
                          setSum + (s.actualWeight ?? s.targetWeight) * (s.actualReps ?? 0),
                        0
                      ),
                    0
                  );

                  return (
                    <TouchableOpacity
                      key={workout.id}
                      onPress={() => handleWorkoutPress(workout.id)}
                      className={`rounded-xl p-4 mb-2 ${isDark ? 'bg-zinc-800' : 'bg-white'}`}
                      activeOpacity={0.7}
                    >
                      <View className="flex-row items-center justify-between mb-2">
                        <Text
                          className={`font-semibold text-lg ${
                            isDark ? 'text-white' : 'text-zinc-900'
                          }`}
                        >
                          {workout.routine.name}
                        </Text>
                        <ChevronRight size={20} color={isDark ? '#71717a' : '#a1a1aa'} />
                      </View>

                      {/* Stats Row */}
                      <View className="flex-row gap-4">
                        <View className="flex-row items-center gap-1">
                          <Dumbbell size={14} color={isDark ? '#71717a' : '#a1a1aa'} />
                          <Text className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                            {workout.exercises.length} exercise
                            {workout.exercises.length !== 1 ? 's' : ''}
                          </Text>
                        </View>
                        <View className="flex-row items-center gap-1">
                          <CheckCircle size={14} color={isDark ? '#71717a' : '#a1a1aa'} />
                          <Text className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                            {completedSets}/{totalSets} sets
                          </Text>
                        </View>
                        <View className="flex-row items-center gap-1">
                          <Clock size={14} color={isDark ? '#71717a' : '#a1a1aa'} />
                          <Text className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                            {formatDuration(workout.startedAt, workout.completedAt)}
                          </Text>
                        </View>
                      </View>

                      {/* Volume */}
                      {totalVolume > 0 && (
                        <Text
                          className={`text-sm mt-2 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}
                        >
                          Total volume: {formatWeight(totalVolume, settings.units)}
                        </Text>
                      )}

                      {/* Exercise Summary */}
                      <View className="mt-3 pt-3 border-t border-zinc-700/30">
                        <Text
                          className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}
                          numberOfLines={2}
                        >
                          {workout.exercises.map((ex) => ex.exercise.name).join(' • ')}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))
          )}
          {/* Spacer for tab bar */}
          <View className="h-8" />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
