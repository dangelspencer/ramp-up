import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react-native';

import { RootStackParamList } from '../../App';
import { useSettings, useActiveWorkout } from '@/hooks';
import { ConfirmModal } from '@/components/ui/Modal';
import { SetRow } from '@/components/workout/SetRow';
import { LogSetModal } from '@/components/workout/LogSetModal';
import { PlateCalculatorModal } from '@/components/workout/PlateCalculator';
import { RestTimer } from '@/components/workout/RestTimer';
import { formatDuration } from '@/utils/formatting';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type WorkoutRouteProp = RouteProp<RootStackParamList, 'Workout'>;

export default function WorkoutScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<WorkoutRouteProp>();
  const { routineId, programId } = route.params;

  const { effectiveTheme } = useSettings();
  const isDark = effectiveTheme === 'dark';

  const {
    state,
    remainingSeconds,
    startWorkout,
    completeSet,
    skipRestTimer,
    setCurrentExercise,
    completeWorkout,
    cancelWorkout,
  } = useActiveWorkout();

  const [isLoading, setIsLoading] = useState(true);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [logModalState, setLogModalState] = useState<{
    visible: boolean;
    setIndex: number | null;
  }>({ visible: false, setIndex: null });
  const [plateCalcState, setPlateCalcState] = useState<{
    visible: boolean;
    weight: number | null;
  }>({ visible: false, weight: null });

  // Start the workout when screen loads
  useEffect(() => {
    const initWorkout = async () => {
      if (!state.isActive) {
        try {
          await startWorkout(routineId, programId);
        } catch (_error) {
          Alert.alert('Error', 'Failed to start workout');
          navigation.goBack();
        }
      }
      setIsLoading(false);
    };

    initWorkout();
  }, [routineId, programId, startWorkout, state.isActive, navigation]);

  // Elapsed time timer
  useEffect(() => {
    if (!state.startedAt || !state.isActive) return;

    const interval = setInterval(() => {
      const startTime = new Date(state.startedAt!).getTime();
      const now = Date.now();
      setElapsedTime(Math.floor((now - startTime) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [state.startedAt, state.isActive]);

  const handleOpenLogModal = useCallback((setIndex: number) => {
    setLogModalState({ visible: true, setIndex });
  }, []);

  const handleCloseLogModal = useCallback(() => {
    setLogModalState({ visible: false, setIndex: null });
  }, []);

  const handleOpenPlateCalc = useCallback((weight: number) => {
    setPlateCalcState({ visible: true, weight });
  }, []);

  const handleClosePlateCalc = useCallback(() => {
    setPlateCalcState({ visible: false, weight: null });
  }, []);

  const handleLogSet = useCallback(
    async (weight: number, reps: number) => {
      if (logModalState.setIndex !== null) {
        await completeSet(state.currentExerciseIndex, logModalState.setIndex, weight, reps);
      }
    },
    [completeSet, logModalState.setIndex, state.currentExerciseIndex]
  );

  const handlePreviousExercise = useCallback(() => {
    if (state.currentExerciseIndex > 0) {
      setCurrentExercise(state.currentExerciseIndex - 1);
    }
  }, [state.currentExerciseIndex, setCurrentExercise]);

  const handleNextExercise = useCallback(() => {
    if (state.currentExerciseIndex < state.exercises.length - 1) {
      setCurrentExercise(state.currentExerciseIndex + 1);
    }
  }, [state.currentExerciseIndex, state.exercises.length, setCurrentExercise]);

  const handleFinishWorkout = useCallback(async () => {
    // Check if all sets are completed
    const totalSets = state.exercises.reduce((acc, e) => acc + e.sets.length, 0);
    const completedSets = state.exercises.reduce(
      (acc, e) => acc + e.sets.filter((s) => s.completed).length,
      0
    );

    if (completedSets < totalSets) {
      Alert.alert(
        'Incomplete Workout',
        `You have ${totalSets - completedSets} sets remaining. Are you sure you want to finish?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Finish Anyway',
            onPress: async () => {
              await completeWorkout();
              navigation.replace('WorkoutComplete');
            },
          },
        ]
      );
    } else {
      await completeWorkout();
      navigation.replace('WorkoutComplete');
    }
  }, [state.exercises, completeWorkout, navigation]);

  const handleCancelWorkout = useCallback(async () => {
    await cancelWorkout();
    setShowCancelModal(false);
    navigation.goBack();
  }, [cancelWorkout, navigation]);

  if (isLoading || !state.isActive) {
    return (
      <SafeAreaView className="flex-1" style={{ backgroundColor: isDark ? '#09090b' : '#f4f4f5' }}>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#f97316" />
          <Text className={`mt-4 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
            Starting workout...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const currentExercise = state.exercises[state.currentExerciseIndex];
  const totalSets = state.exercises.reduce((acc, e) => acc + e.sets.length, 0);
  const completedSets = state.exercises.reduce(
    (acc, e) => acc + e.sets.filter((s) => s.completed).length,
    0
  );
  const progress = totalSets > 0 ? (completedSets / totalSets) * 100 : 0;

  // Get the set being logged for the modal
  const setBeingLogged = logModalState.setIndex !== null
    ? currentExercise?.sets[logModalState.setIndex]
    : null;

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: isDark ? '#09090b' : '#f4f4f5' }} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View className={`px-4 py-3 border-b ${isDark ? 'border-zinc-800' : 'border-zinc-200'}`}>
        <View className="flex-row items-center justify-between">
          <TouchableOpacity
            onPress={() => setShowCancelModal(true)}
            className={`p-2 rounded-lg shrink-0 ${isDark ? 'bg-zinc-800' : 'bg-white'}`}
          >
            <ChevronLeft size={24} color={isDark ? '#ffffff' : '#18181b'} />
          </TouchableOpacity>
          <View className="items-center flex-1 mx-2">
            <Text numberOfLines={1} className={`font-semibold ${isDark ? 'text-white' : 'text-zinc-900'}`}>
              {state.routineName}
            </Text>
            <Text className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
              {formatDuration(elapsedTime)}
            </Text>
          </View>
          <TouchableOpacity
            onPress={handleFinishWorkout}
            className="bg-orange-500 rounded-lg p-2 shrink-0"
          >
            <Check size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>

        {/* Progress Bar */}
        <View className={`mt-3 h-2 rounded-full ${isDark ? 'bg-zinc-800' : 'bg-zinc-200'}`}>
          <View
            className="h-full rounded-full bg-orange-500"
            style={{ width: `${progress}%` }}
          />
        </View>
        <Text className={`text-xs mt-1 text-center ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
          {completedSets} / {totalSets} sets completed
        </Text>
      </View>

      <ScrollView className="flex-1 px-4">
        {/* Rest Timer */}
        {state.restTimer.isRunning && remainingSeconds > 0 && (
          <View className="mt-4">
            <RestTimer
              remainingSeconds={remainingSeconds}
              totalSeconds={state.restTimer.totalSeconds}
              isRunning={state.restTimer.isRunning}
              onSkip={skipRestTimer}
              size="lg"
            />
          </View>
        )}

        {/* Exercise Navigation */}
        <View className="flex-row items-center justify-between mt-4">
          <TouchableOpacity
            onPress={handlePreviousExercise}
            disabled={state.currentExerciseIndex === 0}
            className={`p-2 rounded-lg ${state.currentExerciseIndex === 0 ? 'opacity-30' : ''} ${isDark ? 'bg-zinc-800' : 'bg-zinc-200'}`}
          >
            <ChevronLeft size={24} color={isDark ? '#a1a1aa' : '#71717a'} />
          </TouchableOpacity>

          <View className="flex-1 items-center mx-4">
            <Text className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
              Exercise {state.currentExerciseIndex + 1} of {state.exercises.length}
            </Text>
            <Text className={`text-xl font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>
              {currentExercise?.exercise.name}
            </Text>
          </View>

          <TouchableOpacity
            onPress={handleNextExercise}
            disabled={state.currentExerciseIndex === state.exercises.length - 1}
            className={`p-2 rounded-lg ${state.currentExerciseIndex === state.exercises.length - 1 ? 'opacity-30' : ''} ${isDark ? 'bg-zinc-800' : 'bg-zinc-200'}`}
          >
            <ChevronRight size={24} color={isDark ? '#a1a1aa' : '#71717a'} />
          </TouchableOpacity>
        </View>

        {/* Sets */}
        <View className="mt-4 gap-2 mb-8">
          {currentExercise?.sets.map((set, setIndex) => (
            <SetRow
              key={set.id}
              setNumber={setIndex + 1}
              targetWeight={set.targetWeight}
              targetReps={set.targetReps}
              actualWeight={set.actualWeight}
              actualReps={set.actualReps}
              completed={set.completed}
              percentageOfMax={set.percentageOfMax}
              onLogPress={() => handleOpenLogModal(setIndex)}
              onRowPress={() => handleOpenPlateCalc(set.completed ? (set.actualWeight ?? set.targetWeight) : set.targetWeight)}
            />
          ))}
        </View>
      </ScrollView>

      {/* Log Set Modal */}
      {setBeingLogged && (
        <LogSetModal
          visible={logModalState.visible}
          onClose={handleCloseLogModal}
          onLog={handleLogSet}
          setNumber={(logModalState.setIndex ?? 0) + 1}
          targetWeight={setBeingLogged.targetWeight}
          targetReps={setBeingLogged.targetReps}
          percentageOfMax={setBeingLogged.percentageOfMax}
        />
      )}

      {/* Cancel Workout Modal */}
      <ConfirmModal
        visible={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleCancelWorkout}
        title="Cancel Workout?"
        message="This will discard all progress. This action cannot be undone."
        confirmText="Cancel Workout"
        cancelText="Keep Going"
        variant="destructive"
      />

      {/* Plate Calculator Modal */}
      <PlateCalculatorModal
        visible={plateCalcState.visible}
        onClose={handleClosePlateCalc}
        initialWeight={plateCalcState.weight ?? undefined}
      />
    </SafeAreaView>
  );
}
