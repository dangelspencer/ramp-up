import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft, Plus, Trash2, GripVertical } from 'lucide-react-native';
import { useSettings, useRoutines, useExercises } from '@/hooks';
import { Button, Input, Modal, NumberInput } from '@/components/ui';
import { RoutineExerciseInput, RoutineSetInput } from '@/services/routine.service';
import { formatWeight } from '@/utils/formatting';

interface ExerciseWithSets {
  exerciseId: string;
  exerciseName: string;
  sets: RoutineSetInput[];
}

export default function CreateRoutineScreen() {
  const router = useRouter();
  const { effectiveTheme, settings } = useSettings();
  const isDark = effectiveTheme === 'dark';
  const { createRoutine } = useRoutines();
  const { exercises } = useExercises();

  const [name, setName] = useState('');
  const [selectedExercises, setSelectedExercises] = useState<ExerciseWithSets[]>([]);
  const [showExercisePicker, setShowExercisePicker] = useState(false);
  const [showSetEditor, setShowSetEditor] = useState(false);
  const [editingExerciseIndex, setEditingExerciseIndex] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Set editor state
  const [editingSets, setEditingSets] = useState<RoutineSetInput[]>([]);

  const handleAddExercise = (exerciseId: string) => {
    const exercise = exercises.find((e) => e.id === exerciseId);
    if (!exercise) return;

    // Add with default 3 sets at 100%
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

  const handleCreate = async () => {
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
      await createRoutine(name.trim(), exercisesInput);
      router.back();
    } catch (error) {
      Alert.alert('Error', 'Failed to create routine');
    } finally {
      setIsSubmitting(false);
    }
  };

  const availableExercises = exercises.filter(
    (ex) => !selectedExercises.some((sel) => sel.exerciseId === ex.id)
  );

  return (
    <SafeAreaView className={`flex-1 ${isDark ? 'bg-zinc-950' : 'bg-zinc-100'}`}>
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 gap-3">
        <TouchableOpacity onPress={() => router.back()}>
          <ChevronLeft size={24} color={isDark ? '#ffffff' : '#18181b'} />
        </TouchableOpacity>
        <Text className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-zinc-900'}`}>
          New Routine
        </Text>
      </View>

      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        <View className="gap-4 pb-8">
          {/* Routine Name */}
          <Input
            label="Routine Name"
            value={name}
            onChangeText={setName}
            placeholder="e.g., Push Day"
            autoFocus
          />

          {/* Exercises Section */}
          <View>
            <Text className={`text-sm font-medium mb-2 ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
              Exercises
            </Text>

            {selectedExercises.length === 0 ? (
              <View
                className={`rounded-xl p-6 items-center ${isDark ? 'bg-zinc-800' : 'bg-white'}`}
              >
                <Text className={`text-center mb-2 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                  No exercises added yet
                </Text>
                <TouchableOpacity
                  onPress={() => setShowExercisePicker(true)}
                  className="bg-orange-500 px-4 py-2 rounded-lg"
                >
                  <Text className="text-white font-medium">Add Exercise</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View className="gap-2">
                {selectedExercises.map((ex, index) => (
                  <View
                    key={`${ex.exerciseId}-${index}`}
                    className={`rounded-xl p-4 ${isDark ? 'bg-zinc-800' : 'bg-white'}`}
                  >
                    <View className="flex-row items-center justify-between mb-2">
                      <View className="flex-row items-center gap-2 flex-1">
                        <GripVertical size={18} color={isDark ? '#71717a' : '#a1a1aa'} />
                        <Text className={`font-medium ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                          {ex.exerciseName}
                        </Text>
                      </View>
                      <TouchableOpacity onPress={() => handleRemoveExercise(index)}>
                        <Trash2 size={18} color="#ef4444" />
                      </TouchableOpacity>
                    </View>
                    <TouchableOpacity onPress={() => handleEditSets(index)}>
                      <Text className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                        {ex.sets.length} set{ex.sets.length !== 1 ? 's' : ''} •{' '}
                        {ex.sets.map((s) => `${s.weightValue}%×${s.reps}`).join(', ')}
                      </Text>
                      <Text className="text-orange-500 text-sm mt-1">Tap to edit sets</Text>
                    </TouchableOpacity>
                  </View>
                ))}
                <TouchableOpacity
                  onPress={() => setShowExercisePicker(true)}
                  className={`rounded-xl p-4 flex-row items-center justify-center gap-2 border-2 border-dashed ${
                    isDark ? 'border-zinc-700' : 'border-zinc-300'
                  }`}
                >
                  <Plus size={20} color="#f97316" />
                  <Text className="text-orange-500 font-medium">Add Exercise</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Create Button */}
          <View className="pt-4">
            <Button
              onPress={handleCreate}
              loading={isSubmitting}
              disabled={!name.trim() || selectedExercises.length === 0}
              fullWidth
              size="lg"
            >
              Create Routine
            </Button>
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
                  ? 'No exercises created yet. Go to Exercises tab to add some.'
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
    </SafeAreaView>
  );
}
