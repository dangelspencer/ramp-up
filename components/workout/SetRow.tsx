import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useSettings } from '@/hooks';
import { Check } from 'lucide-react-native';
import { formatWeight } from '@/utils/formatting';

interface SetRowProps {
  setNumber: number;
  targetWeight: number;
  targetReps: number;
  actualWeight: number | null;
  actualReps: number | null;
  completed: boolean;
  percentageOfMax: number | null;
  onLogPress: () => void;
  disabled?: boolean;
}

export function SetRow({
  setNumber,
  targetWeight,
  targetReps,
  actualWeight,
  actualReps,
  completed,
  percentageOfMax,
  onLogPress,
  disabled = false,
}: SetRowProps) {
  const { effectiveTheme, settings } = useSettings();
  const isDark = effectiveTheme === 'dark';

  const displayWeight = completed ? (actualWeight ?? targetWeight) : targetWeight;
  const displayReps = completed ? (actualReps ?? targetReps) : targetReps;
  const unitLabel = settings.units === 'metric' ? 'kg' : 'lbs';

  return (
    <View
      className={`
        flex-row items-center p-4 rounded-xl
        ${completed
          ? isDark ? 'bg-green-900/30' : 'bg-green-50'
          : isDark ? 'bg-zinc-800' : 'bg-white'}
        ${disabled ? 'opacity-50' : ''}
      `}
    >
      {/* Set Number */}
      <View className="w-8 items-center">
        <Text className={`font-semibold ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
          {setNumber}
        </Text>
      </View>

      {/* Weight and Reps */}
      <View className="flex-1 flex-row items-center">
        <Text className={`text-lg font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>
          {formatWeight(displayWeight, settings.units)}
        </Text>
        <Text className={`mx-2 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>×</Text>
        <Text className={`text-lg font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>
          {displayReps}
        </Text>
        {percentageOfMax && (
          <Text className={`ml-2 text-sm ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
            ({percentageOfMax}%)
          </Text>
        )}
      </View>

      {/* Log Button or Completed Indicator */}
      {completed ? (
        <View className="w-10 h-10 rounded-full bg-green-500 items-center justify-center">
          <Check size={20} color="#ffffff" />
        </View>
      ) : (
        <TouchableOpacity
          onPress={onLogPress}
          disabled={disabled}
          className="px-4 py-2 rounded-lg bg-orange-500"
        >
          <Text className="text-white font-semibold">Log</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
