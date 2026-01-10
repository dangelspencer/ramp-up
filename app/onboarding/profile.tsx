import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft, User, Ruler, Users } from 'lucide-react-native';
import { useSettings, useOnboarding } from '@/hooks';
import { Button, Card, NumberInput, SegmentedControl } from '@/components/ui';

export default function ProfileScreen() {
  const router = useRouter();
  const { effectiveTheme, updateSettings } = useSettings();
  const { data, updateData, setStep } = useOnboarding();
  const isDark = effectiveTheme === 'dark';

  const [height, setHeight] = useState<number | null>(data.height ?? 70);
  const [gender, setGender] = useState<'male' | 'female'>(data.gender ?? 'male');
  const [units, setUnits] = useState<'imperial' | 'metric'>(data.units ?? 'imperial');

  const handleContinue = async () => {
    // Save to onboarding data
    updateData({ height: height ?? 70, gender, units });

    // Save to settings
    await updateSettings({
      height: height ?? 70,
      gender,
      units,
    });

    setStep('health');
    router.push('/onboarding/health');
  };

  const handleBack = () => {
    setStep('welcome');
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
          Profile Setup
        </Text>
      </View>

      {/* Progress indicator */}
      <View className="px-6 mb-6">
        <View className={`h-1 rounded-full ${isDark ? 'bg-zinc-800' : 'bg-zinc-200'}`}>
          <View className="h-1 rounded-full bg-orange-500 w-[10%]" />
        </View>
        <Text className={`text-sm mt-2 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
          Step 1 of 10
        </Text>
      </View>

      <View className="flex-1 px-6">
        <View className="items-center mb-8">
          <View className="w-16 h-16 bg-orange-500/20 rounded-full items-center justify-center mb-4">
            <User size={32} color="#f97316" />
          </View>
          <Text className={`text-center ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
            Let's set up your profile for accurate calculations
          </Text>
        </View>

        <View className="gap-4">
          {/* Units Selection */}
          <Card variant="elevated">
            <View className="flex-row items-center gap-2 mb-3">
              <Ruler size={18} color={isDark ? '#a1a1aa' : '#71717a'} />
              <Text className={`font-medium ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                Preferred Units
              </Text>
            </View>
            <SegmentedControl
              options={[
                { label: 'Imperial (lbs)', value: 'imperial' },
                { label: 'Metric (kg)', value: 'metric' },
              ]}
              value={units}
              onValueChange={(value) => setUnits(value as 'imperial' | 'metric')}
            />
          </Card>

          {/* Height */}
          <Card variant="elevated">
            <NumberInput
              label={`Height (${units === 'imperial' ? 'inches' : 'cm'})`}
              value={height}
              onChangeValue={setHeight}
              min={units === 'imperial' ? 48 : 120}
              max={units === 'imperial' ? 96 : 240}
              step={1}
              suffix={units === 'imperial' ? 'in' : 'cm'}
            />
            {height && units === 'imperial' && (
              <Text className={`text-sm mt-2 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                {Math.floor(height / 12)}'{height % 12}"
              </Text>
            )}
          </Card>

          {/* Gender */}
          <Card variant="elevated">
            <View className="flex-row items-center gap-2 mb-3">
              <Users size={18} color={isDark ? '#a1a1aa' : '#71717a'} />
              <Text className={`font-medium ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                Gender
              </Text>
            </View>
            <Text className={`text-sm mb-3 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
              Used for body fat calculations (US Navy method)
            </Text>
            <SegmentedControl
              options={[
                { label: 'Male', value: 'male' },
                { label: 'Female', value: 'female' },
              ]}
              value={gender}
              onValueChange={(value) => setGender(value as 'male' | 'female')}
            />
          </Card>
        </View>
      </View>

      {/* Continue Button */}
      <View className="px-6 pb-6">
        <Button onPress={handleContinue} size="lg" fullWidth>
          Continue
        </Button>
      </View>
    </SafeAreaView>
  );
}
