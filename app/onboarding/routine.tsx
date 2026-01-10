import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft, ListChecks, Plus, Check, GripVertical, X } from 'lucide-react-native';
import { useSettings, useOnboarding, useExercises, useRoutines } from '@/hooks';
import { Button, Card, Input, Modal } from '@/components/ui';
import type { RoutineExerciseInput } from '@/services/routine.service';

const DEFAULT_SETS = [
  { weightType: 'percentage' as const, weightValue: 70, reps: 5, restTime: 120 },
  { weightType: 'percentage' as const, weightValue: 80, reps: 5, restTime: 150 },
  { weightType: 'percentage' as const, weightValue: 90, reps: 5, restTime: 180 },
];

export default function RoutineScreen() {
  const router = useRouter();
  const { effectiveTheme, settings } = useSettings();
  const { setStep, updateData } = useOnboarding();
  const { exercises } = useExercises();
  const { createRoutine } = useRoutines();
  const isDark = effectiveTheme === 'dark';

  const [routineName, setRoutineName] = useState('Workout A');
  const [selectedExercises, setSelectedExercises] = useState<string[]>([]);
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-select first 3-4 exercises on mount
  useEffect(() => {
    if (exercises.length > 0 && selectedExercises.length === 0) {
      const initialSelection = exercises.slice(0, Math.min(4, exercises.length)).map((e) => e.id);
      setSelectedExercises(initialSelection);
    }
  }, [exercises]);

  const toggleExercise = (exerciseId: string) => {
    setSelectedExercises((prev) => {
      if (prev.includes(exerciseId)) {
        return prev.filter((id) => id !== exerciseId);
      }
      return [...prev, exerciseId];
    });
  };

  const removeExercise = (exerciseId: string) => {
    setSelectedExercises((prev) => prev.filter((id) => id !== exerciseId));
  };

  const handleContinue = async () => {
    if (!routineName.trim()) {
      Alert.alert('Error', 'Please enter a routine name');
      return;
    }
    if (selectedExercises.length === 0) {
      Alert.alert('Error', 'Please select at least one exercise');
      return;
    }

    setIsSubmitting(true);
    try {
      // Build routine exercises with default sets
      const routineExercises: RoutineExerciseInput[] = selectedExercises.map((exerciseId) => ({
        exerciseId,
        sets: DEFAULT_SETS,
      }));

      const routine = await createRoutine(routineName.trim(), routineExercises);

      updateData({
        routine: { name: routineName, exerciseIds: selectedExercises },
      });

      setStep('program');
      router.push('/onboarding/program');
    } catch (error) {
      Alert.alert('Error', 'Failed to create routine');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    setStep('exercises');
    router.back();
  };

  const selectedExerciseDetails = selectedExercises
    .map((id) => exercises.find((e) => e.id === id))
    .filter(Boolean);

  return (
    <SafeAreaView className={`flex-1 ${isDark ? 'bg-zinc-950' : 'bg-zinc-100'}`}>
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 gap-3">
        <TouchableOpacity onPress={handleBack}>
          <ChevronLeft size={24} color={isDark ? '#ffffff' : '#18181b'} />
        </TouchableOpacity>
        <Text className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-zinc-900'}`}>
          Create Routine
        </Text>
      </View>

      {/* Progress indicator */}
      <View className="px-6 mb-6">
        <View className={`h-1 rounded-full ${isDark ? 'bg-zinc-800' : 'bg-zinc-200'}`}>
          <View className="h-1 rounded-full bg-orange-500 w-[60%]" />
        </View>
        <Text className={`text-sm mt-2 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
          Step 6 of 10
        </Text>
      </View>

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        <View className="items-center mb-6">
          <View className="w-16 h-16 bg-orange-500/20 rounded-full items-center justify-center mb-4">
            <ListChecks size={32} color="#f97316" />
          </View>
          <Text className={`text-center ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
            Create your first workout routine. A routine is a list of exercises you'll do in a
            single session.
          </Text>
        </View>

        {/* Routine Name */}
        <Card variant="elevated" className="mb-4">
          <Input
            label="Routine Name"
            value={routineName}
            onChangeText={setRoutineName}
            placeholder="e.g., Workout A, Push Day"
          />
        </Card>

        {/* Selected Exercises */}
        <View className="mb-4">
          <Text className={`text-sm font-medium mb-2 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
            Exercises ({selectedExercises.length})
          </Text>

          {selectedExerciseDetails.length > 0 ? (
            <View className="gap-2">
              {selectedExerciseDetails.map((exercise, index) => {
                if (!exercise) return null;
                return (
                  <View
                    key={exercise.id}
                    className={`p-4 rounded-xl flex-row items-center ${
                      isDark ? 'bg-zinc-800' : 'bg-white'
                    }`}
                  >
                    <View className="mr-3">
                      <GripVertical size={18} color={isDark ? '#71717a' : '#a1a1aa'} />
                    </View>
                    <View className="w-8 h-8 bg-orange-500/20 rounded items-center justify-center mr-3">
                      <Text className="text-orange-500 font-semibold">{index + 1}</Text>
                    </View>
                    <View className="flex-1">
                      <Text className={`font-medium ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                        {exercise.name}
                      </Text>
                      <Text className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                        3 sets • 70%, 80%, 90%
                      </Text>
                    </View>
                    <TouchableOpacity onPress={() => removeExercise(exercise.id)}>
                      <X size={18} color={isDark ? '#71717a' : '#a1a1aa'} />
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          ) : (
            <View className={`p-6 rounded-xl items-center ${isDark ? 'bg-zinc-800' : 'bg-white'}`}>
              <Text className={isDark ? 'text-zinc-400' : 'text-zinc-500'}>
                No exercises selected
              </Text>
            </View>
          )}
        </View>

        {/* Add Exercise Button */}
        <TouchableOpacity
          onPress={() => setShowExerciseModal(true)}
          className={`p-4 rounded-xl flex-row items-center justify-center gap-2 border border-dashed mb-6 ${
            isDark ? 'border-zinc-700' : 'border-zinc-300'
          }`}
        >
          <Plus size={20} color="#f97316" />
          <Text className="text-orange-500 font-medium">Add Exercise</Text>
        </TouchableOpacity>

        {/* Info */}
        <View className={`p-3 rounded-lg mb-6 ${isDark ? 'bg-zinc-800/50' : 'bg-zinc-200/50'}`}>
          <Text className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
            Each exercise will start with 3 working sets at 70%, 80%, and 90% of your max. You can
            customize sets later.
          </Text>
        </View>
      </ScrollView>

      {/* Continue Button */}
      <View className="px-6 pb-6">
        <Button
          onPress={handleContinue}
          loading={isSubmitting}
          disabled={selectedExercises.length === 0 || !routineName.trim()}
          size="lg"
          fullWidth
        >
          Continue
        </Button>
      </View>

      {/* Exercise Selection Modal */}
      <Modal
        visible={showExerciseModal}
        onClose={() => setShowExerciseModal(false)}
        title="Select Exercises"
        position="bottom"
      >
        <ScrollView style={{ maxHeight: 400 }}>
          {exercises.length === 0 ? (
            <View className="p-6 items-center">
              <Text className={isDark ? 'text-zinc-400' : 'text-zinc-500'}>
                No exercises available. Go back and add some exercises first.
              </Text>
            </View>
          ) : (
            <View className="gap-2">
              {exercises.map((exercise) => {
                const isSelected = selectedExercises.includes(exercise.id);
                return (
                  <TouchableOpacity
                    key={exercise.id}
                    onPress={() => toggleExercise(exercise.id)}
                    className={`p-3 rounded-lg flex-row items-center ${
                      isSelected
                        ? 'bg-orange-500/20 border border-orange-500'
                        : isDark
                          ? 'bg-zinc-700'
                          : 'bg-zinc-100'
                    }`}
                  >
                    <View
                      className={`w-8 h-8 rounded items-center justify-center mr-3 ${
                        isSelected ? 'bg-orange-500' : isDark ? 'bg-zinc-600' : 'bg-zinc-200'
                      }`}
                    >
                      {isSelected ? (
                        <Check size={16} color="#ffffff" />
                      ) : (
                        <Plus size={16} color={isDark ? '#a1a1aa' : '#71717a'} />
                      )}
                    </View>
                    <View className="flex-1">
                      <Text
                        className={`font-medium ${
                          isSelected
                            ? 'text-orange-500'
                            : isDark
                              ? 'text-white'
                              : 'text-zinc-900'
                        }`}
                      >
                        {exercise.name}
                      </Text>
                      <Text className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                        Max: {exercise.maxWeight} {settings.units === 'imperial' ? 'lbs' : 'kg'}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </ScrollView>
        <View className="mt-4">
          <Button onPress={() => setShowExerciseModal(false)} fullWidth>
            Done ({selectedExercises.length} selected)
          </Button>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
