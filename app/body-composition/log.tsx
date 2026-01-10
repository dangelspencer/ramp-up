import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft, Info } from 'lucide-react-native';
import { useSettings, useBodyComposition } from '@/hooks';
import { Button, NumberInput, Card } from '@/components/ui';

export default function LogBodyCompositionScreen() {
  const router = useRouter();
  const { effectiveTheme, settings } = useSettings();
  const isDark = effectiveTheme === 'dark';
  const { createEntry } = useBodyComposition();

  const [weight, setWeight] = useState<number | null>(null);
  const [waist, setWaist] = useState<number | null>(null);
  const [neck, setNeck] = useState<number | null>(null);
  const [hip, setHip] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showMeasurementGuide, setShowMeasurementGuide] = useState(false);

  const isFemale = settings.gender === 'female';

  const handleSubmit = async () => {
    if (!weight || weight <= 0) {
      Alert.alert('Error', 'Please enter your weight');
      return;
    }

    // Validate measurements if provided
    if (waist && neck) {
      if (isFemale && !hip) {
        Alert.alert('Error', 'Hip measurement is required for body fat calculation');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      await createEntry({
        weight,
        waist: waist ?? undefined,
        neck: neck ?? undefined,
        hip: hip ?? undefined,
      });
      router.back();
    } catch (error) {
      Alert.alert('Error', 'Failed to save measurement');
    } finally {
      setIsSubmitting(false);
    }
  };

  const canCalculateBodyFat = weight && waist && neck && (!isFemale || hip);

  return (
    <SafeAreaView className={`flex-1 ${isDark ? 'bg-zinc-950' : 'bg-zinc-100'}`}>
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 gap-3">
        <TouchableOpacity onPress={() => router.back()}>
          <ChevronLeft size={24} color={isDark ? '#ffffff' : '#18181b'} />
        </TouchableOpacity>
        <Text className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-zinc-900'}`}>
          Log Measurement
        </Text>
      </View>

      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        <View className="gap-4 pb-8">
          {/* Weight (Required) */}
          <Card variant="elevated">
            <Text className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
              Weight <Text className="text-orange-500">*</Text>
            </Text>
            <NumberInput
              value={weight}
              onChangeValue={setWeight}
              min={50}
              max={500}
              step={0.5}
              suffix={settings.units === 'imperial' ? 'lbs' : 'kg'}
            />
          </Card>

          {/* Body Measurements (Optional) */}
          <Card variant="elevated">
            <View className="flex-row items-center justify-between mb-3">
              <Text className={`font-medium ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                Body Measurements
              </Text>
              <TouchableOpacity
                onPress={() => setShowMeasurementGuide(!showMeasurementGuide)}
                className="flex-row items-center gap-1"
              >
                <Info size={16} color="#f97316" />
                <Text className="text-orange-500 text-sm">How to measure</Text>
              </TouchableOpacity>
            </View>

            {showMeasurementGuide && (
              <View className={`p-3 rounded-lg mb-4 ${isDark ? 'bg-zinc-700' : 'bg-zinc-100'}`}>
                <Text className={`text-sm mb-2 ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
                  <Text className="font-medium">Waist:</Text> Measure at navel level, relaxed
                </Text>
                <Text className={`text-sm mb-2 ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
                  <Text className="font-medium">Neck:</Text> Measure at the narrowest point
                </Text>
                {isFemale && (
                  <Text className={`text-sm ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
                    <Text className="font-medium">Hip:</Text> Measure at the widest point
                  </Text>
                )}
              </View>
            )}

            <Text className={`text-sm mb-3 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
              Optional: Add measurements to calculate body fat percentage using the US Navy method
            </Text>

            <View className="gap-3">
              <NumberInput
                label="Waist (at navel)"
                value={waist}
                onChangeValue={setWaist}
                min={20}
                max={60}
                step={0.25}
                suffix="in"
              />
              <NumberInput
                label="Neck (narrowest)"
                value={neck}
                onChangeValue={setNeck}
                min={10}
                max={30}
                step={0.25}
                suffix="in"
              />
              {isFemale && (
                <NumberInput
                  label="Hip (widest)"
                  value={hip}
                  onChangeValue={setHip}
                  min={25}
                  max={60}
                  step={0.25}
                  suffix="in"
                />
              )}
            </View>
          </Card>

          {/* Calculation Preview */}
          {canCalculateBodyFat && (
            <Card variant="elevated">
              <View className="flex-row items-center gap-2 mb-2">
                <View className="w-2 h-2 rounded-full bg-green-500" />
                <Text className={`font-medium ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                  Body Fat Will Be Calculated
                </Text>
              </View>
              <Text className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                Using US Navy method with your height ({settings.height} inches) and gender (
                {settings.gender})
              </Text>
            </Card>
          )}

          {!canCalculateBodyFat && waist && (
            <Card variant="elevated">
              <View className="flex-row items-center gap-2 mb-2">
                <View className="w-2 h-2 rounded-full bg-yellow-500" />
                <Text className={`font-medium ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                  Missing Measurements
                </Text>
              </View>
              <Text className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                Add {!neck ? 'neck' : ''} {!neck && isFemale && !hip ? 'and ' : ''}
                {isFemale && !hip ? 'hip' : ''} measurement to calculate body fat
              </Text>
            </Card>
          )}

          {/* Submit Button */}
          <View className="pt-4">
            <Button
              onPress={handleSubmit}
              loading={isSubmitting}
              disabled={!weight}
              fullWidth
              size="lg"
            >
              Save Measurement
            </Button>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
