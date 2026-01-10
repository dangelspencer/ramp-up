import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, Trash2 } from 'lucide-react-native';
import { useSettings, useExercises, useBarbells } from '@/hooks';
import { exerciseService, ExerciseWithBarbell } from '@/services/exercise.service';
import { Button, Input, NumberInput, Switch, Select, ConfirmModal } from '@/components/ui';

export default function ExerciseDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { effectiveTheme, settings } = useSettings();
  const isDark = effectiveTheme === 'dark';
  const { updateExercise, deleteExercise } = useExercises();
  const { barbells } = useBarbells();

  const [exercise, setExercise] = useState<ExerciseWithBarbell | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [name, setName] = useState('');
  const [maxWeight, setMaxWeight] = useState<number | null>(null);
  const [weightIncrement, setWeightIncrement] = useState<number | null>(null);
  const [autoProgression, setAutoProgression] = useState(true);
  const [barbellId, setBarbellId] = useState<string | null>(null);
  const [defaultRestTime, setDefaultRestTime] = useState<number | null>(null);

  useEffect(() => {
    const loadExercise = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        const data = await exerciseService.getByIdWithBarbell(id);
        if (data) {
          setExercise(data);
          setName(data.name);
          setMaxWeight(data.maxWeight);
          setWeightIncrement(data.weightIncrement);
          setAutoProgression(data.autoProgression ?? true);
          setBarbellId(data.barbellId);
          setDefaultRestTime(data.defaultRestTime ?? 90);
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to load exercise');
      } finally {
        setIsLoading(false);
      }
    };
    loadExercise();
  }, [id]);

  const barbellOptions = [
    { label: 'None (Dumbbell/Machine)', value: '' },
    ...barbells.map((b) => ({
      label: `${b.name} (${b.weight} lbs)`,
      value: b.id,
    })),
  ];

  const incrementOptions = [
    { label: '2.5 lbs', value: '2.5' },
    { label: '5 lbs', value: '5' },
    { label: '10 lbs', value: '10' },
  ];

  const handleSave = async () => {
    if (!id) return;
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter an exercise name');
      return;
    }
    if (!maxWeight || maxWeight <= 0) {
      Alert.alert('Error', 'Please enter a valid max weight');
      return;
    }

    setIsSubmitting(true);
    try {
      await updateExercise(id, {
        name: name.trim(),
        maxWeight,
        weightIncrement: weightIncrement ?? 5,
        autoProgression,
        barbellId: barbellId || null,
        defaultRestTime: defaultRestTime ?? 90,
      });
      router.back();
    } catch (error) {
      Alert.alert('Error', 'Failed to update exercise');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    try {
      await deleteExercise(id);
      setShowDeleteModal(false);
      router.back();
    } catch (error) {
      Alert.alert('Error', 'Failed to delete exercise');
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView className={`flex-1 items-center justify-center ${isDark ? 'bg-zinc-950' : 'bg-zinc-100'}`}>
        <ActivityIndicator size="large" color="#f97316" />
      </SafeAreaView>
    );
  }

  if (!exercise) {
    return (
      <SafeAreaView className={`flex-1 items-center justify-center ${isDark ? 'bg-zinc-950' : 'bg-zinc-100'}`}>
        <Text className={isDark ? 'text-white' : 'text-zinc-900'}>Exercise not found</Text>
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
          <Text className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-zinc-900'}`}>
            Edit Exercise
          </Text>
        </View>
        <TouchableOpacity onPress={() => setShowDeleteModal(true)}>
          <Trash2 size={22} color="#ef4444" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        <View className="gap-4 pb-8">
          {/* Exercise Name */}
          <Input
            label="Exercise Name"
            value={name}
            onChangeText={setName}
            placeholder="e.g., Bench Press"
          />

          {/* Max Weight */}
          <NumberInput
            label="Current Max Weight"
            value={maxWeight}
            onChangeValue={setMaxWeight}
            min={0}
            max={2000}
            step={5}
            suffix={settings.units === 'imperial' ? 'lbs' : 'kg'}
          />

          {/* Barbell Type */}
          <Select
            label="Equipment Type"
            options={barbellOptions}
            value={barbellId ?? ''}
            onValueChange={(v) => setBarbellId(v || null)}
          />

          {/* Weight Increment */}
          <View>
            <Text className={`text-sm font-medium mb-2 ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
              Weight Increment
            </Text>
            <View className="flex-row gap-2">
              {incrementOptions.map((opt) => (
                <TouchableOpacity
                  key={opt.value}
                  onPress={() => setWeightIncrement(parseFloat(opt.value))}
                  className={`flex-1 py-3 rounded-lg items-center ${
                    weightIncrement === parseFloat(opt.value)
                      ? 'bg-orange-500'
                      : isDark
                        ? 'bg-zinc-800'
                        : 'bg-white'
                  }`}
                >
                  <Text
                    className={
                      weightIncrement === parseFloat(opt.value)
                        ? 'text-white font-medium'
                        : isDark
                          ? 'text-zinc-300'
                          : 'text-zinc-700'
                    }
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Auto Progression */}
          <Switch
            label="Auto-Progression"
            description="Automatically increase max weight when you complete all sets at 100%"
            value={autoProgression}
            onValueChange={setAutoProgression}
          />

          {/* Default Rest Time */}
          <NumberInput
            label="Default Rest Time"
            value={defaultRestTime}
            onChangeValue={setDefaultRestTime}
            min={30}
            max={600}
            step={15}
            suffix="sec"
          />

          {/* Save Button */}
          <View className="pt-4">
            <Button
              onPress={handleSave}
              loading={isSubmitting}
              disabled={!name.trim() || !maxWeight}
              fullWidth
              size="lg"
            >
              Save Changes
            </Button>
          </View>
        </View>
      </ScrollView>

      {/* Delete Modal */}
      <ConfirmModal
        visible={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete Exercise?"
        message={`Are you sure you want to delete "${exercise.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
      />
    </SafeAreaView>
  );
}
