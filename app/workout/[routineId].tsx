import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSettings, useActiveWorkout } from '@/hooks';
import { SetRow, CompactRestTimer, PlateDisplay, PlateCalculatorModal } from '@/components/workout';
import { Button, ConfirmModal } from '@/components/ui';
import { ChevronLeft, ChevronRight, Calculator, X } from 'lucide-react-native';
import { formatWeight } from '@/utils/formatting';

export default function WorkoutScreen() {
  const router = useRouter();
  const { routineId, programId } = useLocalSearchParams<{ routineId: string; programId?: string }>();
  const { effectiveTheme, settings } = useSettings();
  const isDark = effectiveTheme === 'dark';

  const {
    state,
    startWorkout,
    completeSet,
    skipRestTimer,
    setCurrentExercise,
    completeWorkout,
    cancelWorkout,
  } = useActiveWorkout();

  const [isLoading, setIsLoading] = useState(true);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showPlateCalculator, setShowPlateCalculator] = useState(false);
  const [selectedWeight, setSelectedWeight] = useState<number | null>(null);

  useEffect(() => {
    const initWorkout = async () => {
      if (!state.isActive && routineId) {
        setIsLoading(true);
        try {
          await startWorkout(routineId, programId);
        } catch (error) {
          Alert.alert('Error', 'Failed to start workout');
          router.back();
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };

    initWorkout();
  }, [routineId, programId, state.isActive, startWorkout, router]);

  const handleCompleteSet = async (
    exerciseIndex: number,
    setIndex: number,
    weight: number,
    reps: number
  ) => {
    await completeSet(exerciseIndex, setIndex, weight, reps);
  };

  const handleFinishWorkout = async () => {
    const progressionResults = await completeWorkout();
    router.replace({
      pathname: '/workout/complete',
      params: { progressions: JSON.stringify(progressionResults) },
    });
  };

  const handleCancelWorkout = async () => {
    await cancelWorkout();
    setShowCancelModal(false);
    router.back();
  };

  const handleOpenPlateCalculator = (weight: number) => {
    setSelectedWeight(weight);
    setShowPlateCalculator(true);
  };

  const currentExercise = state.exercises[state.currentExerciseIndex];
  const hasNextExercise = state.currentExerciseIndex < state.exercises.length - 1;
  const hasPrevExercise = state.currentExerciseIndex > 0;

  const allSetsCompleted = currentExercise?.sets.every((s) => s.completed) ?? false;
  const allExercisesCompleted = state.exercises.every((e) =>
    e.sets.every((s) => s.completed)
  );

  if (isLoading) {
    return (
      <SafeAreaView className={`flex-1 items-center justify-center ${isDark ? 'bg-zinc-950' : 'bg-zinc-100'}`}>
        <ActivityIndicator size="large" color="#f97316" />
        <Text className={`mt-4 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
          Loading workout...
        </Text>
      </SafeAreaView>
    );
  }

  if (!currentExercise) {
    return (
      <SafeAreaView className={`flex-1 items-center justify-center ${isDark ? 'bg-zinc-950' : 'bg-zinc-100'}`}>
        <Text className={isDark ? 'text-white' : 'text-zinc-900'}>No exercises found</Text>
        <Button onPress={() => router.back()} className="mt-4">
          Go Back
        </Button>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className={`flex-1 ${isDark ? 'bg-zinc-950' : 'bg-zinc-100'}`}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3">
        <TouchableOpacity onPress={() => setShowCancelModal(true)}>
          <X size={24} color={isDark ? '#ffffff' : '#18181b'} />
        </TouchableOpacity>
        <View className="items-center">
          <Text className={`font-semibold ${isDark ? 'text-white' : 'text-zinc-900'}`}>
            {state.routineName}
          </Text>
          <Text className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
            Exercise {state.currentExerciseIndex + 1} of {state.exercises.length}
          </Text>
        </View>
        <TouchableOpacity onPress={() => setShowPlateCalculator(true)}>
          <Calculator size={24} color={isDark ? '#a1a1aa' : '#71717a'} />
        </TouchableOpacity>
      </View>

      {/* Rest Timer (compact at top when running) */}
      {state.restTimer.isRunning && (
        <View className="px-4 mb-2">
          <CompactRestTimer
            remainingSeconds={state.restTimer.remainingSeconds}
            totalSeconds={state.restTimer.totalSeconds}
            isRunning={state.restTimer.isRunning}
            onSkip={skipRestTimer}
          />
        </View>
      )}

      <ScrollView className="flex-1 px-4">
        {/* Exercise Header */}
        <View className={`rounded-xl p-4 mb-4 ${isDark ? 'bg-zinc-800' : 'bg-white'}`}>
          <Text className={`text-xl font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>
            {currentExercise.exercise.name}
          </Text>
          <View className="flex-row items-center gap-3 mt-2">
            <Text className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
              Max: {formatWeight(currentExercise.exercise.maxWeight, settings.units)}
            </Text>
            {currentExercise.exercise.barbellId && (
              <PlateDisplay
                weight={currentExercise.sets[0]?.targetWeight ?? currentExercise.exercise.maxWeight}
                onPress={() => handleOpenPlateCalculator(currentExercise.sets[0]?.targetWeight ?? currentExercise.exercise.maxWeight)}
                compact
              />
            )}
          </View>
        </View>

        {/* Sets */}
        <View className="gap-2 mb-4">
          {currentExercise.sets.map((set, index) => (
            <SetRow
              key={set.id}
              setNumber={index + 1}
              targetWeight={set.targetWeight}
              targetReps={set.targetReps}
              actualWeight={set.actualWeight}
              actualReps={set.actualReps}
              completed={set.completed}
              percentageOfMax={set.percentageOfMax}
              onComplete={(weight, reps) => handleCompleteSet(state.currentExerciseIndex, index, weight, reps)}
            />
          ))}
        </View>

        {/* Navigation */}
        <View className="flex-row gap-3 mb-6">
          {hasPrevExercise && (
            <TouchableOpacity
              onPress={() => setCurrentExercise(state.currentExerciseIndex - 1)}
              className={`flex-1 flex-row items-center justify-center py-3 rounded-lg ${
                isDark ? 'bg-zinc-800' : 'bg-zinc-200'
              }`}
            >
              <ChevronLeft size={20} color={isDark ? '#ffffff' : '#18181b'} />
              <Text className={`font-medium ml-1 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                Previous
              </Text>
            </TouchableOpacity>
          )}
          {hasNextExercise && allSetsCompleted && (
            <TouchableOpacity
              onPress={() => setCurrentExercise(state.currentExerciseIndex + 1)}
              className="flex-1 flex-row items-center justify-center py-3 rounded-lg bg-orange-500"
            >
              <Text className="text-white font-medium mr-1">Next Exercise</Text>
              <ChevronRight size={20} color="#ffffff" />
            </TouchableOpacity>
          )}
        </View>

        {/* Finish Button */}
        {allExercisesCompleted && (
          <Button
            onPress={handleFinishWorkout}
            fullWidth
            size="lg"
            loading={state.isCompleting}
          >
            Finish Workout
          </Button>
        )}

        {/* Spacer */}
        <View className="h-8" />
      </ScrollView>

      {/* Cancel Modal */}
      <ConfirmModal
        visible={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleCancelWorkout}
        title="Cancel Workout?"
        message="Your progress will be lost. Are you sure you want to cancel?"
        confirmText="Cancel Workout"
        cancelText="Keep Going"
        variant="destructive"
      />

      {/* Plate Calculator Modal */}
      <PlateCalculatorModal
        visible={showPlateCalculator}
        onClose={() => setShowPlateCalculator(false)}
        initialWeight={selectedWeight ?? undefined}
        barWeight={45}
      />
    </SafeAreaView>
  );
}
