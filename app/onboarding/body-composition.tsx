import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft, Activity, Scale, Ruler } from 'lucide-react-native';
import { useSettings, useOnboarding, useBodyComposition } from '@/hooks';
import { Button, Card, NumberInput } from '@/components/ui';

export default function BodyCompositionScreen() {
  const router = useRouter();
  const { effectiveTheme, settings } = useSettings();
  const { setStep, updateData } = useOnboarding();
  const { createEntry } = useBodyComposition();
  const isDark = effectiveTheme === 'dark';

  const [weight, setWeight] = useState<number | null>(null);
  const [waist, setWaist] = useState<number | null>(null);
  const [neck, setNeck] = useState<number | null>(null);
  const [hip, setHip] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isFemale = settings.gender === 'female';

  const handleContinue = async () => {
    setIsSubmitting(true);
    try {
      // Only save if user entered weight
      if (weight) {
        await createEntry({
          weight,
          waist: waist ?? undefined,
          neck: neck ?? undefined,
          hip: isFemale ? hip ?? undefined : undefined,
        });

        updateData({
          bodyComposition: {
            weight: weight ?? undefined,
            waist: waist ?? undefined,
            neck: neck ?? undefined,
            hip: isFemale ? hip ?? undefined : undefined,
          },
        });
      }

      setStep('complete');
      router.push('/onboarding/complete');
    } catch (error) {
      Alert.alert('Error', 'Failed to save body composition');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    setStep('complete');
    router.push('/onboarding/complete');
  };

  const handleBack = () => {
    setStep('program');
    router.back();
  };

  const canCalculateBodyFat = weight && waist && neck && (!isFemale || hip);

  return (
    <SafeAreaView className={`flex-1 ${isDark ? 'bg-zinc-950' : 'bg-zinc-100'}`}>
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

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        <View className="items-center mb-6">
          <View className="w-16 h-16 bg-orange-500/20 rounded-full items-center justify-center mb-4">
            <Activity size={32} color="#f97316" />
          </View>
          <Text className={`text-center ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
            Track your starting point. This is optional but helps monitor progress beyond the
            scale.
          </Text>
        </View>

        {/* Weight */}
        <Card variant="elevated" className="mb-4">
          <View className="flex-row items-center gap-2 mb-3">
            <Scale size={18} color={isDark ? '#a1a1aa' : '#71717a'} />
            <Text className={`font-medium ${isDark ? 'text-white' : 'text-zinc-900'}`}>
              Body Weight
            </Text>
          </View>
          <NumberInput
            label={`Weight (${settings.units === 'imperial' ? 'lbs' : 'kg'})`}
            value={weight}
            onChangeValue={setWeight}
            min={50}
            max={500}
            step={0.5}
            suffix={settings.units === 'imperial' ? 'lbs' : 'kg'}
          />
        </Card>

        {/* Measurements */}
        <Card variant="elevated" className="mb-4">
          <View className="flex-row items-center gap-2 mb-3">
            <Ruler size={18} color={isDark ? '#a1a1aa' : '#71717a'} />
            <Text className={`font-medium ${isDark ? 'text-white' : 'text-zinc-900'}`}>
              Body Measurements
            </Text>
          </View>
          <Text className={`text-sm mb-4 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
            Used to calculate body fat percentage using the US Navy method
          </Text>

          <View className="gap-4">
            <NumberInput
              label={`Waist (${settings.units === 'imperial' ? 'inches' : 'cm'})`}
              value={waist}
              onChangeValue={setWaist}
              min={20}
              max={60}
              step={0.5}
              suffix={settings.units === 'imperial' ? 'in' : 'cm'}
            />
            <Text className={`text-xs ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
              Measure at navel level
            </Text>

            <NumberInput
              label={`Neck (${settings.units === 'imperial' ? 'inches' : 'cm'})`}
              value={neck}
              onChangeValue={setNeck}
              min={10}
              max={30}
              step={0.5}
              suffix={settings.units === 'imperial' ? 'in' : 'cm'}
            />
            <Text className={`text-xs ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
              Measure at the narrowest point
            </Text>

            {isFemale && (
              <>
                <NumberInput
                  label={`Hip (${settings.units === 'imperial' ? 'inches' : 'cm'})`}
                  value={hip}
                  onChangeValue={setHip}
                  min={25}
                  max={70}
                  step={0.5}
                  suffix={settings.units === 'imperial' ? 'in' : 'cm'}
                />
                <Text className={`text-xs ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                  Measure at the widest point
                </Text>
              </>
            )}
          </View>
        </Card>

        {/* Calculation Preview */}
        {canCalculateBodyFat && (
          <View
            className={`p-4 rounded-xl mb-4 ${isDark ? 'bg-green-500/10' : 'bg-green-50'}`}
          >
            <Text className={`font-medium mb-1 ${isDark ? 'text-green-400' : 'text-green-600'}`}>
              Ready to Calculate
            </Text>
            <Text className={`text-sm ${isDark ? 'text-green-400/70' : 'text-green-600/70'}`}>
              Your body fat percentage will be calculated when you continue
            </Text>
          </View>
        )}

        {/* Info */}
        <View className={`p-3 rounded-lg mb-6 ${isDark ? 'bg-zinc-800/50' : 'bg-zinc-200/50'}`}>
          <Text className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
            You can log measurements anytime from the home screen. Tracking consistently (weekly)
            gives the best insights.
          </Text>
        </View>
      </ScrollView>

      {/* Buttons */}
      <View className="px-6 pb-6 gap-3">
        <Button onPress={handleContinue} loading={isSubmitting} size="lg" fullWidth>
          {weight || waist || neck ? 'Save & Continue' : 'Continue'}
        </Button>
        <Button onPress={handleSkip} variant="ghost" size="lg" fullWidth>
          Skip for Now
        </Button>
      </View>
    </SafeAreaView>
  );
}
