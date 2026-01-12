import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ChevronLeft, User, Ruler, Users } from 'lucide-react-native';
import { useSettings } from '@/hooks';
import { Card, Button } from '@/components/ui';
import { NumberInput } from '@/components/ui/Input';
import { SegmentedControl } from '@/components/ui/Select';
import { RootStackParamList } from '../../App';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function SettingsProfileScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { effectiveTheme, settings, updateSettings } = useSettings();
  const isDark = effectiveTheme === 'dark';

  const [height, setHeight] = useState<number | null>(settings.height ?? null);
  const [gender, setGender] = useState<string>(settings.gender ?? 'male');
  const [units, setUnits] = useState<string>(settings.units ?? 'imperial');
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const changed =
      height !== settings.height ||
      gender !== settings.gender ||
      units !== settings.units;
    setHasChanges(changed);
  }, [height, gender, units, settings]);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await updateSettings({
        height: height ?? undefined,
        gender: gender as 'male' | 'female',
        units: units as 'imperial' | 'metric',
      });
      navigation.goBack();
    } catch (error) {
      console.error('Failed to save profile:', error);
    } finally {
      setIsSaving(false);
    }
  };

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
          Profile
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
          {/* Profile Icon */}
          <View className="items-center py-6">
            <View className={`p-4 rounded-full mb-3 ${isDark ? 'bg-zinc-800' : 'bg-zinc-200'}`}>
              <User size={32} color={isDark ? '#a1a1aa' : '#71717a'} />
            </View>
          </View>

          {/* Height Card */}
          <Card variant="elevated" className="mb-4">
            <View className="flex-row items-center gap-2 mb-4">
              <View className={`p-2 rounded-lg ${isDark ? 'bg-blue-500/20' : 'bg-blue-100'}`}>
                <Ruler size={20} color="#3b82f6" />
              </View>
              <View>
                <Text className={`font-semibold ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                  Height
                </Text>
                <Text className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                  Used for BMI and body fat calculations
                </Text>
              </View>
            </View>

            <NumberInput
              label="Height (inches)"
              value={height}
              onChangeValue={setHeight}
              placeholder="Enter height in inches"
              suffix="in"
              min={48}
              max={96}
              isDark={isDark}
              hint={
                height
                  ? `${Math.floor(height / 12)}'${height % 12}" (${(height * 2.54).toFixed(1)} cm)`
                  : undefined
              }
            />
          </Card>

          {/* Gender Card */}
          <Card variant="elevated" className="mb-4">
            <View className="flex-row items-center gap-2 mb-4">
              <View className={`p-2 rounded-lg ${isDark ? 'bg-purple-500/20' : 'bg-purple-100'}`}>
                <Users size={20} color="#a855f7" />
              </View>
              <View>
                <Text className={`font-semibold ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                  Gender
                </Text>
                <Text className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                  Used for body fat calculation formula
                </Text>
              </View>
            </View>

            <SegmentedControl
              value={gender}
              onValueChange={setGender}
              options={[
                { value: 'male', label: 'Male' },
                { value: 'female', label: 'Female' },
              ]}
              isDark={isDark}
            />

            <Text className={`text-sm mt-3 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
              {gender === 'female'
                ? 'Female body fat calculation requires hip measurement in addition to waist and neck.'
                : 'Male body fat calculation uses waist and neck measurements.'}
            </Text>
          </Card>

          {/* Units Card */}
          <Card variant="elevated" className="mb-4">
            <View className="flex-row items-center gap-2 mb-4">
              <View className={`p-2 rounded-lg ${isDark ? 'bg-green-500/20' : 'bg-green-100'}`}>
                <Ruler size={20} color="#22c55e" />
              </View>
              <View>
                <Text className={`font-semibold ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                  Weight Units
                </Text>
                <Text className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                  Display preference for weights
                </Text>
              </View>
            </View>

            <SegmentedControl
              value={units}
              onValueChange={setUnits}
              options={[
                { value: 'imperial', label: 'Imperial (lbs)' },
                { value: 'metric', label: 'Metric (kg)' },
              ]}
              isDark={isDark}
            />
          </Card>

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
          loading={isSaving}
          disabled={!hasChanges || isSaving}
          fullWidth
          size="lg"
        >
          Save Changes
        </Button>
      </View>
    </SafeAreaView>
  );
}
