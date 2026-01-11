import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ChevronLeft, Dumbbell, Check, Plus } from 'lucide-react-native';
import { useSettings, useOnboarding, useBarbells } from '@/hooks';
import { Button, NumberInput, Modal, Input, IconBox } from '@/components/ui';
import { OnboardingStackParamList } from '../../App';

type NavigationProp = NativeStackNavigationProp<OnboardingStackParamList>;

export default function BarbellsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { effectiveTheme, settings } = useSettings();
  const { updateData, setStep } = useOnboarding();
  const { barbells, createBarbell, deleteBarbell, setDefault, isLoading } = useBarbells();
  const isDark = effectiveTheme === 'dark';

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customWeight, setCustomWeight] = useState<number | null>(45);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const hasInitialized = useRef(false);

  // Initialize selected IDs from existing barbells (select Olympic Barbell by default)
  useEffect(() => {
    if (barbells.length > 0 && !hasInitialized.current) {
      hasInitialized.current = true;
      // Select the default barbell, or Olympic Barbell if no default set
      const defaultBarbell = barbells.find(b => b.isDefault) || barbells.find(b => b.name === 'Olympic Barbell');
      if (defaultBarbell) {
        setSelectedIds([defaultBarbell.id]);
      }
    }
  }, [barbells]);

  const toggleBarbell = (barbellId: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(barbellId)) {
        return prev.filter((id) => id !== barbellId);
      }
      return [...prev, barbellId];
    });
  };

  const handleAddCustom = async () => {
    if (!customName.trim()) {
      Alert.alert('Error', 'Please enter a name for the barbell');
      return;
    }
    if (!customWeight || customWeight <= 0) {
      Alert.alert('Error', 'Please enter a valid weight');
      return;
    }

    // Check for duplicate name
    if (barbells.some(b => b.name.toLowerCase() === customName.trim().toLowerCase())) {
      Alert.alert('Error', 'A barbell with this name already exists');
      return;
    }

    setIsSubmitting(true);
    try {
      const newBarbell = await createBarbell({ name: customName.trim(), weight: customWeight });
      // Auto-select the new barbell
      setSelectedIds((prev) => [...prev, newBarbell.id]);
      setShowCustomModal(false);
      setCustomName('');
      setCustomWeight(45);
    } catch (error) {
      Alert.alert('Error', 'Failed to add barbell');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContinue = async () => {
    if (selectedIds.length === 0) {
      Alert.alert('Error', 'Please select at least one barbell');
      return;
    }

    setIsSubmitting(true);
    try {
      // Delete unselected barbells
      const unselectedBarbells = barbells.filter(b => !selectedIds.includes(b.id));
      for (const barbell of unselectedBarbells) {
        await deleteBarbell(barbell.id);
      }

      // Ensure one barbell is set as default
      const selectedBarbells = barbells.filter(b => selectedIds.includes(b.id));
      const hasDefault = selectedBarbells.some(b => b.isDefault);
      if (!hasDefault && selectedBarbells.length > 0) {
        // Set the first selected barbell as default (prefer Olympic Barbell)
        const olympicBarbell = selectedBarbells.find(b => b.name === 'Olympic Barbell');
        await setDefault(olympicBarbell?.id || selectedBarbells[0].id);
      }

      updateData({ selectedBarbells: selectedBarbells.map(b => b.name) });
      setStep('plates');
      navigation.navigate('Plates');
    } catch (error) {
      Alert.alert('Error', 'Failed to save barbells');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    setStep('health');
    navigation.goBack();
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1" style={{ backgroundColor: isDark ? '#09090b' : '#f4f4f5' }}>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#f97316" />
          <Text className={`mt-4 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
            Loading...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: isDark ? '#09090b' : '#f4f4f5' }}>
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 gap-3">
        <TouchableOpacity onPress={handleBack}>
          <ChevronLeft size={24} color={isDark ? '#ffffff' : '#18181b'} />
        </TouchableOpacity>
        <Text className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-zinc-900'}`}>
          Your Barbells
        </Text>
      </View>

      {/* Progress indicator */}
      <View className="px-6 mb-6">
        <View className={`h-1 rounded-full ${isDark ? 'bg-zinc-800' : 'bg-zinc-200'}`}>
          <View className="h-1 rounded-full bg-orange-500 w-[30%]" />
        </View>
        <Text className={`text-sm mt-2 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
          Step 3 of 10
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
            <Dumbbell size={32} color="#f97316" />
          </IconBox>
          <Text className={`text-center ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
            Select the barbells you have access to. This helps calculate plate loading.
          </Text>
        </View>

        {/* Barbells from database */}
        <View className="gap-2 mt-4 mb-4">
          {barbells.map((barbell) => {
            const isSelected = selectedIds.includes(barbell.id);
            return (
              <TouchableOpacity
                key={barbell.id}
                onPress={() => toggleBarbell(barbell.id)}
                style={{
                  padding: 16,
                  borderRadius: 12,
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: isSelected
                    ? 'rgba(249, 115, 22, 0.2)'
                    : isDark
                      ? '#27272a'
                      : '#ffffff',
                  borderWidth: isSelected ? 1 : 0,
                  borderColor: isSelected ? '#f97316' : 'transparent',
                }}
              >
                <IconBox
                  variant={isSelected ? 'primary' : isDark ? 'muted-dark' : 'muted'}
                  className="mr-3"
                >
                  {isSelected ? (
                    <Check size={20} color="#ffffff" />
                  ) : (
                    <Dumbbell size={20} color={isDark ? '#a1a1aa' : '#71717a'} />
                  )}
                </IconBox>
                <View className="flex-1">
                  <Text
                    className={`font-medium ${
                      isSelected
                        ? 'text-orange-500'
                        : isDark
                          ? 'text-white'
                          : 'text-zinc-900'
                    }`}
                  >
                    {barbell.name}
                  </Text>
                  <Text className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                    {barbell.weight} {settings.units === 'imperial' ? 'lbs' : 'kg'}
                    {barbell.description ? ` - ${barbell.description}` : ''}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Add Custom Button */}
        <TouchableOpacity
          onPress={() => setShowCustomModal(true)}
          className={`p-4 rounded-xl flex-row items-center justify-center gap-2 border border-dashed mb-6 ${
            isDark ? 'border-zinc-700' : 'border-zinc-300'
          }`}
        >
          <Plus size={20} color="#f97316" />
          <Text className="text-orange-500 font-medium">Add Custom Barbell</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Continue Button */}
      <View className="px-6 pb-6">
        <Button
          onPress={handleContinue}
          loading={isSubmitting}
          disabled={selectedIds.length === 0}
          size="lg"
          fullWidth
        >
          Continue
        </Button>
      </View>

      {/* Custom Barbell Modal */}
      <Modal
        visible={showCustomModal}
        onClose={() => setShowCustomModal(false)}
        title="Add Custom Barbell"
        position="bottom"
      >
        <View className="gap-4">
          <Input
            label="Barbell Name"
            value={customName}
            onChangeText={setCustomName}
            placeholder="e.g., Home Gym Bar"
          />
          <NumberInput
            label="Weight"
            value={customWeight}
            onChangeValue={setCustomWeight}
            min={1}
            max={100}
            step={5}
            suffix={settings.units === 'imperial' ? 'lbs' : 'kg'}
            isDark={isDark}
          />
          <Button onPress={handleAddCustom} loading={isSubmitting} fullWidth>
            Add Barbell
          </Button>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
