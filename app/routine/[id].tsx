import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, Plus, Trash2, GripVertical, Play, Edit3 } from 'lucide-react-native';
import { useSettings, useRoutines, useExercises } from '@/hooks';
import { Button, Input, Modal, NumberInput, ConfirmModal } from '@/components/ui';
import { routineService, RoutineWithDetails, RoutineExerciseInput, RoutineSetInput } from '@/services/routine.service';
import { formatWeight } from '@/utils/formatting';

interface ExerciseWithSets {
  exerciseId: string;
  exerciseName: string;
  sets: RoutineSetInput[];
}

export default function RoutineDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { effectiveTheme, settings } = useSettings();
  const isDark = effectiveTheme === 'dark';
  const { updateRoutine, deleteRoutine } = useRoutines();
  const { exercises } = useExercises();

  const [routine, setRoutine] = useState<RoutineWithDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showExercisePicker, setShowExercisePicker] = useState(false);
  const [showSetEditor, setShowSetEditor] = useState(false);

  const [name, setName] = useState('');
  const [selectedExercises, setSelectedExercises] = useState<ExerciseWithSets[]>([]);
  const [editingExerciseIndex, setEditingExerciseIndex] = useState<number | null>(null);
  const [editingSets, setEditingSets] = useState<RoutineSetInput[]>([]);

  useEffect(() => {
    const loadRoutine = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        const data = await routineService.getByIdWithDetails(id);
        if (data) {
          setRoutine(data);
          setName(data.name);
          setSelectedExercises(
            data.exercises.map((ex) => ({
              exerciseId: ex.exerciseId,
              exerciseName: ex.exercise.name,
              sets: ex.sets.map((s) => ({
                weightType: s.weightType,
                weightValue: s.weightValue,
                reps: s.reps,
                restTime: s.restTime,
              })),
            }))
          );
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to load routine');
      } finally {
        setIsLoading(false);
      }
    };
    loadRoutine();
  }, [id]);

  const handleStartWorkout = () => {
    if (!id) return;
    router.push(`/workout/${id}` as any);
  };

  const handleAddExercise = (exerciseId: string) => {
    const exercise = exercises.find((e) => e.id === exerciseId);
    if (!exercise) return;

    setSelectedExercises((prev) => [
      ...prev,
      {
        exerciseId,
        exerciseName: exercise.name,
        sets: [
          { weightType: 'percentage', weightValue: 100, reps: 5, restTime: 90 },
          { weightType: 'percentage', weightValue: 100, reps: 5, restTime: 90 },
          { weightType: 'percentage', weightValue: 100, reps: 5, restTime: 90 },
        ],
      },
    ]);
    setShowExercisePicker(false);
  };

  const handleRemoveExercise = (index: number) => {
    setSelectedExercises((prev) => prev.filter((_, i) => i !== index));
  };

  const handleEditSets = (index: number) => {
    setEditingExerciseIndex(index);
    setEditingSets([...selectedExercises[index].sets]);
    setShowSetEditor(true);
  };

  const handleAddSet = () => {
    setEditingSets((prev) => [
      ...prev,
      { weightType: 'percentage', weightValue: 100, reps: 5, restTime: 90 },
    ]);
  };

  const handleRemoveSet = (index: number) => {
    if (editingSets.length <= 1) {
      Alert.alert('Error', 'You need at least one set');
      return;
    }
    setEditingSets((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdateSet = (index: number, updates: Partial<RoutineSetInput>) => {
    setEditingSets((prev) =>
      prev.map((set, i) => (i === index ? { ...set, ...updates } : set))
    );
  };

  const handleSaveSets = () => {
    if (editingExerciseIndex === null) return;
    setSelectedExercises((prev) =>
      prev.map((ex, i) =>
        i === editingExerciseIndex ? { ...ex, sets: editingSets } : ex
      )
    );
    setShowSetEditor(false);
    setEditingExerciseIndex(null);
  };

  const handleSave = async () => {
    if (!id) return;
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a routine name');
      return;
    }
    if (selectedExercises.length === 0) {
      Alert.alert('Error', 'Please add at least one exercise');
      return;
    }

    setIsSubmitting(true);
    try {
      const exercisesInput: RoutineExerciseInput[] = selectedExercises.map((ex) => ({
        exerciseId: ex.exerciseId,
        sets: ex.sets,
      }));
      await updateRoutine(id, name.trim(), exercisesInput);
      setIsEditing(false);
      // Reload routine data
      const data = await routineService.getByIdWithDetails(id);
      if (data) {
        setRoutine(data);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update routine');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    try {
      await deleteRoutine(id);
      setShowDeleteModal(false);
      router.back();
    } catch (error) {
      Alert.alert('Error', 'Failed to delete routine');
    }
  };

  const availableExercises = exercises.filter(
    (ex) => !selectedExercises.some((sel) => sel.exerciseId === ex.id)
  );

  if (isLoading) {
    return (
      <SafeAreaView className={`flex-1 items-center justify-center ${isDark ? 'bg-zinc-950' : 'bg-zinc-100'}`}>
        <ActivityIndicator size="large" color="#f97316" />
      </SafeAreaView>
    );
  }

  if (!routine) {
    return (
      <SafeAreaView className={`flex-1 items-center justify-center ${isDark ? 'bg-zinc-950' : 'bg-zinc-100'}`}>
        <Text className={isDark ? 'text-white' : 'text-zinc-900'}>Routine not found</Text>
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
        <View className="flex-row items-center gap-3">
          <TouchableOpacity onPress={() => router.back()}>
            <ChevronLeft size={24} color={isDark ? '#ffffff' : '#18181b'} />
          </TouchableOpacity>
          {isEditing ? (
            <Input
              value={name}
              onChangeText={setName}
              placeholder="Routine name"
              className="flex-1"
            />
          ) : (
            <Text className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-zinc-900'}`}>
              {routine.name}
            </Text>
          )}
        </View>
        <View className="flex-row gap-3">
          {isEditing ? (
            <TouchableOpacity onPress={() => setShowDeleteModal(true)}>
              <Trash2 size={22} color="#ef4444" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={() => setIsEditing(true)}>
              <Edit3 size={22} color={isDark ? '#a1a1aa' : '#71717a'} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        <View className="gap-4 pb-8">
          {/* Exercises */}
          {selectedExercises.map((ex, index) => (
            <View
              key={`${ex.exerciseId}-${index}`}
              className={`rounded-xl p-4 ${isDark ? 'bg-zinc-800' : 'bg-white'}`}
            >
              <View className="flex-row items-center justify-between mb-2">
                <View className="flex-row items-center gap-2 flex-1">
                  {isEditing && <GripVertical size={18} color={isDark ? '#71717a' : '#a1a1aa'} />}
                  <Text className={`font-medium ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                    {ex.exerciseName}
                  </Text>
                </View>
                {isEditing && (
                  <TouchableOpacity onPress={() => handleRemoveExercise(index)}>
                    <Trash2 size={18} color="#ef4444" />
                  </TouchableOpacity>
                )}
              </View>
              <TouchableOpacity
                onPress={() => isEditing && handleEditSets(index)}
                disabled={!isEditing}
              >
                <Text className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                  {ex.sets.length} set{ex.sets.length !== 1 ? 's' : ''} •{' '}
                  {ex.sets.map((s) => `${s.weightValue}%×${s.reps}`).join(', ')}
                </Text>
                {isEditing && (
                  <Text className="text-orange-500 text-sm mt-1">Tap to edit sets</Text>
                )}
              </TouchableOpacity>
            </View>
          ))}

          {isEditing && (
            <TouchableOpacity
              onPress={() => setShowExercisePicker(true)}
              className={`rounded-xl p-4 flex-row items-center justify-center gap-2 border-2 border-dashed ${
                isDark ? 'border-zinc-700' : 'border-zinc-300'
              }`}
            >
              <Plus size={20} color="#f97316" />
              <Text className="text-orange-500 font-medium">Add Exercise</Text>
            </TouchableOpacity>
          )}

          {/* Action Buttons */}
          <View className="pt-4 gap-3">
            {isEditing ? (
              <>
                <Button
                  onPress={handleSave}
                  loading={isSubmitting}
                  disabled={!name.trim() || selectedExercises.length === 0}
                  fullWidth
                  size="lg"
                >
                  Save Changes
                </Button>
                <Button
                  onPress={() => {
                    setIsEditing(false);
                    setName(routine.name);
                    setSelectedExercises(
                      routine.exercises.map((ex) => ({
                        exerciseId: ex.exerciseId,
                        exerciseName: ex.exercise.name,
                        sets: ex.sets.map((s) => ({
                          weightType: s.weightType,
                          weightValue: s.weightValue,
                          reps: s.reps,
                          restTime: s.restTime,
                        })),
                      }))
                    );
                  }}
                  variant="secondary"
                  fullWidth
                  size="lg"
                >
                  Cancel
                </Button>
              </>
            ) : (
              <Button
                onPress={handleStartWorkout}
                fullWidth
                size="lg"
                icon={<Play size={20} color="#ffffff" fill="#ffffff" />}
              >
                Start Workout
              </Button>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Exercise Picker Modal */}
      <Modal
        visible={showExercisePicker}
        onClose={() => setShowExercisePicker(false)}
        title="Add Exercise"
        position="bottom"
        size="lg"
      >
        <ScrollView className="max-h-96">
          {availableExercises.length === 0 ? (
            <View className="py-8 items-center">
              <Text className={`text-center ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                {exercises.length === 0
                  ? 'No exercises created yet'
                  : 'All exercises have been added'}
              </Text>
            </View>
          ) : (
            availableExercises.map((exercise) => (
              <TouchableOpacity
                key={exercise.id}
                onPress={() => handleAddExercise(exercise.id)}
                className={`p-4 border-b ${isDark ? 'border-zinc-700' : 'border-zinc-200'}`}
              >
                <Text className={`font-medium ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                  {exercise.name}
                </Text>
                <Text className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                  Max: {formatWeight(exercise.maxWeight, settings.units)}
                </Text>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </Modal>

      {/* Set Editor Modal */}
      <Modal
        visible={showSetEditor}
        onClose={() => setShowSetEditor(false)}
        title={
          editingExerciseIndex !== null
            ? `Edit Sets - ${selectedExercises[editingExerciseIndex]?.exerciseName}`
            : 'Edit Sets'
        }
        position="bottom"
        size="lg"
      >
        <ScrollView className="max-h-96">
          {editingSets.map((set, index) => (
            <View
              key={index}
              className={`p-4 border-b ${isDark ? 'border-zinc-700' : 'border-zinc-200'}`}
            >
              <View className="flex-row items-center justify-between mb-3">
                <Text className={`font-medium ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                  Set {index + 1}
                </Text>
                <TouchableOpacity onPress={() => handleRemoveSet(index)}>
                  <Trash2 size={18} color="#ef4444" />
                </TouchableOpacity>
              </View>
              <View className="flex-row gap-3">
                <View className="flex-1">
                  <NumberInput
                    label="% of Max"
                    value={set.weightValue}
                    onChangeValue={(v) => handleUpdateSet(index, { weightValue: v ?? 100 })}
                    min={50}
                    max={120}
                    step={5}
                    suffix="%"
                  />
                </View>
                <View className="flex-1">
                  <NumberInput
                    label="Reps"
                    value={set.reps}
                    onChangeValue={(v) => handleUpdateSet(index, { reps: v ?? 5 })}
                    min={1}
                    max={50}
                    step={1}
                  />
                </View>
              </View>
            </View>
          ))}
          <TouchableOpacity
            onPress={handleAddSet}
            className="p-4 flex-row items-center justify-center gap-2"
          >
            <Plus size={20} color="#f97316" />
            <Text className="text-orange-500 font-medium">Add Set</Text>
          </TouchableOpacity>
        </ScrollView>
        <View className="p-4">
          <Button onPress={handleSaveSets} fullWidth>
            Save Sets
          </Button>
        </View>
      </Modal>

      {/* Delete Modal */}
      <ConfirmModal
        visible={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete Routine?"
        message={`Are you sure you want to delete "${routine.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
      />
    </SafeAreaView>
  );
}
