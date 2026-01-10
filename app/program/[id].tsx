import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, Plus, Trash2, GripVertical, Play, Edit3, Check } from 'lucide-react-native';
import { useSettings, usePrograms, useRoutines } from '@/hooks';
import { Button, Input, Modal, NumberInput, ConfirmModal, ProgressBar } from '@/components/ui';
import { programService, ProgramWithRoutines } from '@/services/program.service';
import { routineService, RoutineWithDetails } from '@/services/routine.service';

export default function ProgramDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { effectiveTheme } = useSettings();
  const isDark = effectiveTheme === 'dark';
  const { setActive: setActiveProgram, deleteProgram } = usePrograms();
  const { routines } = useRoutines();

  const [program, setProgram] = useState<ProgramWithRoutines | null>(null);
  const [nextRoutine, setNextRoutine] = useState<RoutineWithDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isActivating, setIsActivating] = useState(false);

  useEffect(() => {
    const loadProgram = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        const data = await programService.getByIdWithRoutines(id);
        if (data) {
          setProgram(data);
          // Load next routine details
          const nextRoutineId = await programService.getNextRoutineId(id);
          if (nextRoutineId) {
            const routine = await routineService.getByIdWithDetails(nextRoutineId);
            setNextRoutine(routine ?? null);
          }
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to load program');
      } finally {
        setIsLoading(false);
      }
    };
    loadProgram();
  }, [id]);

  const handleStartWorkout = () => {
    if (!nextRoutine || !id) return;
    router.push({
      pathname: `/workout/${nextRoutine.id}` as any,
      params: { programId: id },
    });
  };

  const handleActivate = async () => {
    if (!id) return;
    setIsActivating(true);
    try {
      await setActiveProgram(id);
      // Reload program
      const data = await programService.getByIdWithRoutines(id);
      if (data) {
        setProgram(data);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to activate program');
    } finally {
      setIsActivating(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    try {
      await deleteProgram(id);
      setShowDeleteModal(false);
      router.back();
    } catch (error) {
      Alert.alert('Error', 'Failed to delete program');
    }
  };

  const getCurrentRoutineIndex = () => {
    if (!program) return 0;
    return (program.currentPosition ?? 0) % program.routines.length;
  };

  const getProgressPercentage = () => {
    if (!program) return 0;
    if (program.type === 'continuous') return -1; // No progress for continuous
    if (!program.totalWorkouts) return 0;
    return Math.min(((program.currentPosition ?? 0) / program.totalWorkouts) * 100, 100);
  };

  if (isLoading) {
    return (
      <SafeAreaView className={`flex-1 items-center justify-center ${isDark ? 'bg-zinc-950' : 'bg-zinc-100'}`}>
        <ActivityIndicator size="large" color="#f97316" />
      </SafeAreaView>
    );
  }

  if (!program) {
    return (
      <SafeAreaView className={`flex-1 items-center justify-center ${isDark ? 'bg-zinc-950' : 'bg-zinc-100'}`}>
        <Text className={isDark ? 'text-white' : 'text-zinc-900'}>Program not found</Text>
        <Button onPress={() => router.back()} className="mt-4">
          Go Back
        </Button>
      </SafeAreaView>
    );
  }

  const progress = getProgressPercentage();
  const currentRoutineIndex = getCurrentRoutineIndex();

  return (
    <SafeAreaView className={`flex-1 ${isDark ? 'bg-zinc-950' : 'bg-zinc-100'}`}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3">
        <View className="flex-row items-center gap-3">
          <TouchableOpacity onPress={() => router.back()}>
            <ChevronLeft size={24} color={isDark ? '#ffffff' : '#18181b'} />
          </TouchableOpacity>
          <View>
            <Text className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-zinc-900'}`}>
              {program.name}
            </Text>
            <Text className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
              {program.type === 'continuous' ? 'Continuous' : 'Finite'} •{' '}
              {program.routines.length} routine{program.routines.length !== 1 ? 's' : ''}
            </Text>
          </View>
        </View>
        <TouchableOpacity onPress={() => setShowDeleteModal(true)}>
          <Trash2 size={22} color="#ef4444" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        <View className="gap-4 pb-8">
          {/* Progress Card (for finite programs) */}
          {program.type === 'finite' && program.totalWorkouts && (
            <View className={`rounded-xl p-4 ${isDark ? 'bg-zinc-800' : 'bg-white'}`}>
              <View className="flex-row items-center justify-between mb-2">
                <Text className={`font-medium ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                  Progress
                </Text>
                <Text className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                  {program.currentPosition ?? 0} / {program.totalWorkouts} workouts
                </Text>
              </View>
              <ProgressBar progress={progress} />
              {program.completedAt && (
                <View className="flex-row items-center gap-2 mt-2">
                  <Check size={16} color="#22c55e" />
                  <Text className="text-green-500 text-sm">Completed!</Text>
                </View>
              )}
            </View>
          )}

          {/* Status Card */}
          <View className={`rounded-xl p-4 ${isDark ? 'bg-zinc-800' : 'bg-white'}`}>
            <View className="flex-row items-center justify-between">
              <Text className={`font-medium ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                Status
              </Text>
              {program.isActive ? (
                <View className="bg-green-500/20 px-3 py-1 rounded-full">
                  <Text className="text-green-500 text-sm font-medium">Active</Text>
                </View>
              ) : (
                <View className={`px-3 py-1 rounded-full ${isDark ? 'bg-zinc-700' : 'bg-zinc-200'}`}>
                  <Text className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                    Inactive
                  </Text>
                </View>
              )}
            </View>
            {!program.isActive && !program.completedAt && (
              <Button
                onPress={handleActivate}
                loading={isActivating}
                variant="secondary"
                size="sm"
                className="mt-3"
              >
                Set as Active
              </Button>
            )}
          </View>

          {/* Routines List */}
          <View>
            <Text className={`text-sm font-medium mb-2 ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
              Routines
            </Text>
            <View className="gap-2">
              {program.routines.map((programRoutine, index) => {
                const isCurrent = index === currentRoutineIndex && program.isActive;
                return (
                  <TouchableOpacity
                    key={programRoutine.id}
                    onPress={() => router.push(`/routine/${programRoutine.routineId}` as any)}
                    className={`rounded-xl p-4 flex-row items-center gap-3 ${
                      isCurrent
                        ? 'bg-orange-500/20 border border-orange-500'
                        : isDark
                          ? 'bg-zinc-800'
                          : 'bg-white'
                    }`}
                  >
                    <View
                      className={`w-8 h-8 rounded-full items-center justify-center ${
                        isCurrent ? 'bg-orange-500' : isDark ? 'bg-zinc-700' : 'bg-zinc-200'
                      }`}
                    >
                      <Text
                        className={`text-sm font-bold ${
                          isCurrent ? 'text-white' : isDark ? 'text-zinc-300' : 'text-zinc-700'
                        }`}
                      >
                        {index + 1}
                      </Text>
                    </View>
                    <View className="flex-1">
                      <Text
                        className={`font-medium ${
                          isCurrent
                            ? 'text-orange-500'
                            : isDark
                              ? 'text-white'
                              : 'text-zinc-900'
                        }`}
                      >
                        {programRoutine.routine.name}
                      </Text>
                      {isCurrent && (
                        <Text className="text-orange-500 text-xs">Up next</Text>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Next Workout Preview */}
          {program.isActive && nextRoutine && !program.completedAt && (
            <View className={`rounded-xl p-4 ${isDark ? 'bg-zinc-800' : 'bg-white'}`}>
              <Text className={`font-medium mb-2 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                Next Workout
              </Text>
              <Text className={`text-lg font-semibold text-orange-500 mb-1`}>
                {nextRoutine.name}
              </Text>
              <Text className={`text-sm mb-4 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                {nextRoutine.exercises.length} exercise
                {nextRoutine.exercises.length !== 1 ? 's' : ''} •{' '}
                {nextRoutine.exercises.map((e) => e.exercise.name).join(', ')}
              </Text>
              <Button
                onPress={handleStartWorkout}
                fullWidth
                icon={<Play size={18} color="#ffffff" fill="#ffffff" />}
              >
                Start Workout
              </Button>
            </View>
          )}

          {/* Start Workout (if not showing preview) */}
          {program.isActive && !program.completedAt && !nextRoutine && (
            <Button onPress={handleStartWorkout} fullWidth size="lg">
              Start Workout
            </Button>
          )}
        </View>
      </ScrollView>

      {/* Delete Modal */}
      <ConfirmModal
        visible={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete Program?"
        message={`Are you sure you want to delete "${program.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
      />
    </SafeAreaView>
  );
}
