import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft, CircleDot, Plus, Minus, Check } from 'lucide-react-native';
import { useSettings, useOnboarding, usePlateInventory } from '@/hooks';
import { Button } from '@/components/ui';

const DEFAULT_PLATES = [
  { weight: 45, color: '#ef4444' },
  { weight: 35, color: '#f59e0b' },
  { weight: 25, color: '#22c55e' },
  { weight: 10, color: '#3b82f6' },
  { weight: 5, color: '#a855f7' },
  { weight: 2.5, color: '#ec4899' },
];

export default function PlatesScreen() {
  const router = useRouter();
  const { effectiveTheme, settings } = useSettings();
  const { setStep } = useOnboarding();
  const { plates, setPlateCount, resetToDefaults } = usePlateInventory();
  const isDark = effectiveTheme === 'dark';

  const [localPlates, setLocalPlates] = useState<{ weight: number; count: number }[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (plates.length > 0) {
      setLocalPlates(
        DEFAULT_PLATES.map((dp) => {
          const existing = plates.find((p) => p.weight === dp.weight);
          return { weight: dp.weight, count: existing?.count ?? 4 };
        })
      );
    } else {
      // Initialize with default counts
      setLocalPlates(DEFAULT_PLATES.map((dp) => ({ weight: dp.weight, count: 4 })));
    }
  }, [plates]);

  const updateCount = (weight: number, delta: number) => {
    setLocalPlates((prev) =>
      prev.map((p) => {
        if (p.weight === weight) {
          const newCount = Math.max(0, Math.min(20, p.count + delta));
          return { ...p, count: newCount };
        }
        return p;
      })
    );
    setHasChanges(true);
  };

  const handleUseDefaults = async () => {
    setIsSubmitting(true);
    try {
      await resetToDefaults();
      setLocalPlates(DEFAULT_PLATES.map((dp) => ({ weight: dp.weight, count: 4 })));
      setHasChanges(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to reset plates');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContinue = async () => {
    setIsSubmitting(true);
    try {
      // Save plate counts
      for (const plate of localPlates) {
        await setPlateCount(plate.weight, plate.count);
      }

      setStep('exercises');
      router.push('/onboarding/exercises');
    } catch (error) {
      Alert.alert('Error', 'Failed to save plates');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    setStep('exercises');
    router.push('/onboarding/exercises');
  };

  const handleBack = () => {
    setStep('barbells');
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
          Plate Inventory
        </Text>
      </View>

      {/* Progress indicator */}
      <View className="px-6 mb-6">
        <View className={`h-1 rounded-full ${isDark ? 'bg-zinc-800' : 'bg-zinc-200'}`}>
          <View className="h-1 rounded-full bg-orange-500 w-[40%]" />
        </View>
        <Text className={`text-sm mt-2 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
          Step 4 of 10
        </Text>
      </View>

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        <View className="items-center mb-6">
          <View className="w-16 h-16 bg-orange-500/20 rounded-full items-center justify-center mb-4">
            <CircleDot size={32} color="#f97316" />
          </View>
          <Text className={`text-center ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
            Set how many of each plate you have. The plate calculator uses this to help you load
            the bar.
          </Text>
        </View>

        {/* Quick Actions */}
        <TouchableOpacity
          onPress={handleUseDefaults}
          className={`p-3 rounded-lg mb-4 flex-row items-center justify-center gap-2 ${
            isDark ? 'bg-zinc-800' : 'bg-white'
          }`}
        >
          <Check size={16} color="#f97316" />
          <Text className="text-orange-500 font-medium">Use Default Set (4 of each)</Text>
        </TouchableOpacity>

        {/* Plate List */}
        <View className="gap-2 mb-6">
          {localPlates.map((plate) => {
            const plateInfo = DEFAULT_PLATES.find((dp) => dp.weight === plate.weight);
            return (
              <View
                key={plate.weight}
                className={`p-4 rounded-xl flex-row items-center ${isDark ? 'bg-zinc-800' : 'bg-white'}`}
              >
                {/* Plate visualization */}
                <View
                  className="w-12 h-12 rounded-lg items-center justify-center mr-3"
                  style={{ backgroundColor: plateInfo?.color || '#71717a' }}
                >
                  <Text className="text-white text-xs font-bold">{plate.weight}</Text>
                </View>

                {/* Weight label */}
                <View className="flex-1">
                  <Text className={`font-medium ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                    {plate.weight} {settings.units === 'imperial' ? 'lbs' : 'kg'}
                  </Text>
                  <Text className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                    {plate.count} plate{plate.count !== 1 ? 's' : ''} ({plate.count / 2} pair
                    {plate.count !== 2 ? 's' : ''})
                  </Text>
                </View>

                {/* Count controls */}
                <View className="flex-row items-center gap-2">
                  <TouchableOpacity
                    onPress={() => updateCount(plate.weight, -2)}
                    className={`w-10 h-10 rounded-full items-center justify-center ${
                      plate.count <= 0
                        ? isDark
                          ? 'bg-zinc-700'
                          : 'bg-zinc-100'
                        : 'bg-orange-500/20'
                    }`}
                    disabled={plate.count <= 0}
                  >
                    <Minus
                      size={18}
                      color={plate.count <= 0 ? (isDark ? '#71717a' : '#a1a1aa') : '#f97316'}
                    />
                  </TouchableOpacity>
                  <Text
                    className={`w-8 text-center font-semibold text-lg ${
                      isDark ? 'text-white' : 'text-zinc-900'
                    }`}
                  >
                    {plate.count}
                  </Text>
                  <TouchableOpacity
                    onPress={() => updateCount(plate.weight, 2)}
                    className="w-10 h-10 rounded-full items-center justify-center bg-orange-500/20"
                    disabled={plate.count >= 20}
                  >
                    <Plus size={18} color="#f97316" />
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>

        {/* Info */}
        <View className={`p-3 rounded-lg mb-6 ${isDark ? 'bg-zinc-800/50' : 'bg-zinc-200/50'}`}>
          <Text className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
            Enter the total number of plates (not pairs). You can always adjust this later in
            Settings.
          </Text>
        </View>
      </ScrollView>

      {/* Buttons */}
      <View className="px-6 pb-6 gap-3">
        <Button onPress={handleContinue} loading={isSubmitting} size="lg" fullWidth>
          Continue
        </Button>
        <Button onPress={handleSkip} variant="ghost" size="lg" fullWidth>
          Skip for Now
        </Button>
      </View>
    </SafeAreaView>
  );
}
