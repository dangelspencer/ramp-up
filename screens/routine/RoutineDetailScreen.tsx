import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ChevronLeft, Plus, Trash2, GripVertical, Play, Copy, Pencil, X } from 'lucide-react-native';

import { RootStackParamList } from '../../App';
import { useSettings, useRoutine, useRoutines, useExercises } from '@/hooks';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input, NumberInput } from '@/components/ui/Input';
import { Modal, ConfirmModal } from '@/components/ui/Modal';
import { SegmentedControl } from '@/components/ui/Select';
import { RoutineExerciseInput } from '@/services/routine.service';
import { formatWeight } from '@/utils/formatting';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type RoutineDetailRouteProp = RouteProp<RootStackParamList, 'RoutineDetail'>;

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

export default function RoutineDetailScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RoutineDetailRouteProp>();
  const { id } = route.params;

  const { effectiveTheme, settings } = useSettings();
  const isDark = effectiveTheme === 'dark';

  const { routine, isLoading, updateName, updateExercises, refresh } = useRoutine(id);
  const { deleteRoutine, duplicateRoutine } = useRoutines();
  const { exercises } = useExercises();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [routineExercises, setRoutineExercises] = useState<ExerciseEntry[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [duplicateName, setDuplicateName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Initialize state from routine data
  useEffect(() => {
    if (routine) {
      setName(routine.name);
      setRoutineExercises(
        routine.exercises.map((e) => ({
          id: e.id,
          exerciseId: e.exerciseId,
          exerciseName: e.exercise.name,
          sets: e.sets.map((s) => ({
            id: s.id,
            weightType: s.weightType,
            weightValue: s.weightValue,
            reps: s.reps,
            restTime: s.restTime,
          })),
        }))
      );
    }
  }, [routine]);

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
        if (e.sets.length <= 1) return e;
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

    setIsSaving(true);
    try {
      await updateName(name.trim());

      const exerciseInputs: RoutineExerciseInput[] = routineExercises.map((e) => ({
        exerciseId: e.exerciseId,
        sets: e.sets.map((s) => ({
          weightType: s.weightType,
          weightValue: s.weightValue,
          reps: s.reps,
          restTime: s.restTime,
        })),
      }));

      await updateExercises(exerciseInputs);
      setIsEditing(false);
      refresh();
    } catch (error) {
      Alert.alert('Error', 'Failed to save routine');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteRoutine(id);
      setShowDeleteModal(false);
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to delete routine');
    }
  };

  const handleDuplicate = async () => {
    if (!duplicateName.trim()) {
      Alert.alert('Error', 'Please enter a name for the duplicate');
      return;
    }

    try {
      await duplicateRoutine(id, duplicateName.trim());
      setShowDuplicateModal(false);
      setDuplicateName('');
      Alert.alert('Success', 'Routine duplicated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to duplicate routine');
    }
  };

  const handleStartWorkout = () => {
    navigation.navigate('Workout', { routineId: id });
  };

  const handleCancelEdit = () => {
    if (routine) {
      setName(routine.name);
      setRoutineExercises(
        routine.exercises.map((e) => ({
          id: e.id,
          exerciseId: e.exerciseId,
          exerciseName: e.exercise.name,
          sets: e.sets.map((s) => ({
            id: s.id,
            weightType: s.weightType,
            weightValue: s.weightValue,
            reps: s.reps,
            restTime: s.restTime,
          })),
        }))
      );
    }
    setIsEditing(false);
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

  if (!routine) {
    return (
      <SafeAreaView className="flex-1" style={{ backgroundColor: isDark ? '#09090b' : '#f4f4f5' }}>
        <View className="flex-1 items-center justify-center">
          <Text className={isDark ? 'text-zinc-400' : 'text-zinc-500'}>Routine not found</Text>
          <Button onPress={() => navigation.goBack()} variant="outline" className="mt-4">
            Go Back
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: isDark ? '#09090b' : '#f4f4f5' }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
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
              {isEditing ? 'Edit Routine' : 'Routine Details'}
            </Text>
            {isEditing ? (
              <TouchableOpacity
                onPress={handleCancelEdit}
                className={`p-2 rounded-lg ${isDark ? 'bg-zinc-800' : 'bg-white'}`}
              >
                <X size={24} color={isDark ? '#ffffff' : '#18181b'} />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={() => setIsEditing(true)}
                className="p-2 rounded-lg bg-orange-500"
              >
                <Pencil size={20} color="#ffffff" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <ScrollView className="flex-1 px-4">
          {isEditing ? (
            // Edit Mode
            <>
              <View className="mt-4">
                <Input
                  label="Routine Name"
                  value={name}
                  onChangeText={setName}
                  placeholder="e.g., Upper Body A"
                />
              </View>

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
            </>
          ) : (
            // View Mode
            <>
              <View className="mt-4">
                <Text className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                  {routine.name}
                </Text>
                <Text className={`text-sm mt-1 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                  {routine.exercises.length} exercise{routine.exercises.length !== 1 ? 's' : ''} -{' '}
                  {routine.exercises.reduce((acc, e) => acc + e.sets.length, 0)} total sets
                </Text>
              </View>

              {/* Action Buttons */}
              <View className="flex-row gap-3 mt-4">
                <TouchableOpacity
                  onPress={() => {
                    setDuplicateName(`${routine.name} (Copy)`);
                    setShowDuplicateModal(true);
                  }}
                  className={`flex-1 py-3 rounded-lg flex-row items-center justify-center gap-2 ${isDark ? 'bg-zinc-800' : 'bg-zinc-200'}`}
                >
                  <Copy size={18} color={isDark ? '#a1a1aa' : '#71717a'} />
                  <Text className={`font-medium ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                    Duplicate
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setShowDeleteModal(true)}
                  style={{
                    flex: 1,
                    paddingVertical: 12,
                    borderRadius: 8,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  }}
                >
                  <Trash2 size={18} color="#ef4444" />
                  <Text className="font-medium text-red-500">Delete</Text>
                </TouchableOpacity>
              </View>

              {/* Exercises List */}
              <View className="mt-6">
                <Text className={`text-sm font-medium mb-2 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                  Exercises
                </Text>

                {routine.exercises.map((exercise, index) => (
                  <Card key={exercise.id} className="mb-3">
                    <Text className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                      {exercise.exercise.name}
                    </Text>
                    {exercise.sets.map((set, setIndex) => (
                      <View
                        key={set.id}
                        className={`py-2 flex-row justify-between ${
                          setIndex > 0 ? `border-t ${isDark ? 'border-zinc-700' : 'border-zinc-200'}` : ''
                        }`}
                      >
                        <Text className={isDark ? 'text-zinc-400' : 'text-zinc-500'}>
                          Set {setIndex + 1}
                        </Text>
                        <Text className={isDark ? 'text-white' : 'text-zinc-900'}>
                          {set.weightType === 'percentage'
                            ? `${set.weightValue}%`
                            : set.weightType === 'bar'
                            ? 'Bar only'
                            : formatWeight(set.weightValue, settings.units === 'imperial' ? 'lbs' : 'kg')}{' '}
                          x {set.reps} reps
                        </Text>
                      </View>
                    ))}
                  </Card>
                ))}
              </View>
            </>
          )}

          <View className="h-8" />
        </ScrollView>

        {/* Bottom Button */}
        <View className={`px-4 py-4 border-t ${isDark ? 'border-zinc-800' : 'border-zinc-200'}`}>
          {isEditing ? (
            <Button
              onPress={handleSave}
              disabled={!name.trim() || routineExercises.length === 0}
              loading={isSaving}
              fullWidth
            >
              Save Changes
            </Button>
          ) : (
            <Button
              onPress={handleStartWorkout}
              icon={<Play size={18} color="#ffffff" />}
              fullWidth
            >
              Start Workout
            </Button>
          )}
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

        {/* Delete Confirmation Modal */}
        <ConfirmModal
          visible={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDelete}
          title="Delete Routine?"
          message="This action cannot be undone. All data for this routine will be permanently deleted."
          confirmText="Delete"
          cancelText="Cancel"
          variant="destructive"
        />

        {/* Duplicate Modal */}
        <Modal
          visible={showDuplicateModal}
          onClose={() => setShowDuplicateModal(false)}
          title="Duplicate Routine"
        >
          <Input
            label="New Routine Name"
            value={duplicateName}
            onChangeText={setDuplicateName}
            placeholder="Enter name for duplicate"
            containerClassName="mb-4"
          />
          <View className="flex-row gap-3">
            <Button
              onPress={() => setShowDuplicateModal(false)}
              variant="outline"
              className="flex-1"
            >
              Cancel
            </Button>
            <Button onPress={handleDuplicate} className="flex-1">
              Duplicate
            </Button>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
