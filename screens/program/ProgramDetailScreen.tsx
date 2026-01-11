import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ChevronLeft, Trash2, Play, Check, Plus, X, Pencil, GripVertical } from 'lucide-react-native';

import { useSettings, usePrograms, useRoutines, useProgram } from '@/hooks';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input, NumberInput } from '@/components/ui/Input';
import { Modal, ConfirmModal } from '@/components/ui/Modal';
import { SegmentedControl } from '@/components/ui/Select';
import { IconBox } from '@/components/ui/IconBox';
import { programService } from '@/services/program.service';
import { RootStackParamList } from '../../App';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type RouteType = RouteProp<RootStackParamList, 'ProgramDetail'>;

export default function ProgramDetailScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteType>();
  const { id } = route.params;

  const { effectiveTheme } = useSettings();
  const isDark = effectiveTheme === 'dark';

  const { program, isLoading, refresh } = useProgram(id);
  const { setActive, deleteProgram, refresh: refreshPrograms } = usePrograms();
  const { routines } = useRoutines();

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editType, setEditType] = useState<'continuous' | 'finite'>('continuous');
  const [editTotalWorkouts, setEditTotalWorkouts] = useState<number | null>(null);
  const [editRoutineIds, setEditRoutineIds] = useState<string[]>([]);
  const [isRoutineModalOpen, setIsRoutineModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (program) {
      setEditName(program.name);
      setEditType(program.type);
      setEditTotalWorkouts(program.totalWorkouts);
      setEditRoutineIds(program.routines.map((r) => r.routineId));
    }
  }, [program]);

  const handleBack = () => {
    navigation.goBack();
  };

  const handleStartEditing = () => {
    setIsEditing(true);
  };

  const handleCancelEditing = () => {
    if (program) {
      setEditName(program.name);
      setEditType(program.type);
      setEditTotalWorkouts(program.totalWorkouts);
      setEditRoutineIds(program.routines.map((r) => r.routineId));
    }
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!editName.trim()) {
      Alert.alert('Error', 'Program name is required');
      return;
    }

    if (editRoutineIds.length === 0) {
      Alert.alert('Error', 'Select at least one routine');
      return;
    }

    try {
      setIsSaving(true);
      await programService.update(id, {
        name: editName.trim(),
        type: editType,
        totalWorkouts: editType === 'finite' ? editTotalWorkouts : null,
      });
      await programService.updateRoutines(id, editRoutineIds);
      await refresh();
      await refreshPrograms();
      setIsEditing(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to update program. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSetActive = async () => {
    try {
      await setActive(id);
      await refresh();
      await refreshPrograms();
      Alert.alert('Success', 'Program is now active');
    } catch (error) {
      Alert.alert('Error', 'Failed to activate program');
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await deleteProgram(id);
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to delete program');
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const handleStartWorkout = () => {
    if (program && program.routines.length > 0) {
      const currentIndex = (program.currentPosition ?? 0) % program.routines.length;
      const routineId = program.routines[currentIndex]?.routineId;
      if (routineId) {
        navigation.navigate('Workout', { routineId });
      }
    }
  };

  const handleAddRoutine = (routineId: string) => {
    if (!editRoutineIds.includes(routineId)) {
      setEditRoutineIds([...editRoutineIds, routineId]);
    }
    setIsRoutineModalOpen(false);
  };

  const handleRemoveRoutine = (routineId: string) => {
    setEditRoutineIds(editRoutineIds.filter((rid) => rid !== routineId));
  };

  const moveRoutine = (fromIndex: number, direction: 'up' | 'down') => {
    const toIndex = direction === 'up' ? fromIndex - 1 : fromIndex + 1;
    if (toIndex < 0 || toIndex >= editRoutineIds.length) return;

    const newIds = [...editRoutineIds];
    [newIds[fromIndex], newIds[toIndex]] = [newIds[toIndex], newIds[fromIndex]];
    setEditRoutineIds(newIds);
  };

  const getRoutineName = (routineId: string) => {
    return routines.find((r) => r.id === routineId)?.name ?? 'Unknown Routine';
  };

  const availableRoutines = routines.filter(
    (r) => !editRoutineIds.includes(r.id)
  );

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1" style={{ backgroundColor: isDark ? '#09090b' : '#f4f4f5' }}>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#f97316" />
        </View>
      </SafeAreaView>
    );
  }

  if (!program) {
    return (
      <SafeAreaView className="flex-1" style={{ backgroundColor: isDark ? '#09090b' : '#f4f4f5' }}>
        <View className="flex-1 items-center justify-center px-4">
          <Text className={`text-lg ${isDark ? 'text-white' : 'text-zinc-900'}`}>
            Program not found
          </Text>
          <Button onPress={handleBack} className="mt-4">
            Go Back
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  const currentRoutineIndex = (program.currentPosition ?? 0) % program.routines.length;
  const currentRoutine = program.routines[currentRoutineIndex];

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
            {isEditing ? 'Edit Program' : 'Program Details'}
          </Text>
          {isEditing ? (
            <TouchableOpacity
              onPress={handleCancelEditing}
              className={`p-2 rounded-lg ${isDark ? 'bg-zinc-800' : 'bg-white'}`}
            >
              <X size={24} color={isDark ? '#ffffff' : '#18181b'} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={handleStartEditing}
              className="p-2 rounded-lg bg-orange-500"
            >
              <Pencil size={20} color="#ffffff" />
            </TouchableOpacity>
          )}
        </View>

        <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
          {isEditing ? (
            <>
              {/* Edit Mode */}
              <View className="mb-6">
                <Input
                  label="Program Name"
                  value={editName}
                  onChangeText={setEditName}
                  placeholder="e.g., Strength Building"
                />
              </View>

              <View className="mb-6 mt-4">
                <Text className={`text-sm font-medium mb-2 ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
                  Program Type
                </Text>
                <SegmentedControl
                  value={editType}
                  onValueChange={(value) => setEditType(value as 'continuous' | 'finite')}
                  options={[
                    { value: 'continuous', label: 'Continuous' },
                    { value: 'finite', label: 'Finite' },
                  ]}
                  isDark={isDark}
                />
              </View>

              {editType === 'finite' && (
                <View className="mb-6 mt-4">
                  <NumberInput
                    label="Total Workouts"
                    value={editTotalWorkouts}
                    onChangeValue={setEditTotalWorkouts}
                    min={1}
                    max={365}
                    placeholder="12"
                  />
                </View>
              )}

              <View className="mb-6 mt-4">
                <View className="flex-row items-center justify-between mb-2">
                  <Text className={`text-sm font-medium ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
                    Routines
                  </Text>
                  <TouchableOpacity
                    onPress={() => setIsRoutineModalOpen(true)}
                    className="flex-row items-center"
                  >
                    <Plus size={16} color="#f97316" />
                    <Text className="text-orange-500 font-medium ml-1">Add</Text>
                  </TouchableOpacity>
                </View>

                {editRoutineIds.length === 0 ? (
                  <Card>
                    <View className="items-center py-6">
                      <Text className={isDark ? 'text-zinc-400' : 'text-zinc-500'}>
                        No routines added yet
                      </Text>
                    </View>
                  </Card>
                ) : (
                  <View className="gap-2">
                    {editRoutineIds.map((routineId, index) => (
                      <Card key={routineId}>
                        <View className="flex-row items-center">
                          <GripVertical size={20} color={isDark ? '#71717a' : '#a1a1aa'} />
                          <View className="flex-1 ml-2">
                            <Text className={`font-medium ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                              {getRoutineName(routineId)}
                            </Text>
                            <Text className={`text-sm ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                              Position {index + 1}
                            </Text>
                          </View>
                          <View className="flex-row items-center gap-2">
                            <TouchableOpacity
                              onPress={() => moveRoutine(index, 'up')}
                              disabled={index === 0}
                              className={`p-2 rounded-lg ${isDark ? 'bg-zinc-700' : 'bg-zinc-200'} ${index === 0 ? 'opacity-30' : ''}`}
                            >
                              <Text className={isDark ? 'text-white' : 'text-zinc-900'}>Up</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              onPress={() => moveRoutine(index, 'down')}
                              disabled={index === editRoutineIds.length - 1}
                              className={`p-2 rounded-lg ${isDark ? 'bg-zinc-700' : 'bg-zinc-200'} ${index === editRoutineIds.length - 1 ? 'opacity-30' : ''}`}
                            >
                              <Text className={isDark ? 'text-white' : 'text-zinc-900'}>Down</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              onPress={() => handleRemoveRoutine(routineId)}
                              style={{
                                padding: 8,
                                borderRadius: 8,
                                backgroundColor: isDark ? 'rgba(127, 29, 29, 0.3)' : '#fee2e2',
                              }}
                            >
                              <X size={18} color="#ef4444" />
                            </TouchableOpacity>
                          </View>
                        </View>
                      </Card>
                    ))}
                  </View>
                )}
              </View>
            </>
          ) : (
            <>
              {/* View Mode */}
              {/* Status Badge */}
              <View className="flex-row items-center mb-4">
                {program.isActive && (
                  <View className="bg-green-500/20 px-3 py-1 rounded-full mr-2">
                    <Text className="text-green-500 text-sm font-medium">Active</Text>
                  </View>
                )}
                <View className={`${isDark ? 'bg-zinc-800' : 'bg-zinc-200'} px-3 py-1 rounded-full`}>
                  <Text className={isDark ? 'text-zinc-300' : 'text-zinc-600'}>
                    {program.type === 'continuous' ? 'Continuous' : 'Finite'}
                  </Text>
                </View>
              </View>

              {/* Program Info */}
              <Card className="mb-4">
                <Text className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                  {program.name}
                </Text>
                <View className="flex-row items-center">
                  <Text className={isDark ? 'text-zinc-400' : 'text-zinc-500'}>
                    {program.routines.length} routine{program.routines.length !== 1 ? 's' : ''}
                  </Text>
                  {program.type === 'finite' && program.totalWorkouts && (
                    <>
                      <Text className={`mx-2 ${isDark ? 'text-zinc-600' : 'text-zinc-300'}`}>|</Text>
                      <Text className={isDark ? 'text-zinc-400' : 'text-zinc-500'}>
                        {program.currentPosition ?? 0} / {program.totalWorkouts} workouts
                      </Text>
                    </>
                  )}
                </View>
              </Card>

              {/* Current/Next Routine */}
              {currentRoutine && (
                <Card className="mb-4">
                  <Text className={`text-sm font-medium mb-2 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                    Next Workout
                  </Text>
                  <Text className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                    {currentRoutine.routine.name}
                  </Text>
                  {program.isActive && (
                    <Button
                      onPress={handleStartWorkout}
                      icon={<Play size={18} color="white" />}
                      className="mt-3"
                      fullWidth
                    >
                      Start Workout
                    </Button>
                  )}
                </Card>
              )}

              {/* Routine Order */}
              <View className="mb-6">
                <Text className={`text-sm font-medium mb-2 ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
                  Routine Order
                </Text>
                <View className="gap-2">
                  {program.routines.map((pr, index) => (
                    <Card key={pr.id}>
                      <View className="flex-row items-center">
                        <IconBox
                          size="sm"
                          variant={index === currentRoutineIndex ? 'primary' : isDark ? 'muted-dark' : 'muted'}
                          rounded="full"
                          className="mr-3"
                        >
                          <Text
                            className={`font-semibold ${
                              index === currentRoutineIndex
                                ? 'text-white'
                                : isDark
                                ? 'text-zinc-300'
                                : 'text-zinc-600'
                            }`}
                          >
                            {index + 1}
                          </Text>
                        </IconBox>
                        <View className="flex-1">
                          <Text className={`font-medium ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                            {pr.routine.name}
                          </Text>
                          {index === currentRoutineIndex && (
                            <Text className="text-orange-500 text-sm">Current</Text>
                          )}
                        </View>
                        {index === currentRoutineIndex && (
                          <Check size={20} color="#f97316" />
                        )}
                      </View>
                    </Card>
                  ))}
                </View>
              </View>

              {/* Action Buttons */}
              <View className="mt-4">
                {!program.isActive && (
                  <Button
                    onPress={handleSetActive}
                    variant="secondary"
                    fullWidth
                    className="mt-4"
                  >
                    Set as Active Program
                  </Button>
                )}

                <Button
                  onPress={() => setShowDeleteModal(true)}
                  variant="destructive"
                  icon={<Trash2 size={18} color="white" />}
                  fullWidth
                  className='mt-4'
                >
                  Delete Program
                </Button>
              </View>
            </>
          )}

          {/* Spacer */}
          <View className="h-24" />
        </ScrollView>

        {/* Save Button (Edit Mode) */}
        {isEditing && (
          <View className={`px-4 py-4 ${isDark ? 'bg-zinc-950' : 'bg-zinc-100'}`}>
            <Button
              onPress={handleSave}
              loading={isSaving}
              disabled={isSaving}
              fullWidth
            >
              Save Changes
            </Button>
          </View>
        )}
      </View>

      {/* Routine Selection Modal */}
      <Modal
        visible={isRoutineModalOpen}
        onClose={() => setIsRoutineModalOpen(false)}
        title="Select Routine"
        position="bottom"
      >
        <ScrollView className="max-h-80">
          {availableRoutines.length === 0 ? (
            <View className="items-center py-6">
              <Text className={isDark ? 'text-zinc-400' : 'text-zinc-500'}>
                {routines.length === 0
                  ? 'No routines available'
                  : 'All routines have been added'}
              </Text>
            </View>
          ) : (
            availableRoutines.map((routine) => (
              <TouchableOpacity
                key={routine.id}
                onPress={() => handleAddRoutine(routine.id)}
                className={`flex-row items-center justify-between py-3 px-2 border-b ${
                  isDark ? 'border-zinc-800' : 'border-zinc-100'
                }`}
              >
                <Text className={`font-medium ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                  {routine.name}
                </Text>
                <Plus size={20} color="#f97316" />
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        visible={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete Program"
        message={`Are you sure you want to delete "${program.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        loading={isDeleting}
      />
    </SafeAreaView>
  );
}
