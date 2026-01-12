import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ChevronLeft, Pencil, Trash2, X, TrendingUp, Clock, Dumbbell } from 'lucide-react-native';

import { useSettings, useExercises, useBarbells } from '@/hooks';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input, NumberInput } from '@/components/ui/Input';
import { Select, SegmentedControl } from '@/components/ui/Select';
import { Switch } from '@/components/ui/Switch';
import { ConfirmModal } from '@/components/ui/Modal';
import { formatWeight } from '@/utils/formatting';
import { exerciseService, ExerciseWithBarbell } from '@/services/exercise.service';
import { RootStackParamList } from '../../App';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type RouteType = RouteProp<RootStackParamList, 'ExerciseDetail'>;

export default function ExerciseDetailScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteType>();
  const { id } = route.params;

  const { effectiveTheme, settings } = useSettings();
  const isDark = effectiveTheme === 'dark';
  const units = settings.units;
  const unitLabel = units === 'imperial' ? 'lbs' : 'kg';

  const { updateExercise, deleteExercise, refresh: refreshExercises } = useExercises();
  const { barbells } = useBarbells();

  const [exercise, setExercise] = useState<ExerciseWithBarbell | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Edit state
  const [editName, setEditName] = useState('');
  const [editMaxWeight, setEditMaxWeight] = useState<number | null>(null);
  const [editWeightIncrement, setEditWeightIncrement] = useState<'2.5' | '5'>('5');
  const [editAutoProgression, setEditAutoProgression] = useState(true);
  const [editBarbellId, setEditBarbellId] = useState<string>('');
  const [editDefaultRestTime, setEditDefaultRestTime] = useState<number | null>(90);

  const loadExercise = async () => {
    try {
      setIsLoading(true);
      const data = await exerciseService.getByIdWithBarbell(id);
      setExercise(data ?? null);
      if (data) {
        initEditState(data);
      }
    } catch (error) {
      console.error('Failed to load exercise:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const initEditState = (data: ExerciseWithBarbell) => {
    setEditName(data.name);
    // Convert from lbs to user's units
    const weightInUserUnits = units === 'metric' ? data.maxWeight / 2.20462 : data.maxWeight;
    setEditMaxWeight(Math.round(weightInUserUnits * 10) / 10);

    const incrementInUserUnits = units === 'metric' ? data.weightIncrement / 2.20462 : data.weightIncrement;
    setEditWeightIncrement(incrementInUserUnits <= 2.5 ? '2.5' : '5');

    setEditAutoProgression(data.autoProgression ?? true);
    setEditBarbellId(data.barbellId ?? '');
    setEditDefaultRestTime(data.defaultRestTime ?? 90);
  };

  useEffect(() => {
    loadExercise();
  }, [id]);

  const handleBack = () => {
    navigation.goBack();
  };

  const handleStartEditing = () => {
    setIsEditing(true);
  };

  const handleCancelEditing = () => {
    if (exercise) {
      initEditState(exercise);
    }
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!editName.trim()) {
      Alert.alert('Error', 'Exercise name is required');
      return;
    }

    if (editMaxWeight === null || editMaxWeight <= 0) {
      Alert.alert('Error', 'Max weight is required and must be greater than 0');
      return;
    }

    try {
      setIsSaving(true);

      // Convert weight to lbs if user is using kg
      let weightInLbs = editMaxWeight;
      let incrementInLbs = parseFloat(editWeightIncrement);

      if (units === 'metric') {
        weightInLbs = editMaxWeight * 2.20462;
        incrementInLbs = incrementInLbs * 2.20462;
      }

      await updateExercise(id, {
        name: editName.trim(),
        maxWeight: weightInLbs,
        weightIncrement: incrementInLbs,
        autoProgression: editAutoProgression,
        barbellId: editBarbellId || null,
        defaultRestTime: editDefaultRestTime ?? 90,
      });

      await loadExercise();
      await refreshExercises();
      setIsEditing(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to update exercise. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await deleteExercise(id);
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to delete exercise');
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const barbellOptions = [
    { value: '', label: 'None (bodyweight/dumbbell)' },
    ...barbells.map((b) => ({
      value: b.id,
      label: `${b.name} (${formatWeight(b.weight, settings.units)})`,
    })),
  ];

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1" style={{ backgroundColor: isDark ? '#09090b' : '#f4f4f5' }}>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#f97316" />
        </View>
      </SafeAreaView>
    );
  }

  if (!exercise) {
    return (
      <SafeAreaView className="flex-1" style={{ backgroundColor: isDark ? '#09090b' : '#f4f4f5' }}>
        <View className="flex-1 items-center justify-center px-4">
          <Text className={`text-lg ${isDark ? 'text-white' : 'text-zinc-900'}`}>
            Exercise not found
          </Text>
          <Button onPress={handleBack} className="mt-4">
            Go Back
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  // Display values in user's units
  const displayMaxWeight = units === 'metric' ? exercise.maxWeight / 2.20462 : exercise.maxWeight;
  const displayIncrement = units === 'metric' ? exercise.weightIncrement / 2.20462 : exercise.weightIncrement;

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
            {isEditing ? 'Edit Exercise' : 'Exercise Details'}
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
                  label="Exercise Name"
                  value={editName}
                  onChangeText={setEditName}
                  placeholder="e.g., Bench Press"
                />
              </View>

              <View className="mb-6 mt-4">
                <NumberInput
                  label={`Current Max Weight (${unitLabel})`}
                  value={editMaxWeight}
                  onChangeValue={setEditMaxWeight}
                  min={0}
                  allowDecimals
                  placeholder="135"
                  suffix={unitLabel}
                />
              </View>

              <View className="mb-6 mt-4">
                <Text className={`text-sm font-medium mb-2 ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
                  Weight Increment
                </Text>
                <SegmentedControl
                  value={editWeightIncrement}
                  onValueChange={(value) => setEditWeightIncrement(value as '2.5' | '5')}
                  options={[
                    { value: '2.5', label: `2.5 ${unitLabel}` },
                    { value: '5', label: `5 ${unitLabel}` },
                  ]}
                  isDark={isDark}
                />
              </View>

              <View className="mb-6 mt-4">
                <Select
                  label="Barbell"
                  value={editBarbellId}
                  onValueChange={setEditBarbellId}
                  options={barbellOptions}
                  placeholder="Select a barbell (optional)"
                />
              </View>

              <View className="mb-6 mt-4">
                <NumberInput
                  label="Default Rest Time"
                  value={editDefaultRestTime}
                  onChangeValue={setEditDefaultRestTime}
                  min={0}
                  max={600}
                  placeholder="90"
                  suffix="sec"
                />
              </View>

              <Card className="mb-6 mt-4">
                <Switch
                  value={editAutoProgression}
                  onValueChange={setEditAutoProgression}
                  label="Auto Progression"
                  description="Automatically increase weight when you complete all sets"
                />
              </Card>
            </>
          ) : (
            <>
              {/* View Mode */}
              {/* Exercise Info Card */}
              <Card className="mb-4">
                <View className="flex-row items-center mb-3">
                  <View className={`p-3 rounded-lg mr-3 ${isDark ? 'bg-zinc-700' : 'bg-zinc-100'}`}>
                    <Dumbbell size={24} color="#f97316" />
                  </View>
                  <View className="flex-1">
                    <Text className={`text-xl font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                      {exercise.name}
                    </Text>
                    {exercise.barbell && (
                      <Text className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                        Uses {exercise.barbell.name}
                      </Text>
                    )}
                  </View>
                </View>

                {/* Auto Progression Badge */}
                {exercise.autoProgression && (
                  <View className="bg-green-500/20 px-3 py-1 rounded-full self-start">
                    <Text className="text-green-500 text-sm font-medium">Auto Progression</Text>
                  </View>
                )}
              </Card>

              {/* Stats Grid */}
              <View className="flex-row gap-3 mb-4">
                <Card className="flex-1">
                  <View className="items-center">
                    <TrendingUp size={20} color="#f97316" />
                    <Text className={`text-2xl font-bold mt-2 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                      {formatWeight(displayMaxWeight, settings.units)}
                    </Text>
                    <Text className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                      Max Weight
                    </Text>
                  </View>
                </Card>

                <Card className="flex-1">
                  <View className="items-center">
                    <TrendingUp size={20} color="#22c55e" />
                    <Text className={`text-2xl font-bold mt-2 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                      +{formatWeight(displayIncrement, settings.units)}
                    </Text>
                    <Text className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                      Increment
                    </Text>
                  </View>
                </Card>
              </View>

              {/* Rest Time */}
              <Card className="mb-4">
                <View className="flex-row items-center">
                  <View className={`p-2 rounded-lg mr-3 ${isDark ? 'bg-zinc-700' : 'bg-zinc-100'}`}>
                    <Clock size={20} color={isDark ? '#a1a1aa' : '#71717a'} />
                  </View>
                  <View className="flex-1">
                    <Text className={`font-medium ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                      Default Rest Time
                    </Text>
                    <Text className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                      {exercise.defaultRestTime ?? 90} seconds between sets
                    </Text>
                  </View>
                </View>
              </Card>

              {/* Barbell Info */}
              {exercise.barbell && (
                <Card className="mb-4">
                  <View className="flex-row items-center">
                    <View className={`p-2 rounded-lg mr-3 ${isDark ? 'bg-zinc-700' : 'bg-zinc-100'}`}>
                      <Dumbbell size={20} color={isDark ? '#a1a1aa' : '#71717a'} />
                    </View>
                    <View className="flex-1">
                      <Text className={`font-medium ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                        {exercise.barbell.name}
                      </Text>
                      <Text className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                        Bar weight: {formatWeight(exercise.barbell.weight, settings.units)}
                      </Text>
                    </View>
                  </View>
                </Card>
              )}

              {/* Progression Info */}
              <Card variant="outlined" className="mb-6">
                <Text className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                  {exercise.autoProgression
                    ? `When you successfully complete all sets at ${formatWeight(displayMaxWeight, settings.units)}, the weight will automatically increase to ${formatWeight(displayMaxWeight + displayIncrement, settings.units)}.`
                    : 'Auto progression is disabled. Update the max weight manually when you are ready to progress.'}
                </Text>
              </Card>

              {/* Delete Button */}
              <Button
                onPress={() => setShowDeleteModal(true)}
                variant="destructive"
                icon={<Trash2 size={18} color="white" />}
                fullWidth
                className='mt-4'
              >
                Delete Exercise
              </Button>
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

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        visible={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete Exercise"
        message={`Are you sure you want to delete "${exercise.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        loading={isDeleting}
      />
    </SafeAreaView>
  );
}
