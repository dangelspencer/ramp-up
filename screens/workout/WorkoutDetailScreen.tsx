import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  ChevronLeft,
  Trash2,
  Calendar,
  Clock,
  Dumbbell,
  CheckCircle,
  XCircle,
  TrendingUp,
} from 'lucide-react-native';

import { RootStackParamList } from '../../App';
import { useSettings } from '@/hooks';
import { workoutService, WorkoutWithDetails } from '@/services/workout.service';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ConfirmModal } from '@/components/ui/Modal';
import { formatWeight } from '@/utils/formatting';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type WorkoutDetailRouteProp = RouteProp<RootStackParamList, 'WorkoutDetail'>;

function formatDate(dateString: string | null): string {
  if (!dateString) return 'Unknown date';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function formatTime(dateString: string | null): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
}

function formatDuration(startedAt: string, completedAt: string | null): string {
  if (!completedAt) return '-';
  const start = new Date(startedAt);
  const end = new Date(completedAt);
  const minutes = Math.round((end.getTime() - start.getTime()) / (1000 * 60));

  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
}

export default function WorkoutDetailScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<WorkoutDetailRouteProp>();
  const { id } = route.params;

  const { effectiveTheme, settings } = useSettings();
  const isDark = effectiveTheme === 'dark';

  const [workout, setWorkout] = useState<WorkoutWithDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadWorkout = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await workoutService.getByIdWithDetails(id);
      setWorkout(data || null);
    } catch (error) {
      console.error('Failed to load workout:', error);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadWorkout();
  }, [loadWorkout]);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await workoutService.delete(id);
      setShowDeleteModal(false);
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to delete workout');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1" style={{ backgroundColor: isDark ? '#09090b' : '#f4f4f5' }}>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#f97316" />
        </View>
      </SafeAreaView>
    );
  }

  if (!workout) {
    return (
      <SafeAreaView className="flex-1" style={{ backgroundColor: isDark ? '#09090b' : '#f4f4f5' }}>
        <View className="flex-1 items-center justify-center">
          <Text className={isDark ? 'text-zinc-400' : 'text-zinc-500'}>Workout not found</Text>
          <Button onPress={() => navigation.goBack()} variant="outline" className="mt-4">
            Go Back
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  // Calculate stats
  const completedSets = workout.exercises.reduce(
    (sum, ex) => sum + ex.sets.filter((s) => s.completed).length,
    0
  );
  const totalSets = workout.exercises.reduce((sum, ex) => sum + ex.sets.length, 0);
  const totalVolume = workout.exercises.reduce(
    (sum, ex) =>
      sum +
      ex.sets.reduce(
        (setSum, s) => setSum + (s.actualWeight ?? s.targetWeight) * (s.actualReps ?? 0),
        0
      ),
    0
  );
  const totalReps = workout.exercises.reduce(
    (sum, ex) => sum + ex.sets.reduce((setSum, s) => setSum + (s.actualReps ?? 0), 0),
    0
  );

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: isDark ? '#09090b' : '#f4f4f5' }}>
      {/* Header */}
      <View className="px-4 py-3">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className={`p-2 rounded-lg ${isDark ? 'bg-zinc-800' : 'bg-white'}`}
          >
            <ChevronLeft size={24} color={isDark ? '#ffffff' : '#18181b'} />
          </TouchableOpacity>
          <Text className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-zinc-900'}`}>
            Workout Details
          </Text>
          <TouchableOpacity
            onPress={() => setShowDeleteModal(true)}
            className="p-2 rounded-lg"
            style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
          >
            <Trash2 size={24} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        className="flex-1 px-4"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Workout Title & Date */}
        <View className="mt-4 mb-6">
          <Text className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>
            {workout.routine.name}
          </Text>
          <View className="flex-row items-center gap-2 mt-2">
            <Calendar size={16} color={isDark ? '#71717a' : '#a1a1aa'} />
            <Text className={`${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
              {formatDate(workout.completedAt)}
            </Text>
          </View>
          {workout.completedAt && (
            <View className="flex-row items-center gap-2 mt-1">
              <Clock size={16} color={isDark ? '#71717a' : '#a1a1aa'} />
              <Text className={`${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                {formatTime(workout.startedAt)} - {formatTime(workout.completedAt)} ({formatDuration(workout.startedAt, workout.completedAt)})
              </Text>
            </View>
          )}
        </View>

        {/* Stats Cards */}
        <View className="flex-row gap-3 mb-6 mt-4">
          <Card className="flex-1 items-center py-4">
            <CheckCircle size={24} color="#22c55e" />
            <Text className={`text-2xl font-bold mt-2 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
              {completedSets}/{totalSets}
            </Text>
            <Text className={`text-xs ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
              Sets Completed
            </Text>
          </Card>
          <Card className="flex-1 items-center py-4">
            <TrendingUp size={24} color="#f97316" />
            <Text className={`text-2xl font-bold mt-2 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
              {formatWeight(totalVolume, settings.units)}
            </Text>
            <Text className={`text-xs ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
              Total Volume
            </Text>
          </Card>
          <Card className="flex-1 items-center py-4">
            <Dumbbell size={24} color="#3b82f6" />
            <Text className={`text-2xl font-bold mt-2 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
              {totalReps}
            </Text>
            <Text className={`text-xs ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
              Total Reps
            </Text>
          </Card>
        </View>

        {/* Exercises */}
        <Text className={`text-sm font-medium mb-3 mt-4 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
          Exercises
        </Text>

        {workout.exercises.map((exercise) => {
          const exerciseCompletedSets = exercise.sets.filter((s) => s.completed).length;
          const exerciseTotalSets = exercise.sets.length;

          return (
            <Card key={exercise.id} className="mb-3">
              <View className="flex-row items-center justify-between mb-3">
                <Text numberOfLines={1} className={`flex-1 mr-2 font-semibold ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                  {exercise.exercise.name}
                </Text>
                <View className="flex-row items-center gap-1 shrink-0">
                  {exerciseCompletedSets === exerciseTotalSets ? (
                    <CheckCircle size={16} color="#22c55e" />
                  ) : (
                    <XCircle size={16} color="#71717a" />
                  )}
                  <Text className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                    {exerciseCompletedSets}/{exerciseTotalSets}
                  </Text>
                </View>
              </View>

              {/* Sets Table Header */}
              <View className={`flex-row py-2 border-b ${isDark ? 'border-zinc-700' : 'border-zinc-200'}`}>
                <Text className={`flex-1 text-xs font-medium ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                  SET
                </Text>
                <Text className={`flex-1 text-xs font-medium text-center ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                  TARGET
                </Text>
                <Text className={`flex-1 text-xs font-medium text-center ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                  ACTUAL
                </Text>
                <View className="w-8" />
              </View>

              {/* Sets */}
              {exercise.sets.map((set, setIndex) => (
                <View
                  key={set.id}
                  className={`flex-row items-center py-3 ${
                    setIndex < exercise.sets.length - 1
                      ? `border-b ${isDark ? 'border-zinc-800' : 'border-zinc-100'}`
                      : ''
                  }`}
                >
                  <Text className={`flex-1 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                    {setIndex + 1}
                  </Text>
                  <Text className={`flex-1 text-center ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                    {formatWeight(set.targetWeight, settings.units)} x {set.targetReps}
                  </Text>
                  <Text
                    className={`flex-1 text-center font-medium ${
                      set.completed
                        ? isDark
                          ? 'text-white'
                          : 'text-zinc-900'
                        : isDark
                          ? 'text-zinc-600'
                          : 'text-zinc-300'
                    }`}
                  >
                    {set.completed
                      ? `${formatWeight(set.actualWeight ?? set.targetWeight, settings.units)} x ${set.actualReps ?? 0}`
                      : '-'}
                  </Text>
                  <View className="w-8 items-center">
                    {set.completed ? (
                      <CheckCircle size={16} color="#22c55e" />
                    ) : (
                      <XCircle size={16} color={isDark ? '#52525b' : '#d4d4d8'} />
                    )}
                  </View>
                </View>
              ))}
            </Card>
          );
        })}

        {/* Spacer */}
        <View className="h-8" />
      </ScrollView>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        visible={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete Workout?"
        message="This will permanently delete this workout from your history. This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        loading={isDeleting}
      />
    </SafeAreaView>
  );
}
