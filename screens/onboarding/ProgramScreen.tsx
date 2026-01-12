import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  ChevronLeft,
  Calendar,
  Check,
  Infinity as InfinityIcon,
  Target,
  GripVertical,
} from 'lucide-react-native';
import { useSettings, useOnboarding, useRoutines, usePrograms } from '@/hooks';
import { Button, Card, Input, NumberInput, SegmentedControl, IconBox } from '@/components/ui';
import { OnboardingStackParamList } from '../../App';

type NavigationProp = NativeStackNavigationProp<OnboardingStackParamList>;

export default function ProgramScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { effectiveTheme } = useSettings();
  const { updateData, setStep } = useOnboarding();
  const { routines, isLoading: routinesLoading } = useRoutines();
  const { createProgram, setActive, isLoading: programsLoading } = usePrograms();
  const isDark = effectiveTheme === 'dark';

  const [programName, setProgramName] = useState('Strength Program');
  const [programType, setProgramType] = useState<'continuous' | 'finite'>('continuous');
  const [selectedRoutineIds, setSelectedRoutineIds] = useState<string[]>([]);
  const [totalWorkouts, setTotalWorkouts] = useState<number | null>(12);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const hasInitialized = useRef(false);

  // Initialize with first routine if available
  useEffect(() => {
    if (routines.length > 0 && !hasInitialized.current && selectedRoutineIds.length === 0) {
      hasInitialized.current = true;
      // Select the first routine by default
      setSelectedRoutineIds([routines[0].id]);
    }
  }, [routines, selectedRoutineIds.length]);

  const toggleRoutine = (routineId: string) => {
    setSelectedRoutineIds((prev) => {
      if (prev.includes(routineId)) {
        return prev.filter((id) => id !== routineId);
      }
      return [...prev, routineId];
    });
  };

  const moveRoutineUp = (index: number) => {
    if (index === 0) return;
    setSelectedRoutineIds((prev) => {
      const newIds = [...prev];
      [newIds[index - 1], newIds[index]] = [newIds[index], newIds[index - 1]];
      return newIds;
    });
  };

  const moveRoutineDown = (index: number) => {
    if (index === selectedRoutineIds.length - 1) return;
    setSelectedRoutineIds((prev) => {
      const newIds = [...prev];
      [newIds[index], newIds[index + 1]] = [newIds[index + 1], newIds[index]];
      return newIds;
    });
  };

  const handleContinue = async () => {
    if (!programName.trim()) {
      Alert.alert('Error', 'Please enter a program name');
      return;
    }
    if (selectedRoutineIds.length === 0) {
      Alert.alert('Error', 'Please select at least one routine');
      return;
    }
    if (programType === 'finite' && (!totalWorkouts || totalWorkouts < 1)) {
      Alert.alert('Error', 'Please enter a valid number of workouts');
      return;
    }

    setIsSubmitting(true);
    try {
      // Create the program
      const program = await createProgram(
        programName.trim(),
        programType,
        selectedRoutineIds,
        programType === 'finite' ? totalWorkouts ?? undefined : undefined
      );

      // Set it as the active program
      await setActive(program.id);

      updateData({
        program: {
          name: programName.trim(),
          routineIds: selectedRoutineIds,
        },
      });
      setStep('body-composition');
      navigation.navigate('BodyComposition');
    } catch (error) {
      console.error('Failed to create program:', error);
      Alert.alert('Error', `Failed to create program: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    setStep('routine');
    navigation.goBack();
  };

  // Get routine names for display
  const getRoutineName = (id: string) => {
    return routines.find((r) => r.id === id)?.name || 'Unknown';
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: isDark ? '#09090b' : '#f4f4f5' }}>
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 gap-3">
        <TouchableOpacity onPress={handleBack}>
          <ChevronLeft size={24} color={isDark ? '#ffffff' : '#18181b'} />
        </TouchableOpacity>
        <Text className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-zinc-900'}`}>
          Create Program
        </Text>
      </View>

      {/* Progress indicator */}
      <View className="px-6 mb-6">
        <View className={`h-1 rounded-full ${isDark ? 'bg-zinc-800' : 'bg-zinc-200'}`}>
          <View className="h-1 rounded-full bg-orange-500 w-[70%]" />
        </View>
        <Text className={`text-sm mt-2 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
          Step 7 of 10
        </Text>
      </View>

      <ScrollView
        className="flex-1 px-6"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        <View className="items-center mb-10">
          <IconBox size="xl" variant="primary-muted" rounded="full" className="mb-4">
            <Calendar size={32} color="#f97316" />
          </IconBox>
          <Text className={`text-center ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
            A program cycles through routines in order. Choose continuous for ongoing training or
            finite for a set number of workouts.
          </Text>
        </View>

        {/* Program Name */}
        <View className="mt-4">
          <Input
            label="Program Name"
            value={programName}
            onChangeText={setProgramName}
            placeholder="e.g., 5x5 Strength, Push/Pull/Legs"
            className="mb-6"
          />
        </View>

        {/* Program Type */}
        <View className="mt-4 mb-6">
          <Text
            className={`text-sm font-medium mb-3 ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}
          >
            Program Type
          </Text>
          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={() => setProgramType('continuous')}
              style={{
                flex: 1,
                padding: 16,
                borderRadius: 12,
                backgroundColor: programType === 'continuous'
                  ? 'rgba(249, 115, 22, 0.2)'
                  : isDark
                    ? '#27272a'
                    : '#ffffff',
                borderWidth: programType === 'continuous' ? 1 : 0,
                borderColor: programType === 'continuous' ? '#f97316' : 'transparent',
              }}
            >
              <View className="flex-row items-center gap-3 mb-2">
                <IconBox
                  variant={programType === 'continuous' ? 'primary' : isDark ? 'muted-dark' : 'muted'}
                >
                  <InfinityIcon
                    size={20}
                    color={programType === 'continuous' ? '#ffffff' : isDark ? '#a1a1aa' : '#71717a'}
                  />
                </IconBox>
                {programType === 'continuous' && <Check size={20} color="#f97316" />}
              </View>
              <Text
                className={`font-medium ${
                  programType === 'continuous'
                    ? 'text-orange-500'
                    : isDark
                      ? 'text-white'
                      : 'text-zinc-900'
                }`}
              >
                Continuous
              </Text>
              <Text className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                Cycles through routines forever
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setProgramType('finite')}
              style={{
                flex: 1,
                padding: 16,
                borderRadius: 12,
                backgroundColor: programType === 'finite'
                  ? 'rgba(249, 115, 22, 0.2)'
                  : isDark
                    ? '#27272a'
                    : '#ffffff',
                borderWidth: programType === 'finite' ? 1 : 0,
                borderColor: programType === 'finite' ? '#f97316' : 'transparent',
              }}
            >
              <View className="flex-row items-center gap-3 mb-2">
                <IconBox
                  variant={programType === 'finite' ? 'primary' : isDark ? 'muted-dark' : 'muted'}
                >
                  <Target
                    size={20}
                    color={programType === 'finite' ? '#ffffff' : isDark ? '#a1a1aa' : '#71717a'}
                  />
                </IconBox>
                {programType === 'finite' && <Check size={20} color="#f97316" />}
              </View>
              <Text
                className={`font-medium ${
                  programType === 'finite'
                    ? 'text-orange-500'
                    : isDark
                      ? 'text-white'
                      : 'text-zinc-900'
                }`}
              >
                Fixed Length
              </Text>
              <Text className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                Set number of workouts
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Total Workouts (for finite programs) */}
        {programType === 'finite' && (
          <Card variant="elevated" className="mb-6 mt-4">
            <NumberInput
              label="Total Workouts"
              value={totalWorkouts}
              onChangeValue={setTotalWorkouts}
              min={1}
              max={52}
              step={1}
              suffix="workouts"
              isDark={isDark}
            />
          </Card>
        )}

        {/* Select Routines */}
        <Text className={`text-sm font-medium mt-4 mb-3 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
          Select Routines (order matters)
        </Text>

        {routines.length === 0 ? (
          <Card variant="elevated" className="mb-6">
            <Text className={`text-center ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
              No routines available. Go back to create a routine first.
            </Text>
          </Card>
        ) : (
          <>
            {/* Available Routines */}
            <View className="gap-2 mb-4">
              {routines.map((routine) => {
                const isSelected = selectedRoutineIds.includes(routine.id);
                return (
                  <TouchableOpacity
                    key={routine.id}
                    onPress={() => toggleRoutine(routine.id)}
                    style={{
                      padding: 16,
                      borderRadius: 12,
                      flexDirection: 'row',
                      alignItems: 'center',
                      backgroundColor: isSelected
                        ? 'rgba(249, 115, 22, 0.2)'
                        : isDark
                          ? '#27272a'
                          : '#ffffff',
                      borderWidth: isSelected ? 1 : 0,
                      borderColor: isSelected ? '#f97316' : 'transparent',
                    }}
                  >
                    <IconBox
                      variant={isSelected ? 'primary' : isDark ? 'muted-dark' : 'muted'}
                      className="mr-3"
                    >
                      {isSelected ? (
                        <Check size={20} color="#ffffff" />
                      ) : (
                        <Calendar size={20} color={isDark ? '#a1a1aa' : '#71717a'} />
                      )}
                    </IconBox>
                    <Text
                      className={`flex-1 font-medium ${
                        isSelected ? 'text-orange-500' : isDark ? 'text-white' : 'text-zinc-900'
                      }`}
                    >
                      {routine.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Selected Routines Order */}
            {selectedRoutineIds.length > 1 && (
              <>
                <Text
                  className={`text-sm font-medium mb-3 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}
                >
                  Routine Order
                </Text>
                <Card variant="elevated" className="mb-6">
                  {selectedRoutineIds.map((id, index) => (
                    <View
                      key={id}
                      className={`flex-row items-center py-3 ${
                        index !== selectedRoutineIds.length - 1 ? 'border-b border-zinc-700' : ''
                      }`}
                    >
                      <IconBox size="sm" variant="primary-muted" className="mr-3">
                        <Text className="text-orange-500 font-bold">{index + 1}</Text>
                      </IconBox>
                      <Text className={`flex-1 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                        {getRoutineName(id)}
                      </Text>
                      <View className="flex-row gap-1">
                        <TouchableOpacity
                          onPress={() => moveRoutineUp(index)}
                          disabled={index === 0}
                          className={`p-2 ${index === 0 ? 'opacity-30' : ''}`}
                        >
                          <Text className="text-orange-500 text-lg">^</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => moveRoutineDown(index)}
                          disabled={index === selectedRoutineIds.length - 1}
                          className={`p-2 ${
                            index === selectedRoutineIds.length - 1 ? 'opacity-30' : ''
                          }`}
                        >
                          <Text className="text-orange-500 text-lg">v</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                </Card>
              </>
            )}
          </>
        )}

        {/* Info Box */}
        <View className={`p-4 rounded-xl mb-10 ${isDark ? 'bg-zinc-800/50' : 'bg-zinc-200/50'}`}>
          <Text className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
            {programType === 'continuous'
              ? 'Your program will cycle through the selected routines in order, repeating indefinitely. Great for ongoing strength training.'
              : `Your program will complete after ${totalWorkouts} workouts, cycling through routines in order. Perfect for focused training blocks.`}
          </Text>
        </View>
      </ScrollView>

      {/* Continue Button */}
      <View className="px-6 pb-6">
        <Button
          onPress={handleContinue}
          loading={isSubmitting}
          disabled={selectedRoutineIds.length === 0 || !programName.trim()}
          size="lg"
          fullWidth
        >
          Continue
        </Button>
      </View>
    </SafeAreaView>
  );
}
