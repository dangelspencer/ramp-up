import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ChevronLeft, Dumbbell, Plus, Trash2, Check } from 'lucide-react-native';
import { useSettings, useOnboarding, useExercises, useBarbells } from '@/hooks';
import { Button, Card, Input, NumberInput, Modal, SegmentedControl, IconBox } from '@/components/ui';
import { OnboardingStackParamList } from '../../App';

type NavigationProp = NativeStackNavigationProp<OnboardingStackParamList>;

interface ExerciseTemplate {
  name: string;
  defaultMax: number;
  useBarbell: boolean;
}

const COMMON_EXERCISES: ExerciseTemplate[] = [
  { name: 'Squat', defaultMax: 135, useBarbell: true },
  { name: 'Bench Press', defaultMax: 135, useBarbell: true },
  { name: 'Deadlift', defaultMax: 185, useBarbell: true },
  { name: 'Overhead Press', defaultMax: 65, useBarbell: true },
  { name: 'Barbell Row', defaultMax: 95, useBarbell: true },
  { name: 'Romanian Deadlift', defaultMax: 135, useBarbell: true },
];

interface NewExercise {
  name: string;
  maxWeight: number;
  barbellId: string | null;
}

export default function ExercisesSetupScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { effectiveTheme, settings } = useSettings();
  const { updateData, setStep } = useOnboarding();
  const { exercises, createExercise, isLoading: exercisesLoading } = useExercises();
  const { barbells } = useBarbells();
  const isDark = effectiveTheme === 'dark';

  const [selectedTemplates, setSelectedTemplates] = useState<string[]>([
    'Squat',
    'Bench Press',
    'Deadlift',
  ]);
  const [customExercises, setCustomExercises] = useState<NewExercise[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newExerciseName, setNewExerciseName] = useState('');
  const [newExerciseMax, setNewExerciseMax] = useState<number | null>(100);
  const [newExerciseUseBarbell, setNewExerciseUseBarbell] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const hasInitialized = useRef(false);

  // Get default barbell (Olympic)
  const defaultBarbell = barbells.find((b) => b.name === 'Olympic Barbell') || barbells[0];

  // Load existing exercises
  useEffect(() => {
    if (exercises.length > 0 && !hasInitialized.current) {
      hasInitialized.current = true;
      const existingNames = exercises.map((e) => e.name);
      // Select templates that already exist
      setSelectedTemplates(COMMON_EXERCISES.filter((t) => existingNames.includes(t.name)).map((t) => t.name));
    }
  }, [exercises]);

  const toggleTemplate = (name: string) => {
    setSelectedTemplates((prev) => {
      if (prev.includes(name)) {
        return prev.filter((n) => n !== name);
      }
      return [...prev, name];
    });
  };

  const handleAddCustom = () => {
    if (!newExerciseName.trim()) {
      Alert.alert('Error', 'Please enter an exercise name');
      return;
    }
    if (!newExerciseMax || newExerciseMax <= 0) {
      Alert.alert('Error', 'Please enter a valid max weight');
      return;
    }

    setCustomExercises((prev) => [
      ...prev,
      {
        name: newExerciseName.trim(),
        maxWeight: newExerciseMax,
        barbellId: newExerciseUseBarbell && defaultBarbell ? defaultBarbell.id : null,
      },
    ]);

    setShowAddModal(false);
    setNewExerciseName('');
    setNewExerciseMax(100);
    setNewExerciseUseBarbell(true);
  };

  const removeCustomExercise = (index: number) => {
    setCustomExercises((prev) => prev.filter((_, i) => i !== index));
  };

  const handleContinue = async () => {
    if (selectedTemplates.length === 0 && customExercises.length === 0) {
      Alert.alert('Error', 'Please add at least one exercise');
      return;
    }

    setIsSubmitting(true);
    try {
      const createdExercises: Array<{ id: string; name: string; maxWeight: number }> = [];

      // Create template exercises
      for (const templateName of selectedTemplates) {
        const template = COMMON_EXERCISES.find((t) => t.name === templateName);
        if (template) {
          // Check if already exists
          const existing = exercises.find((e) => e.name === template.name);
          if (!existing) {
            const exercise = await createExercise({
              name: template.name,
              maxWeight: template.defaultMax,
              barbellId: template.useBarbell && defaultBarbell ? defaultBarbell.id : null,
            });
            createdExercises.push({
              id: exercise.id,
              name: exercise.name,
              maxWeight: exercise.maxWeight,
            });
          } else {
            createdExercises.push({
              id: existing.id,
              name: existing.name,
              maxWeight: existing.maxWeight,
            });
          }
        }
      }

      // Create custom exercises
      for (const custom of customExercises) {
        const exercise = await createExercise({
          name: custom.name,
          maxWeight: custom.maxWeight,
          barbellId: custom.barbellId,
        });
        createdExercises.push({
          id: exercise.id,
          name: exercise.name,
          maxWeight: exercise.maxWeight,
        });
      }

      updateData({
        exercises: createdExercises.map((e) => ({
          name: e.name,
          maxWeight: e.maxWeight,
        })),
      });
      setStep('routine');
      navigation.navigate('Routine');
    } catch (error) {
      Alert.alert('Error', 'Failed to save exercises');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    setStep('plates');
    navigation.goBack();
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: isDark ? '#09090b' : '#f4f4f5' }}>
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 gap-3">
        <TouchableOpacity onPress={handleBack}>
          <ChevronLeft size={24} color={isDark ? '#ffffff' : '#18181b'} />
        </TouchableOpacity>
        <Text className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-zinc-900'}`}>
          Your Exercises
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

      <ScrollView
        className="flex-1 px-6"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        <View className="items-center mb-10">
          <IconBox size="xl" variant="primary-muted" rounded="full" className="mb-4">
            <Dumbbell size={32} color="#f97316" />
          </IconBox>
          <Text className={`text-center ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
            Select exercises you want to track. You can set your current max weight for
            percentage-based training.
          </Text>
        </View>

        {/* Common Exercises */}
        <Text className={`text-sm font-medium mt-4 mb-3 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
          Common Exercises
        </Text>
        <View className="gap-2 mb-6">
          {COMMON_EXERCISES.map((template) => {
            const isSelected = selectedTemplates.includes(template.name);
            return (
              <TouchableOpacity
                key={template.name}
                onPress={() => toggleTemplate(template.name)}
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
                    <Dumbbell size={20} color={isDark ? '#a1a1aa' : '#71717a'} />
                  )}
                </IconBox>
                <View className="flex-1">
                  <Text
                    className={`font-medium ${
                      isSelected ? 'text-orange-500' : isDark ? 'text-white' : 'text-zinc-900'
                    }`}
                  >
                    {template.name}
                  </Text>
                  <Text className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                    Starting max: {template.defaultMax} {settings.units === 'imperial' ? 'lbs' : 'kg'}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Custom Exercises */}
        {customExercises.length > 0 && (
          <>
            <Text className={`text-sm font-medium mb-3 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
              Custom Exercises
            </Text>
            <View className="gap-2 mb-4">
              {customExercises.map((exercise, index) => (
                <View
                  key={index}
                  className={`p-4 rounded-xl flex-row items-center ${
                    isDark ? 'bg-zinc-800' : 'bg-white'
                  }`}
                >
                  <IconBox variant="primary" className="mr-3">
                    <Dumbbell size={20} color="#ffffff" />
                  </IconBox>
                  <View className="flex-1">
                    <Text className={`font-medium ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                      {exercise.name}
                    </Text>
                    <Text className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                      Max: {exercise.maxWeight} {settings.units === 'imperial' ? 'lbs' : 'kg'}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => removeCustomExercise(index)}
                    className="p-2"
                  >
                    <Trash2 size={20} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </>
        )}

        {/* Add Custom Button */}
        <TouchableOpacity
          onPress={() => setShowAddModal(true)}
          className={`p-4 rounded-xl flex-row items-center justify-center gap-2 border border-dashed mt-4 mb-6 ${
            isDark ? 'border-zinc-700' : 'border-zinc-300'
          }`}
        >
          <Plus size={20} color="#f97316" />
          <Text className="text-orange-500 font-medium">Add Custom Exercise</Text>
        </TouchableOpacity>

        {/* Summary */}
        <Card variant="elevated" className="mt-4 mb-4">
          <View className="flex-row items-center justify-between">
            <Text className={`font-medium ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
              Total Exercises
            </Text>
            <Text className="text-xl font-bold text-orange-500">
              {selectedTemplates.length + customExercises.length}
            </Text>
          </View>
        </Card>
      </ScrollView>

      {/* Continue Button */}
      <View className="px-6 pb-6">
        <Button
          onPress={handleContinue}
          loading={isSubmitting}
          disabled={selectedTemplates.length === 0 && customExercises.length === 0}
          size="lg"
          fullWidth
        >
          Continue
        </Button>
      </View>

      {/* Add Exercise Modal */}
      <Modal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add Custom Exercise"
        position="bottom"
      >
        <View className="gap-4">
          <Input
            label="Exercise Name"
            value={newExerciseName}
            onChangeText={setNewExerciseName}
            placeholder="e.g., Front Squat"
          />
          <NumberInput
            label="Current Max Weight"
            value={newExerciseMax}
            onChangeValue={setNewExerciseMax}
            min={5}
            max={1000}
            step={5}
            suffix={settings.units === 'imperial' ? 'lbs' : 'kg'}
            isDark={isDark}
          />
          <View>
            <Text className={`text-sm font-medium mb-2 ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
              Uses Barbell
            </Text>
            <SegmentedControl
              options={[
                { label: 'Yes', value: 'yes' },
                { label: 'No', value: 'no' },
              ]}
              value={newExerciseUseBarbell ? 'yes' : 'no'}
              onValueChange={(value) => setNewExerciseUseBarbell(value === 'yes')}
              isDark={isDark}
            />
          </View>
          <Button onPress={handleAddCustom} fullWidth>
            Add Exercise
          </Button>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
