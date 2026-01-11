import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ChevronLeft, Plus, Trash2, GripVertical } from 'lucide-react-native';

import { RootStackParamList } from '../../App';
import { useSettings, useRoutines, useExercises } from '@/hooks';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input, NumberInput } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Select, SegmentedControl } from '@/components/ui/Select';
import { RoutineExerciseInput, RoutineSetInput } from '@/services/routine.service';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface ExerciseEntry {
  id: string;
  exerciseId: string;
  exerciseName: string;
  sets: SetEntry[];
}

interface SetEntry {
  id: string;
  weightType: 'percentage' | 'fixed' | 'bar';
  weightValue: number;
  reps: number;
  restTime: number | null;
}

let entryIdCounter = 0;
const generateId = () => `entry-${++entryIdCounter}`;

export default function RoutineCreateScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { effectiveTheme, settings } = useSettings();
  const isDark = effectiveTheme === 'dark';

  const { createRoutine } = useRoutines();
  const { exercises } = useExercises();

  const [name, setName] = useState('');
  const [routineExercises, setRoutineExercises] = useState<ExerciseEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredExercises = exercises.filter((e) =>
    e.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddExercise = useCallback((exerciseId: string, exerciseName: string) => {
    const newExercise: ExerciseEntry = {
      id: generateId(),
      exerciseId,
      exerciseName,
      sets: [
        {
          id: generateId(),
          weightType: 'percentage',
          weightValue: 70,
          reps: 8,
          restTime: 90,
        },
      ],
    };
    setRoutineExercises((prev) => [...prev, newExercise]);
    setShowExerciseModal(false);
    setSearchQuery('');
  }, []);

  const handleRemoveExercise = useCallback((exerciseEntryId: string) => {
    setRoutineExercises((prev) => prev.filter((e) => e.id !== exerciseEntryId));
  }, []);

  const handleAddSet = useCallback((exerciseEntryId: string) => {
    setRoutineExercises((prev) =>
      prev.map((e) => {
        if (e.id !== exerciseEntryId) return e;
        const lastSet = e.sets[e.sets.length - 1];
        const newSet: SetEntry = {
          id: generateId(),
          weightType: lastSet?.weightType || 'percentage',
          weightValue: lastSet?.weightValue || 70,
          reps: lastSet?.reps || 8,
          restTime: lastSet?.restTime ?? 90,
        };
        return { ...e, sets: [...e.sets, newSet] };
      })
    );
  }, []);

  const handleRemoveSet = useCallback((exerciseEntryId: string, setId: string) => {
    setRoutineExercises((prev) =>
      prev.map((e) => {
        if (e.id !== exerciseEntryId) return e;
        if (e.sets.length <= 1) return e; // Keep at least one set
        return { ...e, sets: e.sets.filter((s) => s.id !== setId) };
      })
    );
  }, []);

  const handleUpdateSet = useCallback(
    (exerciseEntryId: string, setId: string, updates: Partial<SetEntry>) => {
      setRoutineExercises((prev) =>
        prev.map((e) => {
          if (e.id !== exerciseEntryId) return e;
          return {
            ...e,
            sets: e.sets.map((s) => (s.id === setId ? { ...s, ...updates } : s)),
          };
        })
      );
    },
    []
  );

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a routine name');
      return;
    }

    if (routineExercises.length === 0) {
      Alert.alert('Error', 'Please add at least one exercise');
      return;
    }

    setIsLoading(true);
    try {
      const exerciseInputs: RoutineExerciseInput[] = routineExercises.map((e) => ({
        exerciseId: e.exerciseId,
        sets: e.sets.map((s) => ({
          weightType: s.weightType,
          weightValue: s.weightValue,
          reps: s.reps,
          restTime: s.restTime,
        })),
      }));

      await createRoutine(name.trim(), exerciseInputs);
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to create routine');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: isDark ? '#09090b' : '#f4f4f5' }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        {/* Header */}
        <View className={`px-4 py-3 border-b ${isDark ? 'border-zinc-800' : 'border-zinc-200'}`}>
          <View className="flex-row items-center justify-between">
            <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 -ml-2">
              <ChevronLeft size={24} color={isDark ? '#ffffff' : '#18181b'} />
            </TouchableOpacity>
            <Text className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-zinc-900'}`}>
              Create Routine
            </Text>
            <View className="w-10" />
          </View>
        </View>

        <ScrollView className="flex-1 px-4">
          {/* Routine Name */}
          <View className="mt-4">
            <Input
              label="Routine Name"
              value={name}
              onChangeText={setName}
              placeholder="e.g., Upper Body A"
            />
          </View>

          {/* Exercises */}
          <View className="mt-6">
            <Text className={`text-sm font-medium mb-2 ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
              Exercises
            </Text>

            {routineExercises.map((exercise, exerciseIndex) => (
              <Card key={exercise.id} className="mb-4">
                <View className="flex-row items-center justify-between mb-3">
                  <View className="flex-row items-center gap-2">
                    <GripVertical size={18} color={isDark ? '#71717a' : '#a1a1aa'} />
                    <Text className={`font-semibold ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                      {exercise.exerciseName}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleRemoveExercise(exercise.id)}
                    className="p-1"
                  >
                    <Trash2 size={18} color="#ef4444" />
                  </TouchableOpacity>
                </View>

                {/* Sets */}
                {exercise.sets.map((set, setIndex) => (
                  <View
                    key={set.id}
                    className={`py-3 ${setIndex > 0 ? `border-t ${isDark ? 'border-zinc-700' : 'border-zinc-200'}` : ''}`}
                  >
                    <View className="flex-row items-center justify-between mb-2">
                      <Text className={`text-sm font-medium ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                        Set {setIndex + 1}
                      </Text>
                      {exercise.sets.length > 1 && (
                        <TouchableOpacity
                          onPress={() => handleRemoveSet(exercise.id, set.id)}
                          className="p-1"
                        >
                          <Trash2 size={14} color={isDark ? '#71717a' : '#a1a1aa'} />
                        </TouchableOpacity>
                      )}
                    </View>

                    {/* Weight Type */}
                    <SegmentedControl
                      value={set.weightType}
                      onValueChange={(value) =>
                        handleUpdateSet(exercise.id, set.id, {
                          weightType: value as 'percentage' | 'fixed' | 'bar',
                        })
                      }
                      options={[
                        { value: 'percentage', label: '% of Max' },
                        { value: 'fixed', label: 'Fixed' },
                        { value: 'bar', label: 'Bar Only' },
                      ]}
                      isDark={isDark}
                      className="mb-3"
                    />

                    <View className="flex-row gap-3">
                      {set.weightType !== 'bar' && (
                        <View className="flex-1">
                          <NumberInput
                            label={set.weightType === 'percentage' ? 'Percentage' : 'Weight'}
                            value={set.weightValue}
                            onChangeValue={(v) =>
                              handleUpdateSet(exercise.id, set.id, { weightValue: v ?? 0 })
                            }
                            min={0}
                            max={set.weightType === 'percentage' ? 100 : 999}
                            suffix={set.weightType === 'percentage' ? '%' : settings.units === 'imperial' ? 'lbs' : 'kg'}
                            isDark={isDark}
                          />
                        </View>
                      )}
                      <View className="flex-1">
                        <NumberInput
                          label="Reps"
                          value={set.reps}
                          onChangeValue={(v) =>
                            handleUpdateSet(exercise.id, set.id, { reps: v ?? 1 })
                          }
                          min={1}
                          max={100}
                          isDark={isDark}
                        />
                      </View>
                      <View className="flex-1">
                        <NumberInput
                          label="Rest (sec)"
                          value={set.restTime}
                          onChangeValue={(v) =>
                            handleUpdateSet(exercise.id, set.id, { restTime: v })
                          }
                          min={0}
                          max={600}
                          isDark={isDark}
                        />
                      </View>
                    </View>
                  </View>
                ))}

                {/* Add Set Button */}
                <TouchableOpacity
                  onPress={() => handleAddSet(exercise.id)}
                  className={`mt-2 py-2 rounded-lg border border-dashed ${isDark ? 'border-zinc-700' : 'border-zinc-300'}`}
                >
                  <Text className={`text-center text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                    + Add Set
                  </Text>
                </TouchableOpacity>
              </Card>
            ))}

            {/* Add Exercise Button */}
            <TouchableOpacity
              onPress={() => setShowExerciseModal(true)}
              className={`py-4 rounded-xl border-2 border-dashed ${isDark ? 'border-zinc-700' : 'border-zinc-300'}`}
            >
              <View className="flex-row items-center justify-center gap-2">
                <Plus size={20} color={isDark ? '#71717a' : '#a1a1aa'} />
                <Text className={`font-medium ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                  Add Exercise
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Spacer */}
          <View className="h-8" />
        </ScrollView>

        {/* Save Button */}
        <View className={`px-4 py-4 border-t ${isDark ? 'border-zinc-800' : 'border-zinc-200'}`}>
          <Button
            onPress={handleSave}
            disabled={!name.trim() || routineExercises.length === 0}
            loading={isLoading}
            fullWidth
          >
            Create Routine
          </Button>
        </View>

        {/* Exercise Selection Modal */}
        <Modal
          visible={showExerciseModal}
          onClose={() => {
            setShowExerciseModal(false);
            setSearchQuery('');
          }}
          title="Add Exercise"
          position="bottom"
          size="full"
        >
          <Input
            placeholder="Search exercises..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            containerClassName="mb-4"
          />
          <ScrollView className="max-h-80">
            {filteredExercises.length === 0 ? (
              <Text className={`text-center py-4 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                No exercises found
              </Text>
            ) : (
              filteredExercises.map((exercise) => (
                <TouchableOpacity
                  key={exercise.id}
                  onPress={() => handleAddExercise(exercise.id, exercise.name)}
                  className={`py-3 border-b ${isDark ? 'border-zinc-800' : 'border-zinc-100'}`}
                >
                  <Text className={`font-medium ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                    {exercise.name}
                  </Text>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
