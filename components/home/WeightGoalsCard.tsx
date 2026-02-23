import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useSettings } from '@/hooks';
import { Card } from '@/components/ui';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Target, ChevronRight, Check } from 'lucide-react-native';
import { Exercise } from '@/db/schema';
import { formatWeight } from '@/utils/formatting';

interface WeightGoalsCardProps {
  exercises: Exercise[];
  onExercisePress: (id: string) => void;
}

export function WeightGoalsCard({ exercises, onExercisePress }: WeightGoalsCardProps) {
  const { effectiveTheme, settings } = useSettings();
  const isDark = effectiveTheme === 'dark';

  const achievedCount = exercises.filter((e) => e.maxWeight >= e.goalWeight!).length;
  const displayExercises = exercises.slice(0, 5);

  const getDisplayWeight = (weightInLbs: number) => {
    return settings.units === 'metric' ? weightInLbs / 2.20462 : weightInLbs;
  };

  return (
    <Card variant="elevated" className="mb-4">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center gap-2">
          <View className={`p-2 rounded-lg ${isDark ? 'bg-emerald-500/20' : 'bg-emerald-100'}`}>
            <Target size={20} color="#10b981" />
          </View>
          <View>
            <Text className={`font-semibold ${isDark ? 'text-white' : 'text-zinc-900'}`}>
              Weight Goals
            </Text>
            <Text className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
              {achievedCount}/{exercises.length} achieved
            </Text>
          </View>
        </View>
        <ChevronRight size={20} color={isDark ? '#71717a' : '#a1a1aa'} />
      </View>

      {/* Exercise rows */}
      {displayExercises.map((exercise) => {
        const progressPercent = Math.min(100, (exercise.maxWeight / exercise.goalWeight!) * 100);
        const achieved = exercise.maxWeight >= exercise.goalWeight!;
        const currentDisplay = getDisplayWeight(exercise.maxWeight);
        const goalDisplay = getDisplayWeight(exercise.goalWeight!);

        return (
          <TouchableOpacity
            key={exercise.id}
            onPress={() => onExercisePress(exercise.id)}
            activeOpacity={0.7}
            className="mb-3"
          >
            <View className="flex-row items-center justify-between mb-1">
              <Text
                className={`text-sm font-medium flex-1 ${isDark ? 'text-white' : 'text-zinc-900'}`}
                numberOfLines={1}
              >
                {exercise.name}
              </Text>
              {achieved ? (
                <View className="flex-row items-center gap-1">
                  <Check size={14} color="#22c55e" />
                  <Text className="text-green-500 text-sm font-medium">Done</Text>
                </View>
              ) : (
                <Text className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                  {formatWeight(currentDisplay, settings.units)} → {formatWeight(goalDisplay, settings.units)}
                </Text>
              )}
            </View>
            <ProgressBar
              progress={progressPercent}
              color={achieved ? 'success' : 'primary'}
              height={4}
            />
          </TouchableOpacity>
        );
      })}

      {exercises.length > 5 && (
        <Text className={`text-sm text-center ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
          +{exercises.length - 5} more
        </Text>
      )}
    </Card>
  );
}
