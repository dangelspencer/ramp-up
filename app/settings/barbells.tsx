import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft, Plus, Trash2, Check, Edit3 } from 'lucide-react-native';
import { useSettings, useBarbells } from '@/hooks';
import { Button, Input, NumberInput, Modal, ConfirmModal } from '@/components/ui';

export default function BarbellsSettingsScreen() {
  const router = useRouter();
  const { effectiveTheme, settings } = useSettings();
  const isDark = effectiveTheme === 'dark';
  const { barbells, createBarbell, updateBarbell, deleteBarbell, setDefault } = useBarbells();

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingBarbell, setEditingBarbell] = useState<{ id: string; name: string; weight: number } | null>(null);
  const [deletingBarbellId, setDeletingBarbellId] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [weight, setWeight] = useState<number | null>(45);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setName('');
    setWeight(45);
  };

  const handleAdd = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a barbell name');
      return;
    }
    if (!weight || weight <= 0) {
      Alert.alert('Error', 'Please enter a valid weight');
      return;
    }

    setIsSubmitting(true);
    try {
      await createBarbell({ name: name.trim(), weight, isDefault: barbells.length === 0 });
      resetForm();
      setShowAddModal(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to add barbell');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async () => {
    if (!editingBarbell) return;
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a barbell name');
      return;
    }
    if (!weight || weight <= 0) {
      Alert.alert('Error', 'Please enter a valid weight');
      return;
    }

    setIsSubmitting(true);
    try {
      await updateBarbell(editingBarbell.id, { name: name.trim(), weight });
      setShowEditModal(false);
      setEditingBarbell(null);
      resetForm();
    } catch (error) {
      Alert.alert('Error', 'Failed to update barbell');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingBarbellId) return;
    try {
      await deleteBarbell(deletingBarbellId);
      setShowDeleteModal(false);
      setDeletingBarbellId(null);
    } catch (error) {
      Alert.alert('Error', 'Failed to delete barbell');
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await setDefault(id);
    } catch (error) {
      Alert.alert('Error', 'Failed to set default barbell');
    }
  };

  const openEditModal = (barbell: { id: string; name: string; weight: number }) => {
    setEditingBarbell(barbell);
    setName(barbell.name);
    setWeight(barbell.weight);
    setShowEditModal(true);
  };

  const openDeleteModal = (id: string) => {
    setDeletingBarbellId(id);
    setShowDeleteModal(true);
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
            Barbells
          </Text>
        </View>
        <TouchableOpacity onPress={() => { resetForm(); setShowAddModal(true); }}>
          <Plus size={24} color="#f97316" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        <Text className={`text-sm mb-4 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
          Configure your barbells. The default barbell weight is used for plate calculations.
        </Text>

        {barbells.length === 0 ? (
          <View className="items-center py-12">
            <Text className={`text-lg font-medium mb-1 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
              No barbells configured
            </Text>
            <Text className={`text-center mb-4 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
              Add your first barbell to get started
            </Text>
            <TouchableOpacity
              onPress={() => { resetForm(); setShowAddModal(true); }}
              className="bg-orange-500 px-6 py-3 rounded-lg"
            >
              <Text className="text-white font-medium">Add Barbell</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View className="gap-2">
            {barbells.map((barbell) => (
              <View
                key={barbell.id}
                className={`rounded-xl p-4 flex-row items-center ${isDark ? 'bg-zinc-800' : 'bg-white'}`}
              >
                <TouchableOpacity
                  onPress={() => handleSetDefault(barbell.id)}
                  className={`w-6 h-6 rounded-full border-2 items-center justify-center mr-3 ${
                    barbell.isDefault
                      ? 'bg-orange-500 border-orange-500'
                      : isDark
                        ? 'border-zinc-600'
                        : 'border-zinc-300'
                  }`}
                >
                  {barbell.isDefault && <Check size={14} color="#ffffff" />}
                </TouchableOpacity>
                <View className="flex-1">
                  <Text className={`font-medium ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                    {barbell.name}
                  </Text>
                  <Text className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                    {barbell.weight} {settings.units === 'imperial' ? 'lbs' : 'kg'}
                    {barbell.isDefault && ' • Default'}
                  </Text>
                </View>
                <View className="flex-row gap-3">
                  <TouchableOpacity onPress={() => openEditModal(barbell)}>
                    <Edit3 size={18} color={isDark ? '#a1a1aa' : '#71717a'} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => openDeleteModal(barbell.id)}>
                    <Trash2 size={18} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        <View className="h-8" />
      </ScrollView>

      {/* Add Modal */}
      <Modal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add Barbell"
        position="bottom"
      >
        <View className="gap-4">
          <Input
            label="Name"
            value={name}
            onChangeText={setName}
            placeholder="e.g., Olympic Barbell"
          />
          <NumberInput
            label="Weight"
            value={weight}
            onChangeValue={setWeight}
            min={0}
            max={100}
            step={5}
            suffix={settings.units === 'imperial' ? 'lbs' : 'kg'}
          />
          <Button onPress={handleAdd} loading={isSubmitting} fullWidth>
            Add Barbell
          </Button>
        </View>
      </Modal>

      {/* Edit Modal */}
      <Modal
        visible={showEditModal}
        onClose={() => { setShowEditModal(false); setEditingBarbell(null); }}
        title="Edit Barbell"
        position="bottom"
      >
        <View className="gap-4">
          <Input
            label="Name"
            value={name}
            onChangeText={setName}
            placeholder="e.g., Olympic Barbell"
          />
          <NumberInput
            label="Weight"
            value={weight}
            onChangeValue={setWeight}
            min={0}
            max={100}
            step={5}
            suffix={settings.units === 'imperial' ? 'lbs' : 'kg'}
          />
          <Button onPress={handleEdit} loading={isSubmitting} fullWidth>
            Save Changes
          </Button>
        </View>
      </Modal>

      {/* Delete Modal */}
      <ConfirmModal
        visible={showDeleteModal}
        onClose={() => { setShowDeleteModal(false); setDeletingBarbellId(null); }}
        onConfirm={handleDelete}
        title="Delete Barbell?"
        message="Are you sure you want to delete this barbell? Exercises using this barbell will no longer have plate calculations."
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
      />
    </SafeAreaView>
  );
}
