import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft, Plus, Minus, RotateCcw, Trash2 } from 'lucide-react-native';
import { useSettings, usePlateInventory } from '@/hooks';
import { Button, NumberInput, Modal, ConfirmModal } from '@/components/ui';

const PLATE_COLORS: { [key: number]: string } = {
  45: '#ef4444',
  35: '#f59e0b',
  25: '#22c55e',
  10: '#3b82f6',
  5: '#a855f7',
  2.5: '#ec4899',
};

export default function PlatesSettingsScreen() {
  const router = useRouter();
  const { effectiveTheme, settings } = useSettings();
  const isDark = effectiveTheme === 'dark';
  const { plates, incrementCount, decrementCount, setPlateCount, removePlate, resetToDefaults } = usePlateInventory();

  const [showAddModal, setShowAddModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [newPlateWeight, setNewPlateWeight] = useState<number | null>(null);
  const [newPlateCount, setNewPlateCount] = useState<number | null>(4);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleIncrement = async (weight: number) => {
    try {
      await incrementCount(weight);
    } catch (error) {
      Alert.alert('Error', 'Failed to update plate count');
    }
  };

  const handleDecrement = async (weight: number) => {
    try {
      await decrementCount(weight);
    } catch (error) {
      Alert.alert('Error', 'Failed to update plate count');
    }
  };

  const handleAddPlate = async () => {
    if (!newPlateWeight || newPlateWeight <= 0) {
      Alert.alert('Error', 'Please enter a valid plate weight');
      return;
    }
    if (!newPlateCount || newPlateCount < 0) {
      Alert.alert('Error', 'Please enter a valid count');
      return;
    }

    setIsSubmitting(true);
    try {
      await setPlateCount(newPlateWeight, newPlateCount);
      setShowAddModal(false);
      setNewPlateWeight(null);
      setNewPlateCount(4);
    } catch (error) {
      Alert.alert('Error', 'Failed to add plate');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemovePlate = async (weight: number) => {
    try {
      await removePlate(weight);
    } catch (error) {
      Alert.alert('Error', 'Failed to remove plate');
    }
  };

  const handleReset = async () => {
    try {
      await resetToDefaults();
      setShowResetModal(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to reset plates');
    }
  };

  return (
    <SafeAreaView className={`flex-1 ${isDark ? 'bg-zinc-950' : 'bg-zinc-100'}`}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3">
        <View className="flex-row items-center gap-3">
          <TouchableOpacity onPress={() => router.back()}>
            <ChevronLeft size={24} color={isDark ? '#ffffff' : '#18181b'} />
          </TouchableOpacity>
          <Text className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-zinc-900'}`}>
            Plate Inventory
          </Text>
        </View>
        <View className="flex-row gap-3">
          <TouchableOpacity onPress={() => setShowResetModal(true)}>
            <RotateCcw size={22} color={isDark ? '#a1a1aa' : '#71717a'} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowAddModal(true)}>
            <Plus size={24} color="#f97316" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        <Text className={`text-sm mb-4 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
          Set how many of each plate you have available (total pairs). The plate calculator uses this to determine what weights you can load.
        </Text>

        {plates.length === 0 ? (
          <View className="items-center py-12">
            <Text className={`text-lg font-medium mb-1 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
              No plates configured
            </Text>
            <Text className={`text-center mb-4 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
              Add your plates or reset to defaults
            </Text>
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => setShowResetModal(true)}
                className={`px-4 py-3 rounded-lg ${isDark ? 'bg-zinc-800' : 'bg-white'}`}
              >
                <Text className={isDark ? 'text-white' : 'text-zinc-900'}>Use Defaults</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setShowAddModal(true)}
                className="bg-orange-500 px-4 py-3 rounded-lg"
              >
                <Text className="text-white font-medium">Add Plate</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View className="gap-2">
            {plates.map((plate) => (
              <View
                key={plate.weight}
                className={`rounded-xl p-4 flex-row items-center ${isDark ? 'bg-zinc-800' : 'bg-white'}`}
              >
                {/* Plate visualization */}
                <View
                  className="w-10 h-10 rounded items-center justify-center mr-3"
                  style={{ backgroundColor: PLATE_COLORS[plate.weight] || '#71717a' }}
                >
                  <Text className="text-white text-xs font-bold">{plate.weight}</Text>
                </View>

                {/* Weight label */}
                <View className="flex-1">
                  <Text className={`font-medium ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                    {plate.weight} {settings.units === 'imperial' ? 'lbs' : 'kg'}
                  </Text>
                  <Text className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                    {plate.count} plate{plate.count !== 1 ? 's' : ''} ({plate.count / 2} pair{plate.count !== 2 ? 's' : ''})
                  </Text>
                </View>

                {/* Count controls */}
                <View className="flex-row items-center gap-2">
                  <TouchableOpacity
                    onPress={() => handleDecrement(plate.weight)}
                    className={`w-8 h-8 rounded-full items-center justify-center ${
                      plate.count <= 0
                        ? isDark ? 'bg-zinc-700' : 'bg-zinc-100'
                        : 'bg-orange-500/20'
                    }`}
                    disabled={plate.count <= 0}
                  >
                    <Minus size={16} color={plate.count <= 0 ? (isDark ? '#71717a' : '#a1a1aa') : '#f97316'} />
                  </TouchableOpacity>
                  <Text className={`w-8 text-center font-medium ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                    {plate.count}
                  </Text>
                  <TouchableOpacity
                    onPress={() => handleIncrement(plate.weight)}
                    className="w-8 h-8 rounded-full items-center justify-center bg-orange-500/20"
                  >
                    <Plus size={16} color="#f97316" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleRemovePlate(plate.weight)}
                    className="ml-2"
                  >
                    <Trash2 size={18} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        <View className="h-8" />
      </ScrollView>

      {/* Add Plate Modal */}
      <Modal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add Plate"
        position="bottom"
      >
        <View className="gap-4">
          <NumberInput
            label="Plate Weight"
            value={newPlateWeight}
            onChangeValue={setNewPlateWeight}
            min={0.5}
            max={100}
            step={2.5}
            suffix={settings.units === 'imperial' ? 'lbs' : 'kg'}
          />
          <NumberInput
            label="Count (total plates)"
            value={newPlateCount}
            onChangeValue={setNewPlateCount}
            min={0}
            max={20}
            step={2}
          />
          <Button onPress={handleAddPlate} loading={isSubmitting} fullWidth>
            Add Plate
          </Button>
        </View>
      </Modal>

      {/* Reset Modal */}
      <ConfirmModal
        visible={showResetModal}
        onClose={() => setShowResetModal(false)}
        onConfirm={handleReset}
        title="Reset to Defaults?"
        message="This will replace your current plate inventory with the default set (45, 35, 25, 10, 5, 2.5 lb plates)."
        confirmText="Reset"
        cancelText="Cancel"
      />
    </SafeAreaView>
  );
}
