import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { useSettings, useExercises, useBarbells } from '@/hooks';
import { Button, Input, NumberInput, Switch, Select } from '@/components/ui';

export default function CreateExerciseScreen() {
  const router = useRouter();
  const { effectiveTheme, settings } = useSettings();
  const isDark = effectiveTheme === 'dark';
  const { createExercise } = useExercises();
  const { barbells } = useBarbells();

  const [name, setName] = useState('');
  const [maxWeight, setMaxWeight] = useState<number | null>(135);
  const [weightIncrement, setWeightIncrement] = useState<number | null>(5);
  const [autoProgression, setAutoProgression] = useState(true);
  const [barbellId, setBarbellId] = useState<string | null>(null);
  const [defaultRestTime, setDefaultRestTime] = useState<number | null>(90);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleCreate = async () => {
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
      await createExercise({
        name: name.trim(),
        maxWeight,
        weightIncrement: weightIncrement ?? 5,
        autoProgression,
        barbellId: barbellId || null,
        defaultRestTime: defaultRestTime ?? 90,
      });
      router.back();
    } catch (error) {
      Alert.alert('Error', 'Failed to create exercise');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView className={`flex-1 ${isDark ? 'bg-zinc-950' : 'bg-zinc-100'}`}>
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 gap-3">
        <TouchableOpacity onPress={() => router.back()}>
          <ChevronLeft size={24} color={isDark ? '#ffffff' : '#18181b'} />
        </TouchableOpacity>
        <Text className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-zinc-900'}`}>
          New Exercise
        </Text>
      </View>

      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        <View className="gap-4 pb-8">
          {/* Exercise Name */}
          <Input
            label="Exercise Name"
            value={name}
            onChangeText={setName}
            placeholder="e.g., Bench Press"
            autoFocus
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

          {/* Create Button */}
          <View className="pt-4">
            <Button
              onPress={handleCreate}
              loading={isSubmitting}
              disabled={!name.trim() || !maxWeight}
              fullWidth
              size="lg"
            >
              Create Exercise
            </Button>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
