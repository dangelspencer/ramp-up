import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useSettings } from '@/hooks';
import { Card } from '@/components/ui';
import { ProgressBar } from '@/components/ui';
import { PlayCircle, ChevronRight, Repeat } from 'lucide-react-native';
import { ProgramWithRoutines } from '@/services/program.service';

interface ProgramCardProps {
  program: ProgramWithRoutines;
  nextRoutineName: string | null;
  onStartWorkout: () => void;
  onViewProgram: () => void;
}

export function ProgramCard({
  program,
  nextRoutineName,
  onStartWorkout,
  onViewProgram,
}: ProgramCardProps) {
  const { effectiveTheme } = useSettings();
  const isDark = effectiveTheme === 'dark';

  const progress =
    program.type === 'finite' && program.totalWorkouts
      ? ((program.currentPosition ?? 0) / program.totalWorkouts) * 100
      : null;

  const workoutNumber = (program.currentPosition ?? 0) + 1;
  const isComplete = program.type === 'finite' && program.totalWorkouts
    ? workoutNumber > program.totalWorkouts
    : false;

  return (
    <Card variant="elevated" className="mb-4">
      <TouchableOpacity onPress={onViewProgram} className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center gap-2">
          <View className={`p-2 rounded-lg ${isDark ? 'bg-orange-500/20' : 'bg-orange-100'}`}>
            {program.type === 'continuous' ? (
              <Repeat size={20} color="#f97316" />
            ) : (
              <PlayCircle size={20} color="#f97316" />
            )}
          </View>
          <View>
            <Text className={`font-semibold ${isDark ? 'text-white' : 'text-zinc-900'}`}>
              {program.name}
            </Text>
            <Text className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
              {program.type === 'continuous'
                ? 'Continuous program'
                : `Workout ${workoutNumber} of ${program.totalWorkouts}`}
            </Text>
          </View>
        </View>
        <ChevronRight size={20} color={isDark ? '#71717a' : '#a1a1aa'} />
      </TouchableOpacity>

      {progress !== null && (
        <ProgressBar
          progress={progress}
          className="mb-4"
          color={isComplete ? 'success' : 'primary'}
        />
      )}

      {!isComplete && nextRoutineName && (
        <View className={`p-3 rounded-lg ${isDark ? 'bg-zinc-700' : 'bg-zinc-100'} mb-3`}>
          <Text className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
            Next up
          </Text>
          <Text className={`font-medium ${isDark ? 'text-white' : 'text-zinc-900'}`}>
            {nextRoutineName}
          </Text>
        </View>
      )}

      {isComplete ? (
        <TouchableOpacity
          onPress={onViewProgram}
          className="flex-row items-center justify-center py-3 rounded-lg bg-green-500"
        >
          <Text className="text-white font-semibold">Program Complete! 🎉</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          onPress={onStartWorkout}
          className="flex-row items-center justify-center py-3 rounded-lg bg-orange-500"
        >
          <PlayCircle size={20} color="#ffffff" />
          <Text className="text-white font-semibold ml-2">Start Workout</Text>
        </TouchableOpacity>
      )}
    </Card>
  );
}

interface NoProgramCardProps {
  onCreateProgram: () => void;
  onStartQuickWorkout: () => void;
}

export function NoProgramCard({ onCreateProgram, onStartQuickWorkout }: NoProgramCardProps) {
  const { effectiveTheme } = useSettings();
  const isDark = effectiveTheme === 'dark';

  return (
    <Card variant="elevated" className="mb-4">
      <View className="items-center py-4">
        <View className={`p-4 rounded-full mb-3 ${isDark ? 'bg-zinc-800' : 'bg-zinc-100'}`}>
          <PlayCircle size={32} color="#f97316" />
        </View>
        <Text className={`text-lg font-semibold mb-1 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
          No Active Program
        </Text>
        <Text className={`text-center mb-4 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
          Create a program to track your progress or start a quick workout
        </Text>

        <View className="flex-row gap-3 w-full">
          <TouchableOpacity
            onPress={onStartQuickWorkout}
            className={`flex-1 py-3 rounded-lg items-center ${isDark ? 'bg-zinc-700' : 'bg-zinc-200'}`}
          >
            <Text className={`font-medium ${isDark ? 'text-white' : 'text-zinc-900'}`}>
              Quick Workout
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onCreateProgram}
            className="flex-1 py-3 rounded-lg items-center bg-orange-500"
          >
            <Text className="text-white font-medium">Create Program</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Card>
  );
}
