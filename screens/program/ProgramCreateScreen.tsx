import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ChevronLeft, Check, Plus, X, GripVertical } from 'lucide-react-native';

import { useSettings, usePrograms, useRoutines } from '@/hooks';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input, NumberInput } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { SegmentedControl } from '@/components/ui/Select';
import { RootStackParamList } from '../../App';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function ProgramCreateScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { effectiveTheme } = useSettings();
  const isDark = effectiveTheme === 'dark';

  const { createProgram, setActive } = usePrograms();
  const { routines } = useRoutines();

  const [name, setName] = useState('');
  const [type, setType] = useState<'continuous' | 'finite'>('continuous');
  const [totalWorkouts, setTotalWorkouts] = useState<number | null>(12);
  const [selectedRoutineIds, setSelectedRoutineIds] = useState<string[]>([]);
  const [isRoutineModalOpen, setIsRoutineModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; routines?: string }>({});

  const handleBack = () => {
    navigation.goBack();
  };

  const validateForm = (): boolean => {
    const newErrors: { name?: string; routines?: string } = {};

    if (!name.trim()) {
      newErrors.name = 'Program name is required';
    }

    if (selectedRoutineIds.length === 0) {
      newErrors.routines = 'Select at least one routine';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setIsSaving(true);
      const program = await createProgram(
        name.trim(),
        type,
        selectedRoutineIds,
        type === 'finite' ? totalWorkouts ?? undefined : undefined
      );

      // Optionally set as active
      Alert.alert(
        'Program Created',
        'Would you like to set this as your active program?',
        [
          {
            text: 'No',
            style: 'cancel',
            onPress: () => navigation.goBack(),
          },
          {
            text: 'Yes',
            onPress: async () => {
              await setActive(program.id);
              navigation.goBack();
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to create program. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddRoutine = (routineId: string) => {
    if (!selectedRoutineIds.includes(routineId)) {
      setSelectedRoutineIds([...selectedRoutineIds, routineId]);
      setErrors((prev) => ({ ...prev, routines: undefined }));
    }
    setIsRoutineModalOpen(false);
  };

  const handleRemoveRoutine = (routineId: string) => {
    setSelectedRoutineIds(selectedRoutineIds.filter((id) => id !== routineId));
  };

  const moveRoutine = (fromIndex: number, direction: 'up' | 'down') => {
    const toIndex = direction === 'up' ? fromIndex - 1 : fromIndex + 1;
    if (toIndex < 0 || toIndex >= selectedRoutineIds.length) return;

    const newIds = [...selectedRoutineIds];
    [newIds[fromIndex], newIds[toIndex]] = [newIds[toIndex], newIds[fromIndex]];
    setSelectedRoutineIds(newIds);
  };

  const getRoutineName = (id: string) => {
    return routines.find((r) => r.id === id)?.name ?? 'Unknown Routine';
  };

  const availableRoutines = routines.filter(
    (r) => !selectedRoutineIds.includes(r.id)
  );

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: isDark ? '#09090b' : '#f4f4f5' }}>
      <View className="flex-1">
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 py-4">
          <TouchableOpacity
            onPress={handleBack}
            className={`p-2 rounded-lg ${isDark ? 'bg-zinc-800' : 'bg-white'}`}
          >
            <ChevronLeft size={24} color={isDark ? '#ffffff' : '#18181b'} />
          </TouchableOpacity>
          <Text className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-zinc-900'}`}>
            Create Program
          </Text>
          <View className="w-10" />
        </View>

        <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
          {/* Program Name */}
          <View className="mb-6">
            <Input
              label="Program Name"
              value={name}
              onChangeText={(text) => {
                setName(text);
                setErrors((prev) => ({ ...prev, name: undefined }));
              }}
              placeholder="e.g., Strength Building"
              error={errors.name}
            />
          </View>

          {/* Program Type */}
          <View className="mb-6">
            <Text className={`text-sm font-medium mb-2 ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
              Program Type
            </Text>
            <SegmentedControl
              value={type}
              onValueChange={(value) => setType(value as 'continuous' | 'finite')}
              options={[
                { value: 'continuous', label: 'Continuous' },
                { value: 'finite', label: 'Finite' },
              ]}
              isDark={isDark}
            />
            <Text className={`text-sm mt-2 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
              {type === 'continuous'
                ? 'Continuous programs cycle through routines indefinitely'
                : 'Finite programs have a set number of workouts'}
            </Text>
          </View>

          {/* Total Workouts (for finite) */}
          {type === 'finite' && (
            <View className="mb-6">
              <NumberInput
                label="Total Workouts"
                value={totalWorkouts}
                onChangeValue={setTotalWorkouts}
                min={1}
                max={365}
                placeholder="12"
                hint="Number of workouts to complete this program"
              />
            </View>
          )}

          {/* Routines */}
          <View className="mb-6">
            <View className="flex-row items-center justify-between mb-2">
              <Text className={`text-sm font-medium ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
                Routines
              </Text>
              <TouchableOpacity
                onPress={() => setIsRoutineModalOpen(true)}
                className="flex-row items-center"
              >
                <Plus size={16} color="#f97316" />
                <Text className="text-orange-500 font-medium ml-1">Add</Text>
              </TouchableOpacity>
            </View>

            {errors.routines && (
              <Text className="text-red-500 text-sm mb-2">{errors.routines}</Text>
            )}

            {selectedRoutineIds.length === 0 ? (
              <Card>
                <View className="items-center py-6">
                  <Text className={`${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                    No routines added yet
                  </Text>
                  <Text className={`text-sm ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                    Tap "Add" to select routines
                  </Text>
                </View>
              </Card>
            ) : (
              <View className="gap-2">
                {selectedRoutineIds.map((id, index) => (
                  <Card key={id}>
                    <View className="flex-row items-center">
                      <View className="flex-row items-center mr-2">
                        <TouchableOpacity
                          onPress={() => moveRoutine(index, 'up')}
                          disabled={index === 0}
                          className={`p-1 ${index === 0 ? 'opacity-30' : ''}`}
                        >
                          <GripVertical size={20} color={isDark ? '#71717a' : '#a1a1aa'} />
                        </TouchableOpacity>
                      </View>
                      <View className="flex-1">
                        <Text className={`font-medium ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                          {getRoutineName(id)}
                        </Text>
                        <Text className={`text-sm ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                          Position {index + 1}
                        </Text>
                      </View>
                      <View className="flex-row items-center gap-2">
                        <TouchableOpacity
                          onPress={() => moveRoutine(index, 'up')}
                          disabled={index === 0}
                          className={`p-2 rounded-lg ${isDark ? 'bg-zinc-700' : 'bg-zinc-200'} ${index === 0 ? 'opacity-30' : ''}`}
                        >
                          <Text className={isDark ? 'text-white' : 'text-zinc-900'}>Up</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => moveRoutine(index, 'down')}
                          disabled={index === selectedRoutineIds.length - 1}
                          className={`p-2 rounded-lg ${isDark ? 'bg-zinc-700' : 'bg-zinc-200'} ${index === selectedRoutineIds.length - 1 ? 'opacity-30' : ''}`}
                        >
                          <Text className={isDark ? 'text-white' : 'text-zinc-900'}>Down</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => handleRemoveRoutine(id)}
                          style={{
                            padding: 8,
                            borderRadius: 8,
                            backgroundColor: isDark ? 'rgba(127, 29, 29, 0.3)' : '#fee2e2',
                          }}
                        >
                          <X size={18} color="#ef4444" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </Card>
                ))}
              </View>
            )}

            <Text className={`text-sm mt-2 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
              The order of routines determines the workout rotation
            </Text>
          </View>

          {/* Spacer */}
          <View className="h-24" />
        </ScrollView>

        {/* Save Button */}
        <View className={`px-4 py-4 ${isDark ? 'bg-zinc-950' : 'bg-zinc-100'}`}>
          <Button
            onPress={handleSave}
            loading={isSaving}
            disabled={isSaving}
            fullWidth
          >
            Create Program
          </Button>
        </View>
      </View>

      {/* Routine Selection Modal */}
      <Modal
        visible={isRoutineModalOpen}
        onClose={() => setIsRoutineModalOpen(false)}
        title="Select Routine"
        position="bottom"
      >
        <ScrollView className="max-h-80">
          {availableRoutines.length === 0 ? (
            <View className="items-center py-6">
              <Text className={isDark ? 'text-zinc-400' : 'text-zinc-500'}>
                {routines.length === 0
                  ? 'No routines available. Create a routine first.'
                  : 'All routines have been added'}
              </Text>
            </View>
          ) : (
            availableRoutines.map((routine) => (
              <TouchableOpacity
                key={routine.id}
                onPress={() => handleAddRoutine(routine.id)}
                className={`flex-row items-center justify-between py-3 px-2 border-b ${
                  isDark ? 'border-zinc-800' : 'border-zinc-100'
                }`}
              >
                <Text className={`font-medium ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                  {routine.name}
                </Text>
                <Plus size={20} color="#f97316" />
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </Modal>
    </SafeAreaView>
  );
}
