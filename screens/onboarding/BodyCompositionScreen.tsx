import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ChevronLeft, Scale, Ruler, Info } from 'lucide-react-native';
import { useSettings, useOnboarding, useBodyComposition } from '@/hooks';
import { Button, Card, NumberInput, IconBox } from '@/components/ui';
import { OnboardingStackParamList } from '../../App';

type NavigationProp = NativeStackNavigationProp<OnboardingStackParamList>;

export default function BodyCompositionScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { effectiveTheme, settings } = useSettings();
  const { updateData, setStep } = useOnboarding();
  const { createEntry, isLoading: bodyCompLoading } = useBodyComposition();
  const isDark = effectiveTheme === 'dark';

  const [weight, setWeight] = useState<number | null>(null);
  const [waist, setWaist] = useState<number | null>(null);
  const [neck, setNeck] = useState<number | null>(null);
  const [hip, setHip] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isMetric = settings.units === 'metric';
  const isFemale = settings.gender === 'female';

  const handleContinue = async () => {
    setIsSubmitting(true);
    try {
      // Only create entry if weight is provided
      if (weight) {
        await createEntry({
          weight,
          waist: waist ?? undefined,
          neck: neck ?? undefined,
          hip: hip ?? undefined,
        });
      }

      updateData({
        bodyComposition: {
          weight: weight ?? undefined,
          waist: waist ?? undefined,
          neck: neck ?? undefined,
          hip: hip ?? undefined,
        },
      });
      setStep('complete');
      navigation.navigate('Complete');
    } catch (error) {
      Alert.alert('Error', 'Failed to save body composition data');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    setStep('complete');
    navigation.navigate('Complete');
  };

  const handleBack = () => {
    setStep('program');
    navigation.goBack();
  };

  // Check if we have enough data to calculate body fat
  const canCalculateBodyFat = weight && waist && neck && (!isFemale || hip);

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: isDark ? '#09090b' : '#f4f4f5' }}>
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 gap-3">
        <TouchableOpacity onPress={handleBack}>
          <ChevronLeft size={24} color={isDark ? '#ffffff' : '#18181b'} />
        </TouchableOpacity>
        <Text className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-zinc-900'}`}>
          Body Composition
        </Text>
      </View>

      {/* Progress indicator */}
      <View className="px-6 mb-6">
        <View className={`h-1 rounded-full ${isDark ? 'bg-zinc-800' : 'bg-zinc-200'}`}>
          <View className="h-1 rounded-full bg-orange-500 w-[80%]" />
        </View>
        <Text className={`text-sm mt-2 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
          Step 8 of 10
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
            <Scale size={32} color="#f97316" />
          </IconBox>
          <Text className={`text-center ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
            Track your starting measurements. This step is optional but helps you see progress
            beyond the scale.
          </Text>
        </View>

        {/* Weight */}
        <Card variant="elevated" className="mt-4 mb-4">
          <NumberInput
            label="Body Weight"
            value={weight}
            onChangeValue={setWeight}
            min={isMetric ? 30 : 60}
            max={isMetric ? 300 : 600}
            step={isMetric ? 0.5 : 1}
            suffix={isMetric ? 'kg' : 'lbs'}
            isDark={isDark}
          />
        </Card>

        {/* Measurements for Body Fat Calculation */}
        <Text className={`text-sm font-medium mb-3 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
          Measurements for Body Fat (US Navy Method)
        </Text>

        <Card variant="elevated" className="mb-4">
          <View className="gap-4">
            <NumberInput
              label="Waist Circumference"
              value={waist}
              onChangeValue={setWaist}
              min={isMetric ? 40 : 16}
              max={isMetric ? 200 : 80}
              step={isMetric ? 0.5 : 0.25}
              suffix={isMetric ? 'cm' : 'in'}
              isDark={isDark}
            />
            <Text className={`text-xs ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
              Measure at navel level, relaxed
            </Text>
          </View>
        </Card>

        <Card variant="elevated" className="mb-4">
          <View className="gap-4">
            <NumberInput
              label="Neck Circumference"
              value={neck}
              onChangeValue={setNeck}
              min={isMetric ? 20 : 8}
              max={isMetric ? 80 : 30}
              step={isMetric ? 0.5 : 0.25}
              suffix={isMetric ? 'cm' : 'in'}
              isDark={isDark}
            />
            <Text className={`text-xs ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
              Measure just below the larynx
            </Text>
          </View>
        </Card>

        {/* Hip measurement for females */}
        {isFemale && (
          <Card variant="elevated" className="mb-4">
            <View className="gap-4">
              <NumberInput
                label="Hip Circumference"
                value={hip}
                onChangeValue={setHip}
                min={isMetric ? 50 : 20}
                max={isMetric ? 200 : 80}
                step={isMetric ? 0.5 : 0.25}
                suffix={isMetric ? 'cm' : 'in'}
                isDark={isDark}
              />
              <Text className={`text-xs ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                Measure at the widest point
              </Text>
            </View>
          </Card>
        )}

        {/* Info Box */}
        <View
          className={`p-4 rounded-xl mb-4 flex-row items-start gap-3 ${
            isDark ? 'bg-blue-500/10' : 'bg-blue-50'
          }`}
        >
          <Info size={20} color="#3b82f6" className="mt-0.5" />
          <View className="flex-1">
            <Text className={`font-medium mb-1 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
              US Navy Body Fat Method
            </Text>
            <Text className={`text-sm ${isDark ? 'text-blue-400/70' : 'text-blue-600/70'}`}>
              {canCalculateBodyFat
                ? 'We have enough measurements to calculate your body fat percentage!'
                : isFemale
                  ? 'Provide weight, waist, neck, and hip measurements to calculate body fat.'
                  : 'Provide weight, waist, and neck measurements to calculate body fat.'}
            </Text>
          </View>
        </View>

        {/* Preview Card */}
        {weight && (
          <Card variant="elevated" className="mb-6">
            <Text
              className={`text-sm font-medium mb-3 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}
            >
              Starting Measurements
            </Text>
            <View className="gap-2">
              <View className="flex-row justify-between">
                <Text className={isDark ? 'text-zinc-400' : 'text-zinc-500'}>Weight</Text>
                <Text className={`font-medium ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                  {weight} {isMetric ? 'kg' : 'lbs'}
                </Text>
              </View>
              {waist && (
                <View className="flex-row justify-between">
                  <Text className={isDark ? 'text-zinc-400' : 'text-zinc-500'}>Waist</Text>
                  <Text className={`font-medium ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                    {waist} {isMetric ? 'cm' : 'in'}
                  </Text>
                </View>
              )}
              {neck && (
                <View className="flex-row justify-between">
                  <Text className={isDark ? 'text-zinc-400' : 'text-zinc-500'}>Neck</Text>
                  <Text className={`font-medium ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                    {neck} {isMetric ? 'cm' : 'in'}
                  </Text>
                </View>
              )}
              {hip && isFemale && (
                <View className="flex-row justify-between">
                  <Text className={isDark ? 'text-zinc-400' : 'text-zinc-500'}>Hip</Text>
                  <Text className={`font-medium ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                    {hip} {isMetric ? 'cm' : 'in'}
                  </Text>
                </View>
              )}
            </View>
          </Card>
        )}
      </ScrollView>

      {/* Buttons */}
      <View className="px-6 pb-6 gap-3">
        {weight ? (
          <Button onPress={handleContinue} loading={isSubmitting} size="lg" fullWidth>
            Save & Continue
          </Button>
        ) : (
          <Button onPress={handleContinue} loading={isSubmitting} size="lg" fullWidth>
            Continue
          </Button>
        )}
        <Button onPress={handleSkip} variant="outline" size="lg" fullWidth>
          Skip for Now
        </Button>
      </View>
    </SafeAreaView>
  );
}
