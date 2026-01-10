import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft, Dumbbell, Check, Plus, Trash2 } from 'lucide-react-native';
import { useSettings, useOnboarding, useExercises, useBarbells } from '@/hooks';
import { Button, Card, Input, NumberInput, Modal, Select } from '@/components/ui';

interface ExercisePreset {
  name: string;
  category: string;
  suggestedMax: number;
  usesBarbell: boolean;
}

const EXERCISE_PRESETS: ExercisePreset[] = [
  { name: 'Squat', category: 'Legs', suggestedMax: 135, usesBarbell: true },
  { name: 'Bench Press', category: 'Chest', suggestedMax: 135, usesBarbell: true },
  { name: 'Deadlift', category: 'Back', suggestedMax: 185, usesBarbell: true },
  { name: 'Overhead Press', category: 'Shoulders', suggestedMax: 95, usesBarbell: true },
  { name: 'Barbell Row', category: 'Back', suggestedMax: 135, usesBarbell: true },
  { name: 'Front Squat', category: 'Legs', suggestedMax: 115, usesBarbell: true },
  { name: 'Romanian Deadlift', category: 'Legs', suggestedMax: 135, usesBarbell: true },
  { name: 'Incline Bench Press', category: 'Chest', suggestedMax: 115, usesBarbell: true },
];

interface PendingExercise {
  name: string;
  maxWeight: number;
  barbellId?: string;
}

export default function ExercisesScreen() {
  const router = useRouter();
  const { effectiveTheme, settings } = useSettings();
  const { setStep, updateData } = useOnboarding();
  const { exercises, createExercise } = useExercises();
  const { barbells, getDefault } = useBarbells();
  const isDark = effectiveTheme === 'dark';

  const [pendingExercises, setPendingExercises] = useState<PendingExercise[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<ExercisePreset | null>(null);
  const [customName, setCustomName] = useState('');
  const [customMax, setCustomMax] = useState<number | null>(135);
  const [customBarbellId, setCustomBarbellId] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get default barbell
  const defaultBarbell = barbells.find((b) => b.isDefault) ?? barbells[0];

  const handleSelectPreset = (preset: ExercisePreset) => {
    setSelectedPreset(preset);
    setCustomMax(preset.suggestedMax);
    setCustomBarbellId(preset.usesBarbell ? defaultBarbell?.id : undefined);
    setShowAddModal(false);
    setShowCustomModal(true);
  };

  const handleAddPreset = () => {
    if (!selectedPreset || !customMax) return;

    const newExercise: PendingExercise = {
      name: selectedPreset.name,
      maxWeight: customMax,
      barbellId: customBarbellId,
    };

    setPendingExercises((prev) => [...prev, newExercise]);
    setShowCustomModal(false);
    setSelectedPreset(null);
    setCustomMax(135);
    setCustomBarbellId(defaultBarbell?.id);
  };

  const handleAddCustom = () => {
    if (!customName.trim() || !customMax) {
      Alert.alert('Error', 'Please enter a name and max weight');
      return;
    }

    const newExercise: PendingExercise = {
      name: customName.trim(),
      maxWeight: customMax,
      barbellId: customBarbellId,
    };

    setPendingExercises((prev) => [...prev, newExercise]);
    setShowCustomModal(false);
    setCustomName('');
    setCustomMax(135);
    setCustomBarbellId(defaultBarbell?.id);
  };

  const handleRemoveExercise = (index: number) => {
    setPendingExercises((prev) => prev.filter((_, i) => i !== index));
  };

  const handleContinue = async () => {
    if (pendingExercises.length === 0) {
      Alert.alert('Add Exercises', 'Please add at least one exercise before continuing.');
      return;
    }

    setIsSubmitting(true);
    try {
      const createdIds: string[] = [];
      for (const exercise of pendingExercises) {
        const created = await createExercise({
          name: exercise.name,
          maxWeight: exercise.maxWeight,
          barbellId: exercise.barbellId,
          autoProgression: true,
          weightIncrement: 5,
        });
        createdIds.push(created.id);
      }

      updateData({
        exercises: pendingExercises.map((e) => ({
          name: e.name,
          maxWeight: e.maxWeight,
          barbellId: e.barbellId,
        })),
      });

      setStep('routine');
      router.push('/onboarding/routine');
    } catch (error) {
      Alert.alert('Error', 'Failed to create exercises');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    setStep('plates');
    router.back();
  };

  const existingExerciseNames = [
    ...exercises.map((e) => e.name),
    ...pendingExercises.map((e) => e.name),
  ];

  const availablePresets = EXERCISE_PRESETS.filter(
    (p) => !existingExerciseNames.includes(p.name)
  );

  return (
    <SafeAreaView className={`flex-1 ${isDark ? 'bg-zinc-950' : 'bg-zinc-100'}`}>
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 gap-3">
        <TouchableOpacity onPress={handleBack}>
          <ChevronLeft size={24} color={isDark ? '#ffffff' : '#18181b'} />
        </TouchableOpacity>
        <Text className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-zinc-900'}`}>
          Add Exercises
        </Text>
      </View>

      {/* Progress indicator */}
      <View className="px-6 mb-6">
        <View className={`h-1 rounded-full ${isDark ? 'bg-zinc-800' : 'bg-zinc-200'}`}>
          <View className="h-1 rounded-full bg-orange-500 w-[50%]" />
        </View>
        <Text className={`text-sm mt-2 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
          Step 5 of 10
        </Text>
      </View>

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        <View className="items-center mb-6">
          <View className="w-16 h-16 bg-orange-500/20 rounded-full items-center justify-center mb-4">
            <Dumbbell size={32} color="#f97316" />
          </View>
          <Text className={`text-center ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
            Add the exercises you'll be training. Enter your current 1-rep max for percentage-based
            programming.
          </Text>
        </View>

        {/* Added Exercises */}
        {pendingExercises.length > 0 && (
          <View className="mb-4">
            <Text className={`text-sm font-medium mb-2 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
              Your Exercises ({pendingExercises.length})
            </Text>
            <View className="gap-2">
              {pendingExercises.map((exercise, index) => {
                const barbell = barbells.find((b) => b.id === exercise.barbellId);
                return (
                  <View
                    key={index}
                    className={`p-4 rounded-xl flex-row items-center ${
                      isDark ? 'bg-zinc-800' : 'bg-white'
                    }`}
                  >
                    <View className="w-10 h-10 bg-orange-500/20 rounded-lg items-center justify-center mr-3">
                      <Check size={20} color="#f97316" />
                    </View>
                    <View className="flex-1">
                      <Text className={`font-medium ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                        {exercise.name}
                      </Text>
                      <Text className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                        Max: {exercise.maxWeight} {settings.units === 'imperial' ? 'lbs' : 'kg'}
                        {barbell ? ` • ${barbell.name}` : ''}
                      </Text>
                    </View>
                    <TouchableOpacity onPress={() => handleRemoveExercise(index)}>
                      <Trash2 size={18} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Add Exercise Button */}
        <TouchableOpacity
          onPress={() => setShowAddModal(true)}
          className={`p-4 rounded-xl flex-row items-center justify-center gap-2 border border-dashed mb-6 ${
            isDark ? 'border-zinc-700' : 'border-zinc-300'
          }`}
        >
          <Plus size={20} color="#f97316" />
          <Text className="text-orange-500 font-medium">Add Exercise</Text>
        </TouchableOpacity>

        {/* Info */}
        <View className={`p-3 rounded-lg mb-6 ${isDark ? 'bg-zinc-800/50' : 'bg-zinc-200/50'}`}>
          <Text className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
            Don't know your max? Enter a conservative estimate. You can always adjust it later as
            you train.
          </Text>
        </View>
      </ScrollView>

      {/* Continue Button */}
      <View className="px-6 pb-6">
        <Button
          onPress={handleContinue}
          loading={isSubmitting}
          disabled={pendingExercises.length === 0}
          size="lg"
          fullWidth
        >
          Continue ({pendingExercises.length} exercise{pendingExercises.length !== 1 ? 's' : ''})
        </Button>
      </View>

      {/* Add Exercise Modal */}
      <Modal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add Exercise"
        position="bottom"
      >
        <ScrollView style={{ maxHeight: 400 }}>
          {availablePresets.length > 0 && (
            <>
              <Text className={`text-sm font-medium mb-2 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                Popular Exercises
              </Text>
              <View className="gap-2 mb-4">
                {availablePresets.map((preset) => (
                  <TouchableOpacity
                    key={preset.name}
                    onPress={() => handleSelectPreset(preset)}
                    className={`p-3 rounded-lg flex-row items-center ${
                      isDark ? 'bg-zinc-700' : 'bg-zinc-100'
                    }`}
                  >
                    <View className="flex-1">
                      <Text className={`font-medium ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                        {preset.name}
                      </Text>
                      <Text className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                        {preset.category}
                      </Text>
                    </View>
                    <Plus size={18} color="#f97316" />
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          <TouchableOpacity
            onPress={() => {
              setShowAddModal(false);
              setSelectedPreset(null);
              setCustomName('');
              setCustomMax(135);
              setCustomBarbellId(defaultBarbell?.id);
              setShowCustomModal(true);
            }}
            className={`p-3 rounded-lg flex-row items-center justify-center gap-2 ${
              isDark ? 'bg-zinc-700' : 'bg-zinc-100'
            }`}
          >
            <Plus size={18} color="#f97316" />
            <Text className="text-orange-500 font-medium">Create Custom Exercise</Text>
          </TouchableOpacity>
        </ScrollView>
      </Modal>

      {/* Configure Exercise Modal */}
      <Modal
        visible={showCustomModal}
        onClose={() => setShowCustomModal(false)}
        title={selectedPreset ? `Add ${selectedPreset.name}` : 'Custom Exercise'}
        position="bottom"
      >
        <View className="gap-4">
          {!selectedPreset && (
            <Input
              label="Exercise Name"
              value={customName}
              onChangeText={setCustomName}
              placeholder="e.g., Romanian Deadlift"
            />
          )}

          <NumberInput
            label={`Current 1-Rep Max (${settings.units === 'imperial' ? 'lbs' : 'kg'})`}
            value={customMax}
            onChangeValue={setCustomMax}
            min={0}
            max={1000}
            step={5}
            suffix={settings.units === 'imperial' ? 'lbs' : 'kg'}
          />

          {barbells.length > 0 && (
            <Select
              label="Barbell (optional)"
              value={customBarbellId ?? ''}
              onValueChange={(value) => setCustomBarbellId(value || undefined)}
              options={[
                { label: 'No barbell', value: '' },
                ...barbells.map((b) => ({
                  label: `${b.name} (${b.weight} ${settings.units === 'imperial' ? 'lbs' : 'kg'})`,
                  value: b.id,
                })),
              ]}
            />
          )}

          <Button
            onPress={selectedPreset ? handleAddPreset : handleAddCustom}
            fullWidth
          >
            Add Exercise
          </Button>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
