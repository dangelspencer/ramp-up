import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import { useSettings } from '@/hooks';
import { Check, X } from 'lucide-react-native';
import { formatWeight } from '@/utils/formatting';

interface SetRowProps {
  setNumber: number;
  targetWeight: number;
  targetReps: number;
  actualWeight: number | null;
  actualReps: number | null;
  completed: boolean;
  percentageOfMax: number | null;
  onComplete: (weight: number, reps: number) => void;
  onEdit?: () => void;
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
  onComplete,
  onEdit,
  disabled = false,
}: SetRowProps) {
  const { effectiveTheme, settings } = useSettings();
  const isDark = effectiveTheme === 'dark';

  const [editMode, setEditMode] = useState(false);
  const [weightInput, setWeightInput] = useState(String(actualWeight ?? targetWeight));
  const [repsInput, setRepsInput] = useState(String(actualReps ?? targetReps));

  const handleComplete = () => {
    const weight = parseFloat(weightInput) || targetWeight;
    const reps = parseInt(repsInput, 10) || targetReps;
    onComplete(weight, reps);
    setEditMode(false);
  };

  const handleCancel = () => {
    setWeightInput(String(actualWeight ?? targetWeight));
    setRepsInput(String(actualReps ?? targetReps));
    setEditMode(false);
  };

  if (editMode && !completed) {
    return (
      <View
        className={`flex-row items-center p-3 rounded-lg ${isDark ? 'bg-zinc-800' : 'bg-zinc-100'}`}
      >
        <View className="w-8 items-center">
          <Text className={`font-medium ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
            {setNumber}
          </Text>
        </View>

        <View className="flex-1 flex-row items-center justify-center gap-2">
          <View className="flex-row items-center">
            <TextInput
              value={weightInput}
              onChangeText={setWeightInput}
              keyboardType="decimal-pad"
              className={`
                w-16 text-center py-1 px-2 rounded border
                ${isDark ? 'bg-zinc-700 border-zinc-600 text-white' : 'bg-white border-zinc-300 text-zinc-900'}
              `}
              selectTextOnFocus
            />
            <Text className={`ml-1 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
              {settings.units === 'imperial' ? 'lbs' : 'kg'}
            </Text>
          </View>

          <Text className={isDark ? 'text-zinc-500' : 'text-zinc-400'}>×</Text>

          <View className="flex-row items-center">
            <TextInput
              value={repsInput}
              onChangeText={setRepsInput}
              keyboardType="number-pad"
              className={`
                w-12 text-center py-1 px-2 rounded border
                ${isDark ? 'bg-zinc-700 border-zinc-600 text-white' : 'bg-white border-zinc-300 text-zinc-900'}
              `}
              selectTextOnFocus
            />
            <Text className={`ml-1 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
              reps
            </Text>
          </View>
        </View>

        <View className="flex-row gap-2">
          <TouchableOpacity
            onPress={handleCancel}
            className={`p-2 rounded-full ${isDark ? 'bg-zinc-700' : 'bg-zinc-200'}`}
          >
            <X size={18} color={isDark ? '#a1a1aa' : '#71717a'} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleComplete}
            className="p-2 rounded-full bg-orange-500"
          >
            <Check size={18} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <TouchableOpacity
      onPress={() => !disabled && !completed && setEditMode(true)}
      onLongPress={onEdit}
      disabled={disabled}
      className={`
        flex-row items-center p-3 rounded-lg
        ${completed
          ? isDark ? 'bg-green-900/30' : 'bg-green-50'
          : isDark ? 'bg-zinc-800' : 'bg-zinc-100'}
        ${disabled ? 'opacity-50' : ''}
      `}
    >
      <View className="w-8 items-center">
        <Text className={`font-medium ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
          {setNumber}
        </Text>
      </View>

      <View className="flex-1 flex-row items-center justify-center">
        <Text className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-zinc-900'}`}>
          {formatWeight(completed ? (actualWeight ?? targetWeight) : targetWeight, settings.units)}
        </Text>
        <Text className={`mx-2 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>×</Text>
        <Text className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-zinc-900'}`}>
          {completed ? (actualReps ?? targetReps) : targetReps}
        </Text>
        {percentageOfMax && (
          <Text className={`ml-2 text-sm ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
            ({percentageOfMax}%)
          </Text>
        )}
      </View>

      <View className="w-10 items-center">
        {completed ? (
          <View className="p-1 rounded-full bg-green-500">
            <Check size={18} color="#ffffff" />
          </View>
        ) : (
          <View
            className={`w-7 h-7 rounded-full border-2 ${
              isDark ? 'border-zinc-600' : 'border-zinc-300'
            }`}
          />
        )}
      </View>
    </TouchableOpacity>
  );
}
