import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  ChevronLeft,
  Plus,
  Dumbbell,
  Star,
  Trash2,
  Pencil,
} from 'lucide-react-native';
import { useSettings, useBarbells } from '@/hooks';
import { Card, Button } from '@/components/ui';
import { Input, NumberInput } from '@/components/ui/Input';
import { Modal, ConfirmModal } from '@/components/ui/Modal';
import { RootStackParamList } from '../../App';
import { Barbell } from '@/db/schema';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface BarbellRowProps {
  barbell: Barbell;
  isDark: boolean;
  units: string;
  onEdit: (barbell: Barbell) => void;
  onDelete: (id: string) => void;
  onSetDefault: (id: string) => void;
}

function BarbellRow({ barbell, isDark, units, onEdit, onDelete, onSetDefault }: BarbellRowProps) {
  return (
    <Card className="mb-3">
      <View className="flex-row items-center">
        <View className={`p-2 rounded-lg mr-3 ${isDark ? 'bg-zinc-700' : 'bg-zinc-100'}`}>
          <Dumbbell size={20} color={barbell.isDefault ? '#f97316' : isDark ? '#a1a1aa' : '#71717a'} />
        </View>

        <View className="flex-1">
          <View className="flex-row items-center gap-2">
            <Text className={`font-medium ${isDark ? 'text-white' : 'text-zinc-900'}`}>
              {barbell.name}
            </Text>
            {barbell.isDefault && (
              <View className="flex-row items-center gap-1 px-2 py-0.5 rounded-full bg-orange-500/20">
                <Star size={10} color="#f97316" fill="#f97316" />
                <Text className="text-orange-500 text-xs">Default</Text>
              </View>
            )}
          </View>
          <Text className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
            {barbell.weight} {units}
          </Text>
        </View>

        <View className="flex-row gap-2">
          {!barbell.isDefault && (
            <TouchableOpacity
              onPress={() => onSetDefault(barbell.id)}
              className={`p-2 rounded-lg ${isDark ? 'bg-zinc-700' : 'bg-zinc-100'}`}
            >
              <Star size={18} color={isDark ? '#a1a1aa' : '#71717a'} />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={() => onEdit(barbell)}
            className={`p-2 rounded-lg ${isDark ? 'bg-zinc-700' : 'bg-zinc-100'}`}
          >
            <Pencil size={18} color={isDark ? '#a1a1aa' : '#71717a'} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => onDelete(barbell.id)}
            className={`p-2 rounded-lg ${isDark ? 'bg-zinc-700' : 'bg-zinc-100'}`}
          >
            <Trash2 size={18} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </View>
    </Card>
  );
}

export default function SettingsBarbellsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { effectiveTheme, settings } = useSettings();
  const isDark = effectiveTheme === 'dark';
  const { barbells, refresh, createBarbell, updateBarbell, deleteBarbell, setDefault } = useBarbells();

  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [editingBarbell, setEditingBarbell] = useState<Barbell | null>(null);
  const [barbellToDelete, setBarbellToDelete] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [weight, setWeight] = useState<number | null>(45);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  const openCreateModal = () => {
    setEditingBarbell(null);
    setName('');
    setWeight(45);
    setError(null);
    setModalVisible(true);
  };

  const openEditModal = (barbell: Barbell) => {
    setEditingBarbell(barbell);
    setName(barbell.name);
    setWeight(barbell.weight);
    setError(null);
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setError('Name is required');
      return;
    }
    if (!weight || weight <= 0) {
      setError('Weight must be greater than 0');
      return;
    }

    try {
      setIsSaving(true);
      setError(null);

      if (editingBarbell) {
        await updateBarbell(editingBarbell.id, { name: name.trim(), weight });
      } else {
        await createBarbell({ name: name.trim(), weight });
      }

      setModalVisible(false);
    } catch (_err) {
      setError('Failed to save barbell. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = (id: string) => {
    setBarbellToDelete(id);
    setDeleteModalVisible(true);
  };

  const confirmDelete = async () => {
    if (barbellToDelete) {
      await deleteBarbell(barbellToDelete);
      setBarbellToDelete(null);
    }
    setDeleteModalVisible(false);
  };

  const handleSetDefault = async (id: string) => {
    await setDefault(id);
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
          Barbells
        </Text>
        <TouchableOpacity
          onPress={openCreateModal}
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
            <Dumbbell size={20} color={isDark ? '#71717a' : '#a1a1aa'} />
            <View className="flex-1">
              <Text className={`font-medium mb-1 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                Barbell Configuration
              </Text>
              <Text className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                Configure the barbells available in your gym. The default barbell is used for plate
                calculations when starting a new workout.
              </Text>
            </View>
          </View>
        </Card>

        {/* Barbells List */}
        <View className="mb-4">
          <Text
            className={`text-sm font-medium mb-3 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}
          >
            Your Barbells ({barbells.length})
          </Text>

          {barbells.length === 0 ? (
            <Card variant="outlined" className="items-center py-8">
              <Dumbbell size={48} color={isDark ? '#3f3f46' : '#d4d4d8'} />
              <Text
                className={`mt-4 text-center ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}
              >
                No barbells configured
              </Text>
              <Text
                className={`text-sm text-center mt-1 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}
              >
                Add a barbell to get started with plate calculations
              </Text>
              <Button
                onPress={openCreateModal}
                className="mt-4"
                icon={<Plus size={18} color="#ffffff" />}
              >
                Add Barbell
              </Button>
            </Card>
          ) : (
            barbells.map((barbell) => (
              <BarbellRow
                key={barbell.id}
                barbell={barbell}
                isDark={isDark}
                units={settings.units}
                onEdit={openEditModal}
                onDelete={handleDelete}
                onSetDefault={handleSetDefault}
              />
            ))
          )}
        </View>

        {/* Spacer */}
        <View className="h-8" />
      </ScrollView>

      {/* Add/Edit Modal */}
      <Modal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title={editingBarbell ? 'Edit Barbell' : 'Add Barbell'}
        position="bottom"
      >
        <View className="gap-4">
          <Input
            label="Name"
            value={name}
            onChangeText={setName}
            placeholder="e.g., Olympic Barbell"
            autoCapitalize="words"
          />

          <NumberInput
            label="Weight"
            value={weight}
            onChangeValue={setWeight}
            placeholder="Enter weight"
            suffix={settings.units}
            allowDecimals
            min={0}
            max={100}
          />

          {error && (
            <View className="p-3 rounded-lg bg-red-500/10">
              <Text className="text-red-500 text-center">{error}</Text>
            </View>
          )}

          <View className="flex-row gap-3 mt-2">
            <Button
              onPress={() => setModalVisible(false)}
              variant="secondary"
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onPress={handleSave}
              loading={isSaving}
              disabled={isSaving}
              className="flex-1"
            >
              {editingBarbell ? 'Save' : 'Add'}
            </Button>
          </View>
        </View>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        visible={deleteModalVisible}
        onClose={() => setDeleteModalVisible(false)}
        onConfirm={confirmDelete}
        title="Delete Barbell"
        message="Are you sure you want to delete this barbell? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
      />
    </SafeAreaView>
  );
}
