import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ChevronLeft, Scale, Ruler, Info } from 'lucide-react-native';
import { useSettings, useBodyComposition } from '@/hooks';
import { Card, Button } from '@/components/ui';
import { NumberInput } from '@/components/ui/Input';
import { RootStackParamList } from '../../App';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function BodyCompLogScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { effectiveTheme, settings } = useSettings();
  const isDark = effectiveTheme === 'dark';
  const { createEntry, latest } = useBodyComposition();

  const [weight, setWeight] = useState<number | null>(latest?.weight ?? null);
  const [waist, setWaist] = useState<number | null>(latest?.waist ?? null);
  const [neck, setNeck] = useState<number | null>(latest?.neck ?? null);
  const [hip, setHip] = useState<number | null>(latest?.hip ?? null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isFemale = settings.gender === 'female';

  const handleSave = async () => {
    if (!weight) {
      setError('Weight is required');
      return;
    }

    // Validate hip measurement for females if they're calculating body fat
    if (isFemale && waist && neck && !hip) {
      setError('Hip measurement is required for body fat calculation');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      await createEntry({
        weight,
        waist: waist ?? undefined,
        neck: neck ?? undefined,
        hip: hip ?? undefined,
      });

      navigation.goBack();
    } catch (_err) {
      setError('Failed to save measurement. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const canCalculateBodyFat = weight && waist && neck && (isFemale ? hip : true);

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: isDark ? '#09090b' : '#f4f4f5' }}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className={`p-2 rounded-lg ${isDark ? 'bg-zinc-800' : 'bg-white'}`}
        >
          <ChevronLeft size={24} color={isDark ? '#ffffff' : '#18181b'} />
        </TouchableOpacity>
        <Text className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-zinc-900'}`}>
          Log Measurement
        </Text>
        <View className="w-10" />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          className="flex-1 px-4"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Weight Card */}
          <Card variant="elevated" className="mb-4">
            <View className="flex-row items-center gap-2 mb-4">
              <View className={`p-2 rounded-lg ${isDark ? 'bg-orange-500/20' : 'bg-orange-100'}`}>
                <Scale size={20} color="#f97316" />
              </View>
              <View>
                <Text className={`font-semibold ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                  Weight
                </Text>
                <Text className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                  Required for tracking
                </Text>
              </View>
            </View>

            <NumberInput
              label="Body Weight"
              value={weight}
              onChangeValue={setWeight}
              placeholder="Enter weight"
              suffix={settings.units === 'imperial' ? 'lbs' : 'kg'}
              allowDecimals
              min={50}
              max={500}
              isDark={isDark}
            />
          </Card>

          {/* Measurements Card */}
          <Card variant="elevated" className="mb-4">
            <View className="flex-row items-center gap-2 mb-4">
              <View className={`p-2 rounded-lg ${isDark ? 'bg-blue-500/20' : 'bg-blue-100'}`}>
                <Ruler size={20} color="#3b82f6" />
              </View>
              <View className="flex-1">
                <Text className={`font-semibold ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                  Body Measurements
                </Text>
                <Text className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                  Optional - enables body fat calculation
                </Text>
              </View>
            </View>

            <View className="gap-4">
              <NumberInput
                label="Waist (at navel)"
                value={waist}
                onChangeValue={setWaist}
                placeholder="Enter waist measurement"
                suffix="in"
                allowDecimals
                min={20}
                max={60}
                isDark={isDark}
              />

              <NumberInput
                label="Neck (at narrowest point)"
                value={neck}
                onChangeValue={setNeck}
                placeholder="Enter neck measurement"
                suffix="in"
                allowDecimals
                min={10}
                max={30}
                isDark={isDark}
              />

              {isFemale && (
                <NumberInput
                  label="Hip (at widest point)"
                  value={hip}
                  onChangeValue={setHip}
                  placeholder="Enter hip measurement"
                  suffix="in"
                  allowDecimals
                  min={25}
                  max={70}
                  isDark={isDark}
                />
              )}
            </View>
          </Card>

          {/* Info Card */}
          <Card variant="outlined" className="mb-4">
            <View className="flex-row items-start gap-3">
              <Info size={20} color={isDark ? '#71717a' : '#a1a1aa'} />
              <View className="flex-1">
                <Text className={`font-medium mb-1 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                  Body Fat Calculation
                </Text>
                <Text className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                  {canCalculateBodyFat
                    ? 'Body fat will be calculated using the US Navy method based on your measurements and profile settings.'
                    : `To calculate body fat percentage, please enter${
                        isFemale ? ' waist, neck, and hip' : ' waist and neck'
                      } measurements.`}
                </Text>
                {!settings.height && (
                  <Text className="text-sm text-orange-500 mt-2">
                    Note: Set your height in profile settings for accurate calculations.
                  </Text>
                )}
              </View>
            </View>
          </Card>

          {/* Error Message */}
          {error && (
            <View className="mb-4 p-3 rounded-lg bg-red-500/10">
              <Text className="text-red-500 text-center">{error}</Text>
            </View>
          )}

          {/* Spacer */}
          <View className="h-24" />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Save Button */}
      <View
        className={`px-4 py-4 border-t ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'}`}
      >
        <Button
          onPress={handleSave}
          loading={isSubmitting}
          disabled={!weight || isSubmitting}
          fullWidth
          size="lg"
        >
          Save Measurement
        </Button>
      </View>
    </SafeAreaView>
  );
}
