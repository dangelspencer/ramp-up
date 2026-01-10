import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft, Plus, Trash2, GripVertical, RefreshCw, Target } from 'lucide-react-native';
import { useSettings, usePrograms, useRoutines } from '@/hooks';
import { Button, Input, Modal, NumberInput } from '@/components/ui';

export default function CreateProgramScreen() {
  const router = useRouter();
  const { effectiveTheme } = useSettings();
  const isDark = effectiveTheme === 'dark';
  const { createProgram } = usePrograms();
  const { routines } = useRoutines();

  const [name, setName] = useState('');
  const [programType, setProgramType] = useState<'continuous' | 'finite'>('continuous');
  const [totalWorkouts, setTotalWorkouts] = useState<number | null>(12);
  const [selectedRoutineIds, setSelectedRoutineIds] = useState<string[]>([]);
  const [showRoutinePicker, setShowRoutinePicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddRoutine = (routineId: string) => {
    setSelectedRoutineIds((prev) => [...prev, routineId]);
    setShowRoutinePicker(false);
  };

  const handleRemoveRoutine = (index: number) => {
    setSelectedRoutineIds((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCreate = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a program name');
      return;
    }
    if (selectedRoutineIds.length === 0) {
      Alert.alert('Error', 'Please add at least one routine');
      return;
    }
    if (programType === 'finite' && (!totalWorkouts || totalWorkouts < 1)) {
      Alert.alert('Error', 'Please enter the total number of workouts');
      return;
    }

    setIsSubmitting(true);
    try {
      const program = await createProgram(
        name.trim(),
        programType,
        selectedRoutineIds,
        programType === 'finite' ? totalWorkouts ?? undefined : undefined
      );
      router.back();
    } catch (error) {
      Alert.alert('Error', 'Failed to create program');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRoutineName = (routineId: string) => {
    return routines.find((r) => r.id === routineId)?.name ?? 'Unknown';
  };

  return (
    <SafeAreaView className={`flex-1 ${isDark ? 'bg-zinc-950' : 'bg-zinc-100'}`}>
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 gap-3">
        <TouchableOpacity onPress={() => router.back()}>
          <ChevronLeft size={24} color={isDark ? '#ffffff' : '#18181b'} />
        </TouchableOpacity>
        <Text className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-zinc-900'}`}>
          New Program
        </Text>
      </View>

      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        <View className="gap-4 pb-8">
          {/* Program Name */}
          <Input
            label="Program Name"
            value={name}
            onChangeText={setName}
            placeholder="e.g., Starting Strength"
            autoFocus
          />

          {/* Program Type */}
          <View>
            <Text className={`text-sm font-medium mb-2 ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
              Program Type
            </Text>
            <View className="flex-row gap-2">
              <TouchableOpacity
                onPress={() => setProgramType('continuous')}
                className={`flex-1 p-4 rounded-xl flex-row items-center gap-3 ${
                  programType === 'continuous'
                    ? 'bg-orange-500'
                    : isDark
                      ? 'bg-zinc-800'
                      : 'bg-white'
                }`}
              >
                <RefreshCw
                  size={20}
                  color={programType === 'continuous' ? '#ffffff' : isDark ? '#a1a1aa' : '#71717a'}
                />
                <View className="flex-1">
                  <Text
                    className={`font-medium ${
                      programType === 'continuous' ? 'text-white' : isDark ? 'text-white' : 'text-zinc-900'
                    }`}
                  >
                    Continuous
                  </Text>
                  <Text
                    className={`text-xs ${
                      programType === 'continuous'
                        ? 'text-white/70'
                        : isDark
                          ? 'text-zinc-400'
                          : 'text-zinc-500'
                    }`}
                  >
                    Repeats forever
                  </Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setProgramType('finite')}
                className={`flex-1 p-4 rounded-xl flex-row items-center gap-3 ${
                  programType === 'finite'
                    ? 'bg-orange-500'
                    : isDark
                      ? 'bg-zinc-800'
                      : 'bg-white'
                }`}
              >
                <Target
                  size={20}
                  color={programType === 'finite' ? '#ffffff' : isDark ? '#a1a1aa' : '#71717a'}
                />
                <View className="flex-1">
                  <Text
                    className={`font-medium ${
                      programType === 'finite' ? 'text-white' : isDark ? 'text-white' : 'text-zinc-900'
                    }`}
                  >
                    Finite
                  </Text>
                  <Text
                    className={`text-xs ${
                      programType === 'finite'
                        ? 'text-white/70'
                        : isDark
                          ? 'text-zinc-400'
                          : 'text-zinc-500'
                    }`}
                  >
                    Set number of workouts
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Total Workouts (for finite) */}
          {programType === 'finite' && (
            <NumberInput
              label="Total Workouts"
              value={totalWorkouts}
              onChangeValue={setTotalWorkouts}
              min={1}
              max={365}
              step={1}
            />
          )}

          {/* Routines Section */}
          <View>
            <Text className={`text-sm font-medium mb-2 ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
              Routines (in order)
            </Text>

            {selectedRoutineIds.length === 0 ? (
              <View
                className={`rounded-xl p-6 items-center ${isDark ? 'bg-zinc-800' : 'bg-white'}`}
              >
                <Text className={`text-center mb-2 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                  No routines added yet
                </Text>
                <TouchableOpacity
                  onPress={() => setShowRoutinePicker(true)}
                  className="bg-orange-500 px-4 py-2 rounded-lg"
                >
                  <Text className="text-white font-medium">Add Routine</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View className="gap-2">
                {selectedRoutineIds.map((routineId, index) => (
                  <View
                    key={`${routineId}-${index}`}
                    className={`rounded-xl p-4 flex-row items-center justify-between ${
                      isDark ? 'bg-zinc-800' : 'bg-white'
                    }`}
                  >
                    <View className="flex-row items-center gap-3 flex-1">
                      <GripVertical size={18} color={isDark ? '#71717a' : '#a1a1aa'} />
                      <View className="flex-row items-center gap-2">
                        <View className="bg-orange-500 w-6 h-6 rounded-full items-center justify-center">
                          <Text className="text-white text-xs font-bold">{index + 1}</Text>
                        </View>
                        <Text className={`font-medium ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                          {getRoutineName(routineId)}
                        </Text>
                      </View>
                    </View>
                    <TouchableOpacity onPress={() => handleRemoveRoutine(index)}>
                      <Trash2 size={18} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                ))}
                <TouchableOpacity
                  onPress={() => setShowRoutinePicker(true)}
                  className={`rounded-xl p-4 flex-row items-center justify-center gap-2 border-2 border-dashed ${
                    isDark ? 'border-zinc-700' : 'border-zinc-300'
                  }`}
                >
                  <Plus size={20} color="#f97316" />
                  <Text className="text-orange-500 font-medium">Add Routine</Text>
                </TouchableOpacity>
              </View>
            )}

            <Text className={`text-xs mt-2 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
              Workouts will cycle through these routines in order
            </Text>
          </View>

          {/* Create Button */}
          <View className="pt-4">
            <Button
              onPress={handleCreate}
              loading={isSubmitting}
              disabled={!name.trim() || selectedRoutineIds.length === 0}
              fullWidth
              size="lg"
            >
              Create Program
            </Button>
          </View>
        </View>
      </ScrollView>

      {/* Routine Picker Modal */}
      <Modal
        visible={showRoutinePicker}
        onClose={() => setShowRoutinePicker(false)}
        title="Add Routine"
        position="bottom"
        size="lg"
      >
        <ScrollView className="max-h-96">
          {routines.length === 0 ? (
            <View className="py-8 items-center">
              <Text className={`text-center ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                No routines created yet. Go to create a routine first.
              </Text>
            </View>
          ) : (
            routines.map((routine) => (
              <TouchableOpacity
                key={routine.id}
                onPress={() => handleAddRoutine(routine.id)}
                className={`p-4 border-b ${isDark ? 'border-zinc-700' : 'border-zinc-200'}`}
              >
                <Text className={`font-medium ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                  {routine.name}
                </Text>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </Modal>
    </SafeAreaView>
  );
}
