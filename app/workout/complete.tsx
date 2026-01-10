import React, { useEffect } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSettings, useActiveWorkout, useGoals } from '@/hooks';
import { Button, Card } from '@/components/ui';
import { CheckCircle, TrendingUp, Trophy, Home } from 'lucide-react-native';
import { AutoProgressionResult } from '@/services/workout.service';
import { formatWeight } from '@/utils/formatting';

export default function WorkoutCompleteScreen() {
  const router = useRouter();
  const { progressions } = useLocalSearchParams<{ progressions?: string }>();
  const { effectiveTheme, settings } = useSettings();
  const isDark = effectiveTheme === 'dark';

  const { clearProgressionResults } = useActiveWorkout();
  const { checkAndUpdateStreak } = useGoals();

  const progressionResults: AutoProgressionResult[] = progressions
    ? JSON.parse(progressions)
    : [];

  useEffect(() => {
    // Check and update streak after completing workout
    checkAndUpdateStreak();
  }, [checkAndUpdateStreak]);

  const handleGoHome = () => {
    clearProgressionResults();
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView className={`flex-1 ${isDark ? 'bg-zinc-950' : 'bg-zinc-100'}`}>
      <ScrollView className="flex-1 px-4" contentContainerClassName="flex-1">
        {/* Success Header */}
        <View className="items-center pt-12 pb-8">
          <View className="bg-green-500 rounded-full p-4 mb-4">
            <CheckCircle size={48} color="#ffffff" />
          </View>
          <Text className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>
            Workout Complete!
          </Text>
          <Text className={`mt-2 text-center ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
            Great job! You crushed it.
          </Text>
        </View>

        {/* Auto-Progression Results */}
        {progressionResults.length > 0 && (
          <Card variant="elevated" className="mb-4">
            <View className="flex-row items-center gap-2 mb-3">
              <TrendingUp size={20} color="#22c55e" />
              <Text className={`font-semibold ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                Max Weight Increased!
              </Text>
            </View>
            <Text className={`mb-3 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
              You completed all your sets, so we've increased your max for these exercises:
            </Text>
            {progressionResults.map((result) => (
              <View
                key={result.exerciseId}
                className={`flex-row items-center justify-between py-2 border-b ${
                  isDark ? 'border-zinc-700' : 'border-zinc-200'
                } last:border-b-0`}
              >
                <Text className={isDark ? 'text-white' : 'text-zinc-900'}>
                  {result.exerciseName}
                </Text>
                <View className="flex-row items-center gap-1">
                  <Text className={isDark ? 'text-zinc-400' : 'text-zinc-500'}>
                    {formatWeight(result.previousMax, settings.units)}
                  </Text>
                  <Text className="text-green-500 font-semibold">→</Text>
                  <Text className="text-green-500 font-semibold">
                    {formatWeight(result.newMax, settings.units)}
                  </Text>
                </View>
              </View>
            ))}
          </Card>
        )}

        {/* Encouragement */}
        {progressionResults.length === 0 && (
          <Card variant="elevated" className="mb-4">
            <View className="flex-row items-center gap-2 mb-2">
              <Trophy size={20} color="#f97316" />
              <Text className={`font-semibold ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                Keep it up!
              </Text>
            </View>
            <Text className={isDark ? 'text-zinc-400' : 'text-zinc-500'}>
              Consistency is key. Complete all your target reps to increase your max weight
              automatically next time.
            </Text>
          </Card>
        )}

        {/* Spacer */}
        <View className="flex-1" />

        {/* Actions */}
        <View className="gap-3 pb-6">
          <Button onPress={handleGoHome} fullWidth size="lg" icon={<Home size={20} color="#ffffff" />}>
            Back to Home
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
