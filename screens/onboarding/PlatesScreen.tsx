import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ChevronLeft, Circle, Plus, Minus } from 'lucide-react-native';
import { useSettings, useOnboarding, usePlateInventory } from '@/hooks';
import { Button, Card, IconBox } from '@/components/ui';
import { OnboardingStackParamList } from '../../App';

type NavigationProp = NativeStackNavigationProp<OnboardingStackParamList>;

interface PlateOption {
  weight: number;
  color: string;
  description: string;
}

const PLATE_OPTIONS: PlateOption[] = [
  { weight: 45, color: '#ef4444', description: 'Red - Competition' },
  { weight: 35, color: '#eab308', description: 'Yellow - Competition' },
  { weight: 25, color: '#22c55e', description: 'Green - Competition' },
  { weight: 10, color: '#3b82f6', description: 'Blue - Standard' },
  { weight: 5, color: '#a1a1aa', description: 'Gray - Standard' },
  { weight: 2.5, color: '#71717a', description: 'Small - Standard' },
];

export default function PlatesScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { effectiveTheme, settings } = useSettings();
  const { updateData, setStep } = useOnboarding();
  const { plates, setPlateCount } = usePlateInventory();
  const isDark = effectiveTheme === 'dark';

  const [plateCounts, setPlateCounts] = useState<Record<number, number>>({
    45: 4,
    35: 0,
    25: 2,
    10: 2,
    5: 2,
    2.5: 2,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const hasInitialized = useRef(false);

  // Load existing plate counts
  useEffect(() => {
    if (plates.length > 0 && !hasInitialized.current) {
      hasInitialized.current = true;
      const existingCounts: Record<number, number> = {};
      plates.forEach((plate) => {
        existingCounts[plate.weight] = plate.count;
      });
      // Merge with defaults, preferring existing
      setPlateCounts((prev) => ({
        ...prev,
        ...existingCounts,
      }));
    }
  }, [plates]);

  const incrementCount = (weight: number) => {
    setPlateCounts((prev) => ({
      ...prev,
      [weight]: (prev[weight] || 0) + 2, // Plates come in pairs
    }));
  };

  const decrementCount = (weight: number) => {
    setPlateCounts((prev) => ({
      ...prev,
      [weight]: Math.max(0, (prev[weight] || 0) - 2),
    }));
  };

  const handleContinue = async () => {
    setIsSubmitting(true);
    try {
      // Save plate inventory to database
      for (const [weightStr, count] of Object.entries(plateCounts)) {
        const weight = parseFloat(weightStr);
        await setPlateCount(weight, count);
      }

      // Update onboarding data
      const plateInventory = Object.entries(plateCounts).map(([weight, count]) => ({
        weight: parseFloat(weight),
        count,
      }));
      updateData({ plateInventory });
      setStep('exercises');
      navigation.navigate('Exercises');
    } catch (_error) {
      Alert.alert('Error', 'Failed to save plate inventory');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    setStep('barbells');
    navigation.goBack();
  };

  const getTotalWeight = () => {
    return Object.entries(plateCounts).reduce((total, [weight, count]) => {
      return total + parseFloat(weight) * count;
    }, 0);
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: isDark ? '#09090b' : '#f4f4f5' }}>
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 gap-3">
        <TouchableOpacity onPress={handleBack}>
          <ChevronLeft size={24} color={isDark ? '#ffffff' : '#18181b'} />
        </TouchableOpacity>
        <Text className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-zinc-900'}`}>
          Your Plates
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
        <View className="items-center mb-10">
          <IconBox size="xl" variant="primary-muted" rounded="full" className="mb-4">
            <Circle size={32} color="#f97316" />
          </IconBox>
          <Text className={`text-center ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
            How many of each plate weight do you have? This helps calculate plate loading for
            your lifts.
          </Text>
        </View>

        {/* Plate Options */}
        <View className="gap-3 mt-4 mb-6">
          {PLATE_OPTIONS.map((plate) => {
            const count = plateCounts[plate.weight] || 0;
            return (
              <Card key={plate.weight} variant="elevated">
                <View className="flex-row items-center">
                  {/* Plate color indicator */}
                  <View
                    className="w-12 h-12 rounded-lg items-center justify-center mr-4"
                    style={{ backgroundColor: plate.color + '30' }}
                  >
                    <View
                      className="w-8 h-8 rounded-full"
                      style={{ backgroundColor: plate.color }}
                    />
                  </View>

                  {/* Plate info */}
                  <View className="flex-1">
                    <Text className={`font-semibold ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                      {plate.weight} {settings.units === 'imperial' ? 'lbs' : 'kg'}
                    </Text>
                    <Text className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                      {plate.description}
                    </Text>
                  </View>

                  {/* Counter */}
                  <View className="flex-row items-center gap-3">
                    <TouchableOpacity
                      onPress={() => decrementCount(plate.weight)}
                      className={`w-10 h-10 rounded-lg items-center justify-center ${
                        isDark ? 'bg-zinc-800' : 'bg-zinc-100'
                      }`}
                      disabled={count === 0}
                    >
                      <Minus size={20} color={count === 0 ? '#71717a' : '#f97316'} />
                    </TouchableOpacity>
                    <Text
                      className={`w-8 text-center text-lg font-semibold ${
                        isDark ? 'text-white' : 'text-zinc-900'
                      }`}
                    >
                      {count}
                    </Text>
                    <TouchableOpacity
                      onPress={() => incrementCount(plate.weight)}
                      className={`w-10 h-10 rounded-lg items-center justify-center ${
                        isDark ? 'bg-zinc-800' : 'bg-zinc-100'
                      }`}
                    >
                      <Plus size={20} color="#f97316" />
                    </TouchableOpacity>
                  </View>
                </View>
              </Card>
            );
          })}
        </View>

        {/* Total Weight Summary */}
        <Card variant="elevated" className="mt-4 mb-6">
          <View className="flex-row items-center justify-between">
            <Text className={`font-medium ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
              Total Plate Weight
            </Text>
            <Text className={`text-xl font-bold text-orange-500`}>
              {getTotalWeight()} {settings.units === 'imperial' ? 'lbs' : 'kg'}
            </Text>
          </View>
        </Card>

        {/* Tips */}
        <View className={`p-4 rounded-xl mb-10 ${isDark ? 'bg-zinc-800/50' : 'bg-zinc-200/50'}`}>
          <Text className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
            Tip: Enter the total count of each plate (both sides combined). For example, if you
            have 2 plates of 45 lbs on each side, enter 4.
          </Text>
        </View>
      </ScrollView>

      {/* Continue Button */}
      <View className="px-6 pb-6">
        <Button onPress={handleContinue} loading={isSubmitting} size="lg" fullWidth>
          Continue
        </Button>
      </View>
    </SafeAreaView>
  );
}
