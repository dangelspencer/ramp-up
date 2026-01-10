import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { useSettings } from '@/hooks';
import { Button, NumberInput, Card } from '@/components/ui';

export default function ProfileSettingsScreen() {
  const router = useRouter();
  const { effectiveTheme, settings, updateSettings } = useSettings();
  const isDark = effectiveTheme === 'dark';

  const [height, setHeight] = useState<number | null>(settings.height ?? 70);
  const [gender, setGender] = useState<'male' | 'female'>(settings.gender ?? 'male');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = async () => {
    if (!height || height < 48 || height > 96) {
      Alert.alert('Error', 'Please enter a valid height (48-96 inches)');
      return;
    }

    setIsSubmitting(true);
    try {
      await updateSettings({ height, gender });
      router.back();
    } catch (error) {
      Alert.alert('Error', 'Failed to save profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  const heightFeet = height ? Math.floor(height / 12) : 0;
  const heightInches = height ? height % 12 : 0;

  return (
    <SafeAreaView className={`flex-1 ${isDark ? 'bg-zinc-950' : 'bg-zinc-100'}`}>
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 gap-3">
        <TouchableOpacity onPress={() => router.back()}>
          <ChevronLeft size={24} color={isDark ? '#ffffff' : '#18181b'} />
        </TouchableOpacity>
        <Text className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-zinc-900'}`}>
          Profile
        </Text>
      </View>

      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        <View className="gap-4 pb-8">
          <Text className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
            Your profile information is used to calculate body fat percentage using the US Navy method.
          </Text>

          {/* Gender */}
          <Card variant="elevated">
            <Text className={`text-sm font-medium mb-3 ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
              Biological Sex
            </Text>
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => setGender('male')}
                className={`flex-1 py-3 rounded-lg items-center ${
                  gender === 'male' ? 'bg-orange-500' : isDark ? 'bg-zinc-700' : 'bg-zinc-100'
                }`}
              >
                <Text className={gender === 'male' ? 'text-white font-medium' : isDark ? 'text-zinc-300' : 'text-zinc-700'}>
                  Male
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setGender('female')}
                className={`flex-1 py-3 rounded-lg items-center ${
                  gender === 'female' ? 'bg-orange-500' : isDark ? 'bg-zinc-700' : 'bg-zinc-100'
                }`}
              >
                <Text className={gender === 'female' ? 'text-white font-medium' : isDark ? 'text-zinc-300' : 'text-zinc-700'}>
                  Female
                </Text>
              </TouchableOpacity>
            </View>
            <Text className={`text-xs mt-2 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
              Used for body fat calculation (US Navy method requires different formulas)
            </Text>
          </Card>

          {/* Height */}
          <Card variant="elevated">
            <NumberInput
              label="Height"
              value={height}
              onChangeValue={setHeight}
              min={48}
              max={96}
              step={1}
              suffix="in"
            />
            <Text className={`text-sm mt-2 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
              {heightFeet}'{heightInches}"
            </Text>
          </Card>

          {/* Save Button */}
          <View className="pt-4">
            <Button onPress={handleSave} loading={isSubmitting} fullWidth size="lg">
              Save Profile
            </Button>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
