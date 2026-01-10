import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft, Calendar, Repeat, Target, Check, Plus, X } from 'lucide-react-native';
import { useSettings, useOnboarding, useRoutines, usePrograms } from '@/hooks';
import { Button, Card, Input, SegmentedControl, NumberInput, Modal } from '@/components/ui';

export default function ProgramScreen() {
  const router = useRouter();
  const { effectiveTheme } = useSettings();
  const { setStep, updateData } = useOnboarding();
  const { routines } = useRoutines();
  const { createProgram, setActive } = usePrograms();
  const isDark = effectiveTheme === 'dark';

  const [programName, setProgramName] = useState('My Program');
  const [programType, setProgramType] = useState<'continuous' | 'finite'>('continuous');
  const [totalWorkouts, setTotalWorkouts] = useState<number | null>(12);
  const [selectedRoutines, setSelectedRoutines] = useState<string[]>([]);
  const [showRoutineModal, setShowRoutineModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-select routine created in previous step
  useEffect(() => {
    if (routines.length > 0 && selectedRoutines.length === 0) {
      setSelectedRoutines([routines[0].id]);
    }
  }, [routines]);

  const toggleRoutine = (routineId: string) => {
    setSelectedRoutines((prev) => {
      if (prev.includes(routineId)) {
        return prev.filter((id) => id !== routineId);
      }
      return [...prev, routineId];
    });
  };

  const removeRoutine = (routineId: string) => {
    setSelectedRoutines((prev) => prev.filter((id) => id !== routineId));
  };

  const handleContinue = async () => {
    if (!programName.trim()) {
      Alert.alert('Error', 'Please enter a program name');
      return;
    }
    if (selectedRoutines.length === 0) {
      Alert.alert('Error', 'Please select at least one routine');
      return;
    }
    if (programType === 'finite' && (!totalWorkouts || totalWorkouts < 1)) {
      Alert.alert('Error', 'Please enter the number of workouts');
      return;
    }

    setIsSubmitting(true);
    try {
      const program = await createProgram(
        programName.trim(),
        programType,
        selectedRoutines,
        programType === 'finite' ? totalWorkouts! : undefined
      );

      // Set as active program
      await setActive(program.id);

      updateData({
        program: { name: programName, routineIds: selectedRoutines },
      });

      setStep('body-composition');
      router.push('/onboarding/body-composition');
    } catch (error) {
      Alert.alert('Error', 'Failed to create program');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    setStep('routine');
    router.back();
  };

  const selectedRoutineDetails = selectedRoutines
    .map((id) => routines.find((r) => r.id === id))
    .filter(Boolean);

  return (
    <SafeAreaView className={`flex-1 ${isDark ? 'bg-zinc-950' : 'bg-zinc-100'}`}>
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

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        <View className="items-center mb-6">
          <View className="w-16 h-16 bg-orange-500/20 rounded-full items-center justify-center mb-4">
            <Calendar size={32} color="#f97316" />
          </View>
          <Text className={`text-center ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
            A program cycles through your routines. Set it as continuous or define a specific
            length.
          </Text>
        </View>

        {/* Program Name */}
        <Card variant="elevated" className="mb-4">
          <Input
            label="Program Name"
            value={programName}
            onChangeText={setProgramName}
            placeholder="e.g., Strength Builder"
          />
        </Card>

        {/* Program Type */}
        <Card variant="elevated" className="mb-4">
          <Text className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
            Program Type
          </Text>
          <SegmentedControl
            options={[
              { label: 'Continuous', value: 'continuous' },
              { label: 'Fixed Length', value: 'finite' },
            ]}
            value={programType}
            onValueChange={(value) => setProgramType(value as 'continuous' | 'finite')}
          />

          <View className="mt-4 gap-3">
            <View className="flex-row items-start gap-3">
              <Repeat size={18} color={programType === 'continuous' ? '#f97316' : isDark ? '#71717a' : '#a1a1aa'} />
              <View className="flex-1">
                <Text className={`font-medium ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                  Continuous
                </Text>
                <Text className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                  Cycles through routines indefinitely
                </Text>
              </View>
            </View>
            <View className="flex-row items-start gap-3">
              <Target size={18} color={programType === 'finite' ? '#f97316' : isDark ? '#71717a' : '#a1a1aa'} />
              <View className="flex-1">
                <Text className={`font-medium ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                  Fixed Length
                </Text>
                <Text className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                  Ends after a set number of workouts
                </Text>
              </View>
            </View>
          </View>

          {programType === 'finite' && (
            <View className="mt-4">
              <NumberInput
                label="Number of Workouts"
                value={totalWorkouts}
                onChangeValue={setTotalWorkouts}
                min={1}
                max={100}
                step={1}
              />
            </View>
          )}
        </Card>

        {/* Selected Routines */}
        <View className="mb-4">
          <Text className={`text-sm font-medium mb-2 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
            Routines ({selectedRoutines.length})
          </Text>

          {selectedRoutineDetails.length > 0 ? (
            <View className="gap-2">
              {selectedRoutineDetails.map((routine, index) => {
                if (!routine) return null;
                return (
                  <View
                    key={routine.id}
                    className={`p-4 rounded-xl flex-row items-center ${
                      isDark ? 'bg-zinc-800' : 'bg-white'
                    }`}
                  >
                    <View className="w-8 h-8 bg-orange-500/20 rounded items-center justify-center mr-3">
                      <Text className="text-orange-500 font-semibold">{index + 1}</Text>
                    </View>
                    <View className="flex-1">
                      <Text className={`font-medium ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                        {routine.name}
                      </Text>
                    </View>
                    <TouchableOpacity onPress={() => removeRoutine(routine.id)}>
                      <X size={18} color={isDark ? '#71717a' : '#a1a1aa'} />
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          ) : (
            <View className={`p-6 rounded-xl items-center ${isDark ? 'bg-zinc-800' : 'bg-white'}`}>
              <Text className={isDark ? 'text-zinc-400' : 'text-zinc-500'}>
                No routines selected
              </Text>
            </View>
          )}
        </View>

        {/* Add Routine Button */}
        {routines.length > selectedRoutines.length && (
          <TouchableOpacity
            onPress={() => setShowRoutineModal(true)}
            className={`p-4 rounded-xl flex-row items-center justify-center gap-2 border border-dashed mb-6 ${
              isDark ? 'border-zinc-700' : 'border-zinc-300'
            }`}
          >
            <Plus size={20} color="#f97316" />
            <Text className="text-orange-500 font-medium">Add Routine</Text>
          </TouchableOpacity>
        )}

        {/* Info */}
        <View className={`p-3 rounded-lg mb-6 ${isDark ? 'bg-zinc-800/50' : 'bg-zinc-200/50'}`}>
          <Text className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
            The program will cycle through routines in order. If you have Workout A and Workout B,
            it will alternate between them.
          </Text>
        </View>
      </ScrollView>

      {/* Continue Button */}
      <View className="px-6 pb-6">
        <Button
          onPress={handleContinue}
          loading={isSubmitting}
          disabled={selectedRoutines.length === 0 || !programName.trim()}
          size="lg"
          fullWidth
        >
          Continue
        </Button>
      </View>

      {/* Routine Selection Modal */}
      <Modal
        visible={showRoutineModal}
        onClose={() => setShowRoutineModal(false)}
        title="Select Routines"
        position="bottom"
      >
        <ScrollView style={{ maxHeight: 400 }}>
          {routines.length === 0 ? (
            <View className="p-6 items-center">
              <Text className={isDark ? 'text-zinc-400' : 'text-zinc-500'}>
                No routines available.
              </Text>
            </View>
          ) : (
            <View className="gap-2">
              {routines.map((routine) => {
                const isSelected = selectedRoutines.includes(routine.id);
                return (
                  <TouchableOpacity
                    key={routine.id}
                    onPress={() => toggleRoutine(routine.id)}
                    className={`p-3 rounded-lg flex-row items-center ${
                      isSelected
                        ? 'bg-orange-500/20 border border-orange-500'
                        : isDark
                          ? 'bg-zinc-700'
                          : 'bg-zinc-100'
                    }`}
                  >
                    <View
                      className={`w-8 h-8 rounded items-center justify-center mr-3 ${
                        isSelected ? 'bg-orange-500' : isDark ? 'bg-zinc-600' : 'bg-zinc-200'
                      }`}
                    >
                      {isSelected ? (
                        <Check size={16} color="#ffffff" />
                      ) : (
                        <Plus size={16} color={isDark ? '#a1a1aa' : '#71717a'} />
                      )}
                    </View>
                    <Text
                      className={`font-medium ${
                        isSelected
                          ? 'text-orange-500'
                          : isDark
                            ? 'text-white'
                            : 'text-zinc-900'
                      }`}
                    >
                      {routine.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </ScrollView>
        <View className="mt-4">
          <Button onPress={() => setShowRoutineModal(false)} fullWidth>
            Done ({selectedRoutines.length} selected)
          </Button>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
