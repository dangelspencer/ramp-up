import React, { useEffect } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Trophy, TrendingUp, Clock, Dumbbell, Check } from 'lucide-react-native';

import { RootStackParamList } from '../../App';
import { useSettings, useActiveWorkout, useWorkoutHistory } from '@/hooks';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { formatWeight, formatWorkoutDuration } from '@/utils/formatting';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function WorkoutCompleteScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { effectiveTheme, settings } = useSettings();
  const isDark = effectiveTheme === 'dark';

  const { state, clearProgressionResults } = useActiveWorkout();
  const { workouts, refresh } = useWorkoutHistory(1);

  // Refresh workout history to get the latest completed workout
  useEffect(() => {
    refresh();
  }, [refresh]);

  const latestWorkout = workouts[0];
  const progressionResults = state.autoProgressionResults;

  const handleDone = () => {
    clearProgressionResults();
    navigation.reset({
      index: 0,
      routes: [{ name: 'Main' }],
    });
  };

  // Calculate summary stats from the latest workout
  const totalSets = latestWorkout?.exercises.reduce((acc, e) => acc + e.sets.length, 0) || 0;
  const completedSets = latestWorkout?.exercises.reduce(
    (acc, e) => acc + e.sets.filter((s) => s.completed).length,
    0
  ) || 0;
  const totalVolume = latestWorkout?.exercises.reduce((acc, e) => {
    return acc + e.sets.reduce((setAcc, s) => {
      if (s.completed && s.actualWeight && s.actualReps) {
        return setAcc + s.actualWeight * s.actualReps;
      }
      return setAcc;
    }, 0);
  }, 0) || 0;

  const duration = latestWorkout?.startedAt && latestWorkout?.completedAt
    ? formatWorkoutDuration(latestWorkout.startedAt, latestWorkout.completedAt)
    : '--';

  const exerciseCount = latestWorkout?.exercises.length || 0;

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: isDark ? '#09090b' : '#f4f4f5' }}>
      <ScrollView className="flex-1 px-4">
        {/* Header with Trophy */}
        <View className="items-center pt-8 pb-6">
          <View className="w-20 h-20 rounded-full bg-green-500/20 items-center justify-center mb-4">
            <Trophy size={40} color="#22c55e" />
          </View>
          <Text className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>
            Workout Complete!
          </Text>
          <Text className={`text-base mt-1 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
            {latestWorkout?.routine.name || 'Great work!'}
          </Text>
        </View>

        {/* Summary Stats */}
        <View className="flex-row gap-3 mb-6 mt-4">
          <Card className="flex-1">
            <View className="items-center py-2">
              <Clock size={20} color={isDark ? '#a1a1aa' : '#71717a'} />
              <Text className={`text-xl font-bold mt-1 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                {duration}
              </Text>
              <Text className={`text-xs ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                Duration
              </Text>
            </View>
          </Card>

          <Card className="flex-1">
            <View className="items-center py-2">
              <Dumbbell size={20} color={isDark ? '#a1a1aa' : '#71717a'} />
              <Text className={`text-xl font-bold mt-1 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                {exerciseCount}
              </Text>
              <Text className={`text-xs ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                Exercises
              </Text>
            </View>
          </Card>

          <Card className="flex-1">
            <View className="items-center py-2">
              <Check size={20} color={isDark ? '#a1a1aa' : '#71717a'} />
              <Text className={`text-xl font-bold mt-1 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                {completedSets}/{totalSets}
              </Text>
              <Text className={`text-xs ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                Sets
              </Text>
            </View>
          </Card>
        </View>

        {/* Total Volume */}
        <Card className="mb-6 mt-4">
          <View className="items-center py-4">
            <Text className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
              Total Volume
            </Text>
            <Text className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>
              {formatWeight(totalVolume, settings.units === 'imperial' ? 'lbs' : 'kg')}
            </Text>
          </View>
        </Card>

        {/* Auto-Progression Results */}
        {progressionResults.length > 0 && (
          <Card className="mb-6">
            <CardHeader
              title="Weight Increased!"
              subtitle="Auto-progression applied"
              icon={<TrendingUp size={20} color="#22c55e" />}
            />
            <CardContent>
              {progressionResults.map((result, index) => (
                <View
                  key={result.exerciseId}
                  className={`py-3 ${
                    index > 0 ? `border-t ${isDark ? 'border-zinc-700' : 'border-zinc-200'}` : ''
                  }`}
                >
                  <Text className={`font-medium ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                    {result.exerciseName}
                  </Text>
                  <View className="flex-row items-center mt-1">
                    <Text className={`${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                      {formatWeight(result.previousMax, settings.units === 'imperial' ? 'lbs' : 'kg')}
                    </Text>
                    <TrendingUp size={16} color="#22c55e" className="mx-2" />
                    <Text className="text-green-500 font-semibold">
                      {formatWeight(result.newMax, settings.units === 'imperial' ? 'lbs' : 'kg')}
                    </Text>
                  </View>
                </View>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Exercise Breakdown */}
        <Card className="mb-6 mt-4">
          <CardHeader title="Exercise Summary" />
          <CardContent>
            {latestWorkout?.exercises.map((exercise, index) => {
              const exerciseCompletedSets = exercise.sets.filter((s) => s.completed).length;
              const exerciseTotalSets = exercise.sets.length;
              const maxWeight = Math.max(
                ...exercise.sets
                  .filter((s) => s.completed && s.actualWeight)
                  .map((s) => s.actualWeight || 0)
              );

              return (
                <View
                  key={exercise.id}
                  className={`py-3 ${
                    index > 0 ? `border-t ${isDark ? 'border-zinc-700' : 'border-zinc-200'}` : ''
                  }`}
                >
                  <View className="flex-row items-center justify-between">
                    <Text className={`font-medium ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                      {exercise.exercise.name}
                    </Text>
                    <View className="flex-row items-center gap-2">
                      {exerciseCompletedSets === exerciseTotalSets && (
                        <View className="w-5 h-5 rounded-full bg-green-500 items-center justify-center">
                          <Check size={12} color="#ffffff" />
                        </View>
                      )}
                      <Text className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                        {exerciseCompletedSets}/{exerciseTotalSets} sets
                      </Text>
                    </View>
                  </View>
                  {maxWeight > 0 && (
                    <Text className={`text-sm mt-1 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                      Top weight: {formatWeight(maxWeight, settings.units === 'imperial' ? 'lbs' : 'kg')}
                    </Text>
                  )}
                </View>
              );
            })}
          </CardContent>
        </Card>

        {/* Spacer */}
        <View className="h-4" />
      </ScrollView>

      {/* Done Button */}
      <View className={`px-4 py-4 border-t ${isDark ? 'border-zinc-800' : 'border-zinc-200'}`}>
        <Button onPress={handleDone} fullWidth>
          Done
        </Button>
      </View>
    </SafeAreaView>
  );
}
