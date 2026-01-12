import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import DraggableFlatList, { ScaleDecorator, RenderItemParams } from 'react-native-draggable-flatlist';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  ChevronLeft,
  ListOrdered,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  GripVertical,
} from 'lucide-react-native';
import { useSettings, useOnboarding, useExercises, useRoutines } from '@/hooks';
import { Button, Card, Input, NumberInput, Modal, SegmentedControl, IconBox } from '@/components/ui';
import { OnboardingStackParamList } from '../../App';
import { RoutineExerciseInput, RoutineSetInput } from '@/services/routine.service';

type NavigationProp = NativeStackNavigationProp<OnboardingStackParamList>;

interface RoutineExerciseItem {
  id: string;
  exerciseId: string;
  exerciseName: string;
  sets: RoutineSetInput[];
}

let itemIdCounter = 0;
const generateItemId = () => `item-${++itemIdCounter}`;

const DEFAULT_SET: RoutineSetInput = {
  weightType: 'percentage',
  weightValue: 75,
  reps: 5,
  restTime: 90,
};

export default function RoutineScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { effectiveTheme, settings } = useSettings();
  const { updateData, setStep } = useOnboarding();
  const { exercises } = useExercises();
  const { createRoutine } = useRoutines();
  const isDark = effectiveTheme === 'dark';

  const [routineName, setRoutineName] = useState('Full Body A');
  const [routineExercises, setRoutineExercises] = useState<RoutineExerciseItem[]>([]);
  const [showAddExerciseModal, setShowAddExerciseModal] = useState(false);
  const [showEditSetModal, setShowEditSetModal] = useState(false);
  const [editingExerciseIndex, setEditingExerciseIndex] = useState<number | null>(null);
  const [editingSetIndex, setEditingSetIndex] = useState<number | null>(null);
  const [setWeightType, setSetWeightType] = useState<'percentage' | 'fixed' | 'bar'>('percentage');
  const [setWeightValue, setSetWeightValue] = useState<number | null>(75);
  const [setReps, setSetReps] = useState<number | null>(5);
  const [setRestTime, setSetRestTime] = useState<number | null>(90);
  const [expandedExercise, setExpandedExercise] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const hasInitialized = useRef(false);

  // Initialize with default exercises if we have them
  useEffect(() => {
    if (exercises.length > 0 && !hasInitialized.current && routineExercises.length === 0) {
      hasInitialized.current = true;
      // Add first 3 exercises with default sets
      const defaultExercises = exercises.slice(0, 3).map((ex) => ({
        id: generateItemId(),
        exerciseId: ex.id,
        exerciseName: ex.name,
        sets: [
          { weightType: 'percentage' as const, weightValue: 70, reps: 5, restTime: 90 },
          { weightType: 'percentage' as const, weightValue: 75, reps: 5, restTime: 90 },
          { weightType: 'percentage' as const, weightValue: 80, reps: 5, restTime: 120 },
        ],
      }));
      setRoutineExercises(defaultExercises);
    }
  }, [exercises, routineExercises.length]);

  const handleAddExercise = (exerciseId: string) => {
    const exercise = exercises.find((e) => e.id === exerciseId);
    if (!exercise) return;

    // Check if already added
    if (routineExercises.some((re) => re.exerciseId === exerciseId)) {
      Alert.alert('Already Added', 'This exercise is already in the routine');
      return;
    }

    setRoutineExercises((prev) => [
      ...prev,
      {
        id: generateItemId(),
        exerciseId,
        exerciseName: exercise.name,
        sets: [{ ...DEFAULT_SET }],
      },
    ]);
    setShowAddExerciseModal(false);
  };

  const removeExercise = (index: number) => {
    setRoutineExercises((prev) => prev.filter((_, i) => i !== index));
  };

  const addSet = (exerciseIndex: number) => {
    setRoutineExercises((prev) =>
      prev.map((ex, i) => {
        if (i === exerciseIndex) {
          const lastSet = ex.sets[ex.sets.length - 1] || DEFAULT_SET;
          return {
            ...ex,
            sets: [...ex.sets, { ...lastSet }],
          };
        }
        return ex;
      })
    );
  };

  const removeSet = (exerciseIndex: number, setIndex: number) => {
    setRoutineExercises((prev) =>
      prev.map((ex, i) => {
        if (i === exerciseIndex) {
          return {
            ...ex,
            sets: ex.sets.filter((_, si) => si !== setIndex),
          };
        }
        return ex;
      })
    );
  };

  const openEditSetModal = (exerciseIndex: number, setIndex: number) => {
    const set = routineExercises[exerciseIndex].sets[setIndex];
    setEditingExerciseIndex(exerciseIndex);
    setEditingSetIndex(setIndex);
    setSetWeightType(set.weightType);
    setSetWeightValue(set.weightValue);
    setSetReps(set.reps);
    setSetRestTime(set.restTime ?? 90);
    setShowEditSetModal(true);
  };

  const saveSet = () => {
    if (editingExerciseIndex === null || editingSetIndex === null) return;
    if (!setWeightValue || !setReps) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setRoutineExercises((prev) =>
      prev.map((ex, i) => {
        if (i === editingExerciseIndex) {
          return {
            ...ex,
            sets: ex.sets.map((s, si) => {
              if (si === editingSetIndex) {
                return {
                  weightType: setWeightType,
                  weightValue: setWeightValue,
                  reps: setReps,
                  restTime: setRestTime,
                };
              }
              return s;
            }),
          };
        }
        return ex;
      })
    );
    setShowEditSetModal(false);
  };

  const handleContinue = async () => {
    if (!routineName.trim()) {
      Alert.alert('Error', 'Please enter a routine name');
      return;
    }
    if (routineExercises.length === 0) {
      Alert.alert('Error', 'Please add at least one exercise');
      return;
    }

    setIsSubmitting(true);
    try {
      // Format exercises for creation
      const exercisesInput: RoutineExerciseInput[] = routineExercises.map((ex) => ({
        exerciseId: ex.exerciseId,
        sets: ex.sets,
      }));

      // Create the routine
      await createRoutine(routineName.trim(), exercisesInput);

      updateData({
        routine: {
          name: routineName.trim(),
          exerciseIds: routineExercises.map((e) => e.exerciseId),
        },
      });
      setStep('program');
      navigation.navigate('Program');
    } catch (_error) {
      Alert.alert('Error', 'Failed to create routine');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    setStep('exercises');
    navigation.goBack();
  };

  const toggleExpanded = (id: string) => {
    setExpandedExercise((prev) => (prev === id ? null : id));
  };

  const handleDragEnd = useCallback(({ data }: { data: RoutineExerciseItem[] }) => {
    setRoutineExercises(data);
  }, []);

  // Get available exercises (not already in routine)
  const availableExercises = exercises.filter(
    (e) => !routineExercises.some((re) => re.exerciseId === e.id)
  );

  const renderExerciseItem = useCallback(
    ({ item, drag, isActive, getIndex }: RenderItemParams<RoutineExerciseItem>) => {
      const exerciseIndex = getIndex() ?? 0;
      const isExpanded = expandedExercise === item.id;

      return (
        <ScaleDecorator>
          <View className="px-6 mb-3" style={{ opacity: isActive ? 0.9 : 1 }}>
            <Card variant="elevated">
              {/* Exercise Header */}
              <View className="flex-row items-center justify-between">
                <TouchableOpacity
                  onLongPress={drag}
                  delayLongPress={100}
                  className="p-2 -ml-2"
                >
                  <GripVertical size={20} color={isDark ? '#71717a' : '#a1a1aa'} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => toggleExpanded(item.id)}
                  className="flex-row items-center flex-1"
                >
                  <IconBox size="sm" variant="primary-muted" className="mr-3">
                    <Text className="text-orange-500 font-bold">{exerciseIndex + 1}</Text>
                  </IconBox>
                  <View className="flex-1">
                    <Text className={`font-medium ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                      {item.exerciseName}
                    </Text>
                    <Text className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                      {item.sets.length} sets
                    </Text>
                  </View>
                </TouchableOpacity>
                <View className="flex-row items-center gap-2">
                  <TouchableOpacity onPress={() => removeExercise(exerciseIndex)} className="p-2">
                    <Trash2 size={18} color="#ef4444" />
                  </TouchableOpacity>
                  {isExpanded ? (
                    <ChevronUp size={20} color={isDark ? '#a1a1aa' : '#71717a'} />
                  ) : (
                    <ChevronDown size={20} color={isDark ? '#a1a1aa' : '#71717a'} />
                  )}
                </View>
              </View>

              {/* Sets (Expanded) */}
              {isExpanded && (
                <View className={`mt-4 pt-4 border-t ${isDark ? 'border-zinc-700' : 'border-zinc-200'}`}>
                  {item.sets.map((set, setIndex) => (
                    <TouchableOpacity
                      key={setIndex}
                      onPress={() => openEditSetModal(exerciseIndex, setIndex)}
                      className={`flex-row items-center justify-between py-2 ${
                        setIndex !== item.sets.length - 1
                          ? `border-b ${isDark ? 'border-zinc-800' : 'border-zinc-200'}`
                          : ''
                      }`}
                    >
                      <Text className={`${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                        Set {setIndex + 1}
                      </Text>
                      <View className="flex-row items-center gap-4">
                        <Text className={`${isDark ? 'text-white' : 'text-zinc-900'}`}>
                          {set.weightType === 'percentage'
                            ? `${set.weightValue}%`
                            : set.weightType === 'bar'
                            ? 'Bar only'
                            : `${set.weightValue} ${settings.units === 'imperial' ? 'lbs' : 'kg'}`}
                        </Text>
                        <Text className={`${isDark ? 'text-white' : 'text-zinc-900'}`}>
                          {set.reps} reps
                        </Text>
                        {item.sets.length > 1 && (
                          <TouchableOpacity
                            onPress={() => removeSet(exerciseIndex, setIndex)}
                            className="p-1"
                          >
                            <Trash2 size={14} color="#ef4444" />
                          </TouchableOpacity>
                        )}
                      </View>
                    </TouchableOpacity>
                  ))}
                  <TouchableOpacity
                    onPress={() => addSet(exerciseIndex)}
                    className="flex-row items-center justify-center gap-2 mt-3 py-2"
                  >
                    <Plus size={16} color="#f97316" />
                    <Text className="text-orange-500 text-sm font-medium">Add Set</Text>
                  </TouchableOpacity>
                </View>
              )}
            </Card>
          </View>
        </ScaleDecorator>
      );
    },
    [expandedExercise, isDark, settings.units, toggleExpanded, removeExercise, openEditSetModal, removeSet, addSet]
  );

  const ListHeader = useCallback(
    () => (
      <View className="px-6">
        {/* Exercises Label */}
        <Text className={`text-sm font-medium mb-3 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
          Exercises ({routineExercises.length})
        </Text>
      </View>
    ),
    [isDark, routineExercises.length]
  );

  const ListFooter = useCallback(
    () => (
      <View className="px-6">
        {/* Add Exercise Button */}
        <TouchableOpacity
          onPress={() => setShowAddExerciseModal(true)}
          disabled={availableExercises.length === 0}
          className={`p-4 rounded-xl flex-row items-center justify-center gap-2 border border-dashed mt-1 mb-4 ${
            isDark ? 'border-zinc-700' : 'border-zinc-300'
          } ${availableExercises.length === 0 ? 'opacity-50' : ''}`}
        >
          <Plus size={20} color="#f97316" />
          <Text className="text-orange-500 font-medium">Add Exercise</Text>
        </TouchableOpacity>
      </View>
    ),
    [isDark, availableExercises.length]
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView className="flex-1" style={{ backgroundColor: isDark ? '#09090b' : '#f4f4f5' }}>
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

        {/* Intro and Routine Name - Outside DraggableFlatList for proper keyboard handling */}
        <View className="px-6">
          <View className="items-center mb-6">
            <IconBox size="xl" variant="primary-muted" rounded="full" className="mb-4">
              <ListOrdered size={32} color="#f97316" />
            </IconBox>
            <Text className={`text-center ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
              Create a workout routine with exercises and sets. You can use percentage-based weights
              or fixed weights.
            </Text>
          </View>

          <Input
            label="Routine Name"
            value={routineName}
            onChangeText={setRoutineName}
            placeholder="e.g., Push Day, Full Body A"
            className="mb-4"
          />
        </View>

        <DraggableFlatList
          data={routineExercises}
          renderItem={renderExerciseItem}
          keyExtractor={(item) => item.id}
          onDragEnd={handleDragEnd}
          ListHeaderComponent={ListHeader}
          ListFooterComponent={ListFooter}
          showsVerticalScrollIndicator={false}
          containerStyle={{ flex: 1 }}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        />

      {/* Continue Button */}
      <View className="px-6 pb-6">
        <Button
          onPress={handleContinue}
          loading={isSubmitting}
          disabled={routineExercises.length === 0 || !routineName.trim()}
          size="lg"
          fullWidth
        >
          Continue
        </Button>
      </View>

      {/* Add Exercise Modal */}
      <Modal
        visible={showAddExerciseModal}
        onClose={() => setShowAddExerciseModal(false)}
        title="Add Exercise"
        position="bottom"
      >
        <ScrollView className="max-h-80">
          {availableExercises.length > 0 ? (
            <View className="gap-2">
              {availableExercises.map((exercise) => (
                <TouchableOpacity
                  key={exercise.id}
                  onPress={() => handleAddExercise(exercise.id)}
                  className={`p-4 rounded-xl flex-row items-center ${
                    isDark ? 'bg-zinc-800' : 'bg-zinc-100'
                  }`}
                >
                  <Text className={`flex-1 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                    {exercise.name}
                  </Text>
                  <Plus size={20} color="#f97316" />
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <Text className={`text-center py-4 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
              All exercises have been added to the routine
            </Text>
          )}
        </ScrollView>
      </Modal>

      {/* Edit Set Modal */}
      <Modal
        visible={showEditSetModal}
        onClose={() => setShowEditSetModal(false)}
        title="Edit Set"
        position="bottom"
      >
        <View className="gap-4">
          <View>
            <Text
              className={`text-sm font-medium mb-2 ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}
            >
              Weight Type
            </Text>
            <SegmentedControl
              options={[
                { label: '% of Max', value: 'percentage' },
                { label: 'Fixed', value: 'fixed' },
                { label: 'Bar Only', value: 'bar' },
              ]}
              value={setWeightType}
              onValueChange={(value) => setSetWeightType(value as 'percentage' | 'fixed' | 'bar')}
              isDark={isDark}
            />
          </View>

          {setWeightType !== 'bar' && (
            <NumberInput
              label={setWeightType === 'percentage' ? 'Percentage of Max' : 'Weight'}
              value={setWeightValue}
              onChangeValue={setSetWeightValue}
              min={setWeightType === 'percentage' ? 30 : 5}
              max={setWeightType === 'percentage' ? 110 : 1000}
              step={setWeightType === 'percentage' ? 5 : 5}
              suffix={setWeightType === 'percentage' ? '%' : settings.units === 'imperial' ? 'lbs' : 'kg'}
              isDark={isDark}
            />
          )}

          <NumberInput
            label="Reps"
            value={setReps}
            onChangeValue={setSetReps}
            min={1}
            max={30}
            step={1}
            isDark={isDark}
          />

          <NumberInput
            label="Rest Time"
            value={setRestTime}
            onChangeValue={setSetRestTime}
            min={30}
            max={300}
            step={15}
            suffix="sec"
            isDark={isDark}
          />

          <Button onPress={saveSet} fullWidth>
            Save Set
          </Button>
        </View>
      </Modal>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}
