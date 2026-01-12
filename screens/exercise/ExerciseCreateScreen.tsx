import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ChevronLeft } from 'lucide-react-native';

import { useSettings, useExercises, useBarbells } from '@/hooks';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input, NumberInput } from '@/components/ui/Input';
import { Select, SegmentedControl } from '@/components/ui/Select';
import { Switch } from '@/components/ui/Switch';
import { formatWeight } from '@/utils/formatting';
import { RootStackParamList } from '../../App';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function ExerciseCreateScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { effectiveTheme, settings } = useSettings();
  const isDark = effectiveTheme === 'dark';
  const units = settings.units;
  const unitLabel = units === 'imperial' ? 'lbs' : 'kg';

  const { createExercise } = useExercises();
  const { barbells } = useBarbells();

  const [name, setName] = useState('');
  const [maxWeight, setMaxWeight] = useState<number | null>(null);
  const [weightIncrement, setWeightIncrement] = useState<'2.5' | '5'>('5');
  const [autoProgression, setAutoProgression] = useState(true);
  const [barbellId, setBarbellId] = useState<string>('');
  const [defaultRestTime, setDefaultRestTime] = useState<number | null>(90);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; maxWeight?: string }>({});

  const handleBack = () => {
    navigation.goBack();
  };

  const validateForm = (): boolean => {
    const newErrors: { name?: string; maxWeight?: string } = {};

    if (!name.trim()) {
      newErrors.name = 'Exercise name is required';
    }

    if (maxWeight === null || maxWeight <= 0) {
      newErrors.maxWeight = 'Max weight is required and must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setIsSaving(true);

      // Convert weight to lbs if user is using metric
      let weightInLbs = maxWeight!;
      let incrementInLbs = parseFloat(weightIncrement);

      if (units === 'metric') {
        weightInLbs = maxWeight! * 2.20462;
        incrementInLbs = incrementInLbs * 2.20462;
      }

      await createExercise({
        name: name.trim(),
        maxWeight: weightInLbs,
        weightIncrement: incrementInLbs,
        autoProgression,
        barbellId: barbellId || null,
        defaultRestTime: defaultRestTime ?? 90,
      });

      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to create exercise. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const barbellOptions = [
    { value: '', label: 'None (bodyweight/dumbbell)' },
    ...barbells.map((b) => ({
      value: b.id,
      label: `${b.name} (${formatWeight(b.weight, settings.units)})`,
    })),
  ];

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: isDark ? '#09090b' : '#f4f4f5' }}>
      <View className="flex-1">
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 py-4">
          <TouchableOpacity
            onPress={handleBack}
            className={`p-2 rounded-lg ${isDark ? 'bg-zinc-800' : 'bg-white'}`}
          >
            <ChevronLeft size={24} color={isDark ? '#ffffff' : '#18181b'} />
          </TouchableOpacity>
          <Text className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-zinc-900'}`}>
            Create Exercise
          </Text>
          <View className="w-10" />
        </View>

        <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
          {/* Exercise Name */}
          <View className="mb-6">
            <Input
              label="Exercise Name"
              value={name}
              onChangeText={(text) => {
                setName(text);
                setErrors((prev) => ({ ...prev, name: undefined }));
              }}
              placeholder="e.g., Bench Press"
              error={errors.name}
            />
          </View>

          {/* Max Weight */}
          <View className="mb-6">
            <NumberInput
              label={`Current Max Weight (${unitLabel})`}
              value={maxWeight}
              onChangeValue={(val) => {
                setMaxWeight(val);
                setErrors((prev) => ({ ...prev, maxWeight: undefined }));
              }}
              min={0}
              allowDecimals
              placeholder="135"
              suffix={unitLabel}
              error={errors.maxWeight}
              hint="Your current 1-rep max or working weight"
            />
          </View>

          {/* Weight Increment */}
          <View className="mb-6">
            <Text className={`text-sm font-medium mb-2 ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
              Weight Increment
            </Text>
            <SegmentedControl
              value={weightIncrement}
              onValueChange={(value) => setWeightIncrement(value as '2.5' | '5')}
              options={[
                { value: '2.5', label: `2.5 ${unitLabel}` },
                { value: '5', label: `5 ${unitLabel}` },
              ]}
              isDark={isDark}
            />
            <Text className={`text-sm mt-2 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
              How much to increase weight when progressing
            </Text>
          </View>

          {/* Barbell Selection */}
          <View className="mb-6">
            <Select
              label="Barbell"
              value={barbellId}
              onValueChange={setBarbellId}
              options={barbellOptions}
              placeholder="Select a barbell (optional)"
            />
            <Text className={`text-sm mt-2 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
              Select if this exercise uses a barbell for plate calculations
            </Text>
          </View>

          {/* Default Rest Time */}
          <View className="mb-6">
            <NumberInput
              label="Default Rest Time"
              value={defaultRestTime}
              onChangeValue={setDefaultRestTime}
              min={0}
              max={600}
              placeholder="90"
              suffix="sec"
              hint="Rest time between sets (in seconds)"
            />
          </View>

          {/* Auto Progression */}
          <Card className="mb-6">
            <Switch
              value={autoProgression}
              onValueChange={setAutoProgression}
              label="Auto Progression"
              description="Automatically increase weight when you complete all sets at current weight"
            />
          </Card>

          {/* Info Card */}
          <Card variant="outlined" className="mb-6">
            <Text className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
              {autoProgression
                ? 'When you successfully complete all sets, the app will suggest increasing the weight by your selected increment.'
                : 'You will manually update the weight when you feel ready to progress.'}
            </Text>
          </Card>

          {/* Spacer */}
          <View className="h-24" />
        </ScrollView>

        {/* Save Button */}
        <View className={`px-4 py-4 ${isDark ? 'bg-zinc-950' : 'bg-zinc-100'}`}>
          <Button
            onPress={handleSave}
            loading={isSaving}
            disabled={isSaving}
            fullWidth
          >
            Create Exercise
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
}
