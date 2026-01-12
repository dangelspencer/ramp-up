import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  ChevronLeft,
  Plus,
  Minus,
  CircleDot,
  RotateCcw,
  Trash2,
} from 'lucide-react-native';
import { useSettings, usePlateInventory } from '@/hooks';
import { Card, Button } from '@/components/ui';
import { NumberInput } from '@/components/ui/Input';
import { Modal, ConfirmModal } from '@/components/ui/Modal';
import { RootStackParamList } from '../../App';
import { PlateInventoryItem } from '@/db/schema';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface PlateRowProps {
  plate: PlateInventoryItem;
  isDark: boolean;
  units: string;
  onIncrement: (weight: number) => void;
  onDecrement: (weight: number) => void;
  onRemove: (weight: number) => void;
}

function PlateRow({ plate, isDark, units, onIncrement, onDecrement, onRemove }: PlateRowProps) {
  const pairs = Math.floor(plate.count / 2);

  return (
    <Card className="mb-3">
      <View className="flex-row items-center">
        <View className={`p-2 rounded-lg mr-3 ${isDark ? 'bg-zinc-700' : 'bg-zinc-100'}`}>
          <CircleDot size={20} color={isDark ? '#a1a1aa' : '#71717a'} />
        </View>

        <View className="flex-1">
          <Text className={`font-medium ${isDark ? 'text-white' : 'text-zinc-900'}`}>
            {plate.weight} {units}
          </Text>
          <Text className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
            {plate.count} plates ({pairs} {pairs === 1 ? 'pair' : 'pairs'})
          </Text>
        </View>

        <View className="flex-row items-center gap-2">
          <TouchableOpacity
            onPress={() => onDecrement(plate.weight)}
            disabled={plate.count <= 0}
            className={`w-10 h-10 rounded-lg items-center justify-center ${
              plate.count <= 0
                ? isDark
                  ? 'bg-zinc-800'
                  : 'bg-zinc-50'
                : isDark
                ? 'bg-zinc-700'
                : 'bg-zinc-100'
            }`}
          >
            <Minus
              size={20}
              color={plate.count <= 0 ? (isDark ? '#52525b' : '#d4d4d8') : isDark ? '#a1a1aa' : '#71717a'}
            />
          </TouchableOpacity>

          <View
            className={`w-12 h-10 rounded-lg items-center justify-center ${
              isDark ? 'bg-zinc-800' : 'bg-zinc-100'
            }`}
          >
            <Text className={`font-semibold ${isDark ? 'text-white' : 'text-zinc-900'}`}>
              {plate.count}
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => onIncrement(plate.weight)}
            className={`w-10 h-10 rounded-lg items-center justify-center ${
              isDark ? 'bg-zinc-700' : 'bg-zinc-100'
            }`}
          >
            <Plus size={20} color={isDark ? '#a1a1aa' : '#71717a'} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => onRemove(plate.weight)}
            className={`w-10 h-10 rounded-lg items-center justify-center ${
              isDark ? 'bg-zinc-700' : 'bg-zinc-100'
            }`}
          >
            <Trash2 size={18} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </View>
    </Card>
  );
}

export default function SettingsPlatesScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { effectiveTheme, settings } = useSettings();
  const isDark = effectiveTheme === 'dark';
  const {
    plates,
    refresh,
    setPlateCount,
    incrementCount,
    decrementCount,
    removePlate,
    resetToDefaults,
  } = usePlateInventory();

  const [refreshing, setRefreshing] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [resetModalVisible, setResetModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [plateToDelete, setPlateToDelete] = useState<number | null>(null);

  // Form state
  const [newWeight, setNewWeight] = useState<number | null>(null);
  const [newCount, setNewCount] = useState<number | null>(2);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  const openAddModal = () => {
    setNewWeight(null);
    setNewCount(2);
    setError(null);
    setAddModalVisible(true);
  };

  const handleAddPlate = async () => {
    if (!newWeight || newWeight <= 0) {
      setError('Weight must be greater than 0');
      return;
    }
    if (newCount === null || newCount < 0) {
      setError('Count must be at least 0');
      return;
    }

    // Check if plate already exists
    const existingPlate = plates.find((p) => p.weight === newWeight);
    if (existingPlate) {
      setError('A plate with this weight already exists');
      return;
    }

    try {
      setIsSaving(true);
      setError(null);
      await setPlateCount(newWeight, newCount);
      setAddModalVisible(false);
    } catch (_err) {
      setError('Failed to add plate. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleIncrement = async (weight: number) => {
    await incrementCount(weight);
  };

  const handleDecrement = async (weight: number) => {
    await decrementCount(weight);
  };

  const handleRemove = (weight: number) => {
    setPlateToDelete(weight);
    setDeleteModalVisible(true);
  };

  const confirmDelete = async () => {
    if (plateToDelete !== null) {
      await removePlate(plateToDelete);
      setPlateToDelete(null);
    }
    setDeleteModalVisible(false);
  };

  const handleReset = async () => {
    await resetToDefaults();
    setResetModalVisible(false);
  };

  // Calculate total weight available
  const totalWeight = plates.reduce((sum, plate) => sum + plate.weight * plate.count, 0);

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
          Plate Inventory
        </Text>
        <TouchableOpacity
          onPress={openAddModal}
          className="p-2 rounded-lg bg-orange-500"
        >
          <Plus size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1 px-4"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={isDark ? '#f97316' : '#f97316'}
          />
        }
      >
        {/* Info Card */}
        <Card variant="outlined" className="mb-4">
          <View className="flex-row items-start gap-3">
            <CircleDot size={20} color={isDark ? '#71717a' : '#a1a1aa'} />
            <View className="flex-1">
              <Text className={`font-medium mb-1 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                Plate Inventory
              </Text>
              <Text className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                Configure which plates you have available. The plate calculator uses this inventory
                to show you which plates to load on each side of the bar.
              </Text>
            </View>
          </View>
        </Card>

        {/* Summary Card */}
        {plates.length > 0 && (
          <Card variant="elevated" className="mb-4">
            <View className="flex-row justify-between items-center">
              <View>
                <Text className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                  Total Plate Weight
                </Text>
                <Text className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                  {totalWeight} {settings.units}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setResetModalVisible(true)}
                className={`flex-row items-center gap-2 px-3 py-2 rounded-lg ${
                  isDark ? 'bg-zinc-700' : 'bg-zinc-100'
                }`}
              >
                <RotateCcw size={16} color={isDark ? '#a1a1aa' : '#71717a'} />
                <Text className={isDark ? 'text-zinc-300' : 'text-zinc-600'}>Reset</Text>
              </TouchableOpacity>
            </View>
          </Card>
        )}

        {/* Plates List */}
        <View className="mb-4">
          <Text
            className={`text-sm font-medium mb-3 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}
          >
            Your Plates ({plates.length} sizes)
          </Text>

          {plates.length === 0 ? (
            <Card variant="outlined" className="items-center py-8">
              <CircleDot size={48} color={isDark ? '#3f3f46' : '#d4d4d8'} />
              <Text
                className={`mt-4 text-center ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}
              >
                No plates configured
              </Text>
              <Text
                className={`text-sm text-center mt-1 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}
              >
                Add plates to enable the plate calculator
              </Text>
              <View className="flex-row gap-3 mt-4">
                <Button
                  onPress={() => setResetModalVisible(true)}
                  variant="secondary"
                  icon={<RotateCcw size={18} color={isDark ? '#ffffff' : '#18181b'} />}
                >
                  Use Defaults
                </Button>
                <Button
                  onPress={openAddModal}
                  icon={<Plus size={18} color="#ffffff" />}
                >
                  Add Plate
                </Button>
              </View>
            </Card>
          ) : (
            plates.map((plate) => (
              <PlateRow
                key={plate.id}
                plate={plate}
                isDark={isDark}
                units={settings.units}
                onIncrement={handleIncrement}
                onDecrement={handleDecrement}
                onRemove={handleRemove}
              />
            ))
          )}
        </View>

        {/* Spacer */}
        <View className="h-8" />
      </ScrollView>

      {/* Add Plate Modal */}
      <Modal
        visible={addModalVisible}
        onClose={() => setAddModalVisible(false)}
        title="Add Plate"
        position="bottom"
      >
        <View className="gap-4">
          <NumberInput
            label="Plate Weight"
            value={newWeight}
            onChangeValue={setNewWeight}
            placeholder="Enter weight"
            suffix={settings.units}
            allowDecimals
            min={0.25}
            max={100}
          />

          <NumberInput
            label="Count (total plates, not pairs)"
            value={newCount}
            onChangeValue={setNewCount}
            placeholder="Enter count"
            min={0}
            max={100}
            hint="Enter the total number of plates you have of this weight"
          />

          {error && (
            <View className="p-3 rounded-lg bg-red-500/10">
              <Text className="text-red-500 text-center">{error}</Text>
            </View>
          )}

          <View className="flex-row gap-3 mt-2">
            <Button
              onPress={() => setAddModalVisible(false)}
              variant="secondary"
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onPress={handleAddPlate}
              loading={isSaving}
              disabled={isSaving}
              className="flex-1"
            >
              Add
            </Button>
          </View>
        </View>
      </Modal>

      {/* Reset Confirmation Modal */}
      <ConfirmModal
        visible={resetModalVisible}
        onClose={() => setResetModalVisible(false)}
        onConfirm={handleReset}
        title="Reset to Defaults"
        message="This will reset your plate inventory to the standard Olympic plate set. Any custom plates will be removed."
        confirmText="Reset"
        cancelText="Cancel"
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        visible={deleteModalVisible}
        onClose={() => setDeleteModalVisible(false)}
        onConfirm={confirmDelete}
        title="Remove Plate"
        message={`Are you sure you want to remove the ${plateToDelete} ${settings.units} plate from your inventory?`}
        confirmText="Remove"
        cancelText="Cancel"
        variant="destructive"
      />
    </SafeAreaView>
  );
}
