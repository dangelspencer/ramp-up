import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft, Dumbbell, Check, Plus } from 'lucide-react-native';
import { useSettings, useOnboarding, useBarbells } from '@/hooks';
import { Button, Card, NumberInput, Modal, Input } from '@/components/ui';

interface BarbellPreset {
  name: string;
  weight: number;
  description: string;
}

const BARBELL_PRESETS: BarbellPreset[] = [
  { name: 'Olympic Barbell', weight: 45, description: 'Standard 7ft/20kg bar' },
  { name: 'EZ Curl Bar', weight: 25, description: 'Curved bar for curls' },
  { name: 'Trap Bar', weight: 55, description: 'Hexagonal deadlift bar' },
  { name: 'Safety Squat Bar', weight: 65, description: 'Bar with handles' },
  { name: "Women's Olympic Bar", weight: 35, description: '6.5ft/15kg bar' },
];

export default function BarbellsScreen() {
  const router = useRouter();
  const { effectiveTheme, settings } = useSettings();
  const { updateData, setStep } = useOnboarding();
  const { barbells, createBarbell, setDefault } = useBarbells();
  const isDark = effectiveTheme === 'dark';

  const [selectedPresets, setSelectedPresets] = useState<string[]>(['Olympic Barbell']);
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customWeight, setCustomWeight] = useState<number | null>(45);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if barbells already exist
  useEffect(() => {
    if (barbells.length > 0) {
      const existingNames = barbells.map((b) => b.name);
      setSelectedPresets(
        BARBELL_PRESETS.filter((p) => existingNames.includes(p.name)).map((p) => p.name)
      );
    }
  }, [barbells]);

  const togglePreset = (presetName: string) => {
    setSelectedPresets((prev) => {
      if (prev.includes(presetName)) {
        return prev.filter((p) => p !== presetName);
      }
      return [...prev, presetName];
    });
  };

  const handleAddCustom = async () => {
    if (!customName.trim()) {
      Alert.alert('Error', 'Please enter a name for the barbell');
      return;
    }
    if (!customWeight || customWeight <= 0) {
      Alert.alert('Error', 'Please enter a valid weight');
      return;
    }

    setIsSubmitting(true);
    try {
      await createBarbell({ name: customName.trim(), weight: customWeight });
      setShowCustomModal(false);
      setCustomName('');
      setCustomWeight(45);
    } catch (error) {
      Alert.alert('Error', 'Failed to add barbell');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContinue = async () => {
    setIsSubmitting(true);
    try {
      // Create selected preset barbells that don't exist yet
      const existingNames = barbells.map((b) => b.name);
      for (const presetName of selectedPresets) {
        if (!existingNames.includes(presetName)) {
          const preset = BARBELL_PRESETS.find((p) => p.name === presetName);
          if (preset) {
            const newBarbell = await createBarbell({ name: preset.name, weight: preset.weight });
            // Set Olympic Barbell as default
            if (preset.name === 'Olympic Barbell') {
              await setDefault(newBarbell.id);
            }
          }
        }
      }

      updateData({ selectedBarbells: selectedPresets });
      setStep('plates');
      router.push('/onboarding/plates');
    } catch (error) {
      Alert.alert('Error', 'Failed to save barbells');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    setStep('health');
    router.back();
  };

  return (
    <SafeAreaView className={`flex-1 ${isDark ? 'bg-zinc-950' : 'bg-zinc-100'}`}>
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 gap-3">
        <TouchableOpacity onPress={handleBack}>
          <ChevronLeft size={24} color={isDark ? '#ffffff' : '#18181b'} />
        </TouchableOpacity>
        <Text className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-zinc-900'}`}>
          Your Barbells
        </Text>
      </View>

      {/* Progress indicator */}
      <View className="px-6 mb-6">
        <View className={`h-1 rounded-full ${isDark ? 'bg-zinc-800' : 'bg-zinc-200'}`}>
          <View className="h-1 rounded-full bg-orange-500 w-[30%]" />
        </View>
        <Text className={`text-sm mt-2 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
          Step 3 of 10
        </Text>
      </View>

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        <View className="items-center mb-6">
          <View className="w-16 h-16 bg-orange-500/20 rounded-full items-center justify-center mb-4">
            <Dumbbell size={32} color="#f97316" />
          </View>
          <Text className={`text-center ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
            Select the barbells you have access to. This helps calculate plate loading.
          </Text>
        </View>

        {/* Presets */}
        <View className="gap-2 mb-4">
          {BARBELL_PRESETS.map((preset) => {
            const isSelected = selectedPresets.includes(preset.name);
            return (
              <TouchableOpacity
                key={preset.name}
                onPress={() => togglePreset(preset.name)}
                className={`p-4 rounded-xl flex-row items-center ${
                  isSelected
                    ? 'bg-orange-500/20 border border-orange-500'
                    : isDark
                      ? 'bg-zinc-800'
                      : 'bg-white'
                }`}
              >
                <View
                  className={`w-10 h-10 rounded-lg items-center justify-center mr-3 ${
                    isSelected ? 'bg-orange-500' : isDark ? 'bg-zinc-700' : 'bg-zinc-100'
                  }`}
                >
                  {isSelected ? (
                    <Check size={20} color="#ffffff" />
                  ) : (
                    <Dumbbell size={20} color={isDark ? '#a1a1aa' : '#71717a'} />
                  )}
                </View>
                <View className="flex-1">
                  <Text
                    className={`font-medium ${
                      isSelected
                        ? 'text-orange-500'
                        : isDark
                          ? 'text-white'
                          : 'text-zinc-900'
                    }`}
                  >
                    {preset.name}
                  </Text>
                  <Text className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                    {preset.weight} {settings.units === 'imperial' ? 'lbs' : 'kg'} -{' '}
                    {preset.description}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Custom barbells from database */}
        {barbells.filter((b) => !BARBELL_PRESETS.find((p) => p.name === b.name)).length > 0 && (
          <View className="mb-4">
            <Text className={`text-sm font-medium mb-2 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
              Custom Barbells
            </Text>
            {barbells
              .filter((b) => !BARBELL_PRESETS.find((p) => p.name === b.name))
              .map((barbell) => (
                <View
                  key={barbell.id}
                  className={`p-4 rounded-xl flex-row items-center mb-2 ${
                    isDark ? 'bg-zinc-800' : 'bg-white'
                  }`}
                >
                  <View className="w-10 h-10 bg-orange-500/20 rounded-lg items-center justify-center mr-3">
                    <Dumbbell size={20} color="#f97316" />
                  </View>
                  <View className="flex-1">
                    <Text className={`font-medium ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                      {barbell.name}
                    </Text>
                    <Text className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                      {barbell.weight} {settings.units === 'imperial' ? 'lbs' : 'kg'}
                    </Text>
                  </View>
                </View>
              ))}
          </View>
        )}

        {/* Add Custom Button */}
        <TouchableOpacity
          onPress={() => setShowCustomModal(true)}
          className={`p-4 rounded-xl flex-row items-center justify-center gap-2 border border-dashed mb-6 ${
            isDark ? 'border-zinc-700' : 'border-zinc-300'
          }`}
        >
          <Plus size={20} color="#f97316" />
          <Text className="text-orange-500 font-medium">Add Custom Barbell</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Continue Button */}
      <View className="px-6 pb-6">
        <Button
          onPress={handleContinue}
          loading={isSubmitting}
          disabled={selectedPresets.length === 0 && barbells.length === 0}
          size="lg"
          fullWidth
        >
          Continue
        </Button>
      </View>

      {/* Custom Barbell Modal */}
      <Modal
        visible={showCustomModal}
        onClose={() => setShowCustomModal(false)}
        title="Add Custom Barbell"
        position="bottom"
      >
        <View className="gap-4">
          <Input
            label="Barbell Name"
            value={customName}
            onChangeText={setCustomName}
            placeholder="e.g., Home Gym Bar"
          />
          <NumberInput
            label="Weight"
            value={customWeight}
            onChangeValue={setCustomWeight}
            min={1}
            max={100}
            step={5}
            suffix={settings.units === 'imperial' ? 'lbs' : 'kg'}
          />
          <Button onPress={handleAddCustom} loading={isSubmitting} fullWidth>
            Add Barbell
          </Button>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
